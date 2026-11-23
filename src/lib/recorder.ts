// Session recording, only for visitors who chose Allow.
// Forms are blocked whole (they replay as an empty box), so nothing typed can be in a recording,
// and pages that show a family's own details are never recorded at all.

import { getChoice, isPrivatePath, lastingId } from "./consent";
import { endpoint, sessionId } from "./track";

const FLUSH_MS = 10000;
const FLUSH_CHARS = 400_000;
const MAX_PIECES = 60;

let stopFn: (() => void) | null = null;
let starting = false;
let buffer: string[] = [];
let chars = 0;
let rec = "";
let seq = 0;
let lastPath = "/"; // page the buffered events came from: on the way out the address has already changed
let timer: ReturnType<typeof setInterval> | undefined;

async function flush(closing = false) {
  const vid = lastingId();
  const base = endpoint("/r");
  if (!buffer.length || !vid || !base || !rec) return;
  if (seq >= MAX_PIECES) return stopRecording();
  const text = `[${buffer.join(",")}]`;
  buffer = [];
  chars = 0;
  const q = new URLSearchParams({ rec, seq: String(seq++), v: vid, s: sessionId(), p: lastPath });
  try {
    const gz = await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
    await fetch(`${base}?${q}`, {
      method: "POST",
      body: new Blob([gz], { type: "text/plain" }),
      mode: "no-cors",
      keepalive: closing && gz.byteLength < 60000,
    });
  } catch {}
}

export async function startRecording() {
  if (stopFn || starting || isPrivatePath(location.pathname)) return;
  if (getChoice()?.value !== "allow" || !lastingId() || !endpoint("/r")) return;
  if (typeof CompressionStream === "undefined") return;
  // Do not spend a family's data pack on this.
  const net = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (net?.saveData || /2g/.test(net?.effectiveType || "")) return;
  starting = true;
  try {
    const { record } = await import("@rrweb/record");
    // The choice or the page may have changed while this loaded.
    if (!lastingId() || isPrivatePath(location.pathname)) return;
    rec = [...crypto.getRandomValues(new Uint8Array(12))].map((b) => (b % 36).toString(36)).join("") + Date.now().toString(36).slice(-6);
    seq = 0;
    buffer = [];
    chars = 0;
    const stop = record({
      emit(event) {
        const s = JSON.stringify(event);
        if (!isPrivatePath(location.pathname)) lastPath = location.pathname;
        buffer.push(s);
        chars += s.length;
        if (chars > FLUSH_CHARS) void flush();
      },
      blockSelector: "form, iframe, [data-private]",
      maskAllInputs: true,
      recordCanvas: false,
      collectFonts: false,
      inlineImages: false,
      sampling: { mousemove: 100, scroll: 200, media: 800, input: "last" },
      slimDOMOptions: "all",
    });
    stopFn = stop ?? null;
    timer = setInterval(() => void flush(), FLUSH_MS);
    document.addEventListener("visibilitychange", onHide);
  } catch {
    // A recorder problem must never reach the visitor.
  } finally {
    starting = false;
  }
}

function onHide() {
  if (document.visibilityState === "hidden") void flush(true);
}

/** Stop. `discard` drops anything not yet sent (the visitor withdrew). */
export function stopRecording(discard = false) {
  if (!stopFn) return;
  stopFn();
  stopFn = null;
  clearInterval(timer);
  document.removeEventListener("visibilitychange", onHide);
  if (discard) buffer = [];
  else void flush(true);
}
