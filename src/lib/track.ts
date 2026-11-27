// Visitor analytics -> kp-pulse Cloudflare Worker (see ../website-analytics).
// No cookies, no personal data: a random per-tab session id lives in sessionStorage. A lasting id
// is added only for visitors who chose Allow (see consent.ts).
// Disabled unless NEXT_PUBLIC_PULSE_URL is set at build time.

import { lastingId } from "./consent";

const ENDPOINT = process.env.NEXT_PUBLIC_PULSE_URL;

type Payload = Record<string, string | number | undefined>;

const IGNORE_KEY = "kp_pulse_ignore";

/**
 * True when this browser must send nothing:
 * - the school's own devices, switched off once with ?pulse_ignore=1 (and back on with ?pulse_ignore=0);
 * - automated browsers (Playwright, headless Chrome: navigator.webdriver), unless a test asks with ?pulse
 *   or the local test build sets NEXT_PUBLIC_PULSE_LOCAL.
 */
let ignoredCache: boolean | null = null;
export function ignored(): boolean {
  if (typeof window === "undefined") return true;
  if (ignoredCache !== null) return ignoredCache;
  let off = false;
  try {
    const q = new URLSearchParams(location.search).get("pulse_ignore");
    if (q === "1") {
      localStorage.setItem(IGNORE_KEY, "1");
      console.info("Kids Planet: visits from this browser are no longer counted. Undo with ?pulse_ignore=0");
    } else if (q === "0") {
      localStorage.removeItem(IGNORE_KEY);
      console.info("Kids Planet: visits from this browser are counted again.");
    }
    off = localStorage.getItem(IGNORE_KEY) === "1";
  } catch {}
  const asked = !!process.env.NEXT_PUBLIC_PULSE_LOCAL || location.search.includes("pulse=") || /[?&]pulse(&|$)/.test(location.search);
  if (!off && navigator.webdriver && !asked) off = true;
  ignoredCache = off;
  return off;
}

/** Collector address for a path, or null when analytics is off here. */
export function endpoint(path: "/b" | "/r"): string | null {
  if (!ENDPOINT || typeof window === "undefined") return null;
  if (location.hostname === "localhost" && !process.env.NEXT_PUBLIC_PULSE_LOCAL) return null;
  if (ignored()) return null;
  return ENDPOINT.replace(/\/p$/, path);
}

export function sessionId(): string {
  try {
    let s = sessionStorage.getItem("kp_s");
    if (!s) {
      s = Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem("kp_s", s);
    }
    return s;
  } catch {
    return "nostore";
  }
}

export function send(data: Payload) {
  if (!ENDPOINT || typeof window === "undefined") return;
  if (location.hostname === "localhost" && !process.env.NEXT_PUBLIC_PULSE_LOCAL && !location.search.includes("pulse")) return;
  if (ignored()) return;
  const body = JSON.stringify({ ...data, s: sessionId(), v: lastingId(), p: data.p ?? location.pathname });
  try {
    // text/plain keeps this a "simple" request: no CORS preflight.
    const blob = new Blob([body], { type: "text/plain" });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
  } catch {}
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => {});
}

/** Record a conversion-style event, e.g. track("whatsapp_click", "admissions hero"). */
export function track(name: string, label?: string) {
  send({ t: "ev", n: name, lb: label });
}
