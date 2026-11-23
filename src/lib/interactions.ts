// What people do between page views: clicks, frustrated and dead clicks, sections read, which form
// fields are opened and for how long, where a form is given up, and errors shown.
//
// Hard rule: nothing a visitor types is ever read into a report. Fields are named by their `name`
// attribute, with only "filled or not". Pages showing a family's own details send no on-screen text.

import { isPrivatePath, lastingId } from "./consent";
import { endpoint, sessionId } from "./track";

type Act = {
  k: "click" | "rage" | "dead" | "section" | "field" | "quit" | "ferr" | "jserr";
  t?: string;
  l?: string;
  n1?: number;
  n2?: number;
  n3?: number;
  p: string;
  at: number;
};

let queue: Act[] = [];
let sent = 0;
const MAX_PER_PAGE_LOAD = 600;

const here = () => location.pathname;

function add(a: Omit<Act, "p" | "at"> & { p?: string }) {
  if (sent + queue.length >= MAX_PER_PAGE_LOAD) return;
  queue.push({ ...a, p: a.p ?? here(), at: Date.now() });
  if (queue.length >= 30) flushActs();
}

export function flushActs() {
  const url = endpoint("/b");
  if (!url || !queue.length) return;
  const now = Date.now();
  const batch = queue.slice(0, 60);
  queue = queue.slice(60);
  sent += batch.length;
  const body = JSON.stringify({
    s: sessionId(),
    v: lastingId(),
    p: here(),
    vw: window.innerWidth,
    a: batch.map(({ at, ...a }) => ({ ...a, ago: now - at })),
  });
  try {
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) return;
  } catch {}
  fetch(url, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => {});
}

/** Error text can quote what someone typed: strip emails, anything quoted, and any run of digits. */
export function scrub(s: string): string {
  return s
    .replace(/\S+@\S+/g, "(email)")
    .replace(/["“”'‘][^"“”'‘]{1,60}["“”'’]/g, "(text)")
    .replace(/\d[\d\s-]{2,}\d/g, "(number)")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

const clean = (s: string | null | undefined, n = 60) => (s || "").replace(/\s+/g, " ").trim().slice(0, n);

function clickTarget(el: Element): { el: Element; name: string; to?: string } | null {
  const hit = el.closest("a[href], button, summary, [role=button], input[type=submit], input[type=button]");
  if (!hit) return null;
  const priv = isPrivatePath(here());
  // Header, footer and bottom bar are the same on every page, so their wording is safe anywhere.
  const chrome = !!hit.closest("header, footer, [data-site-bar]");
  const submit = hit instanceof HTMLButtonElement && hit.type === "submit";
  const name =
    priv && !chrome
      ? submit && here().startsWith("/admissions/apply")
        ? clean(hit.textContent)
        : hit.tagName.toLowerCase()
      : clean(hit.getAttribute("aria-label") || hit.textContent) || hit.tagName.toLowerCase();
  let to: string | undefined;
  if (hit instanceof HTMLAnchorElement) {
    // Path only. Query strings are dropped: a WhatsApp link can carry a typed message.
    to = /^https?:$/.test(hit.protocol)
      ? (hit.host === location.host ? "" : hit.host) + (hit.host === location.host ? hit.pathname + hit.hash : "")
      : hit.protocol;
    if (priv && !chrome) to = undefined;
  }
  return { el: hit, name, to };
}

function fieldName(el: Element): string | null {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) return null;
  if (!el.closest("form")) return null;
  if (el instanceof HTMLInputElement && ["submit", "button", "hidden"].includes(el.type)) return null;
  const n = el.name || el.id;
  return n && /^[\w:.-]{1,40}$/.test(n) ? n : el.tagName.toLowerCase();
}

function formName(el: Element): string {
  const f = el.closest("form");
  return clean(f?.getAttribute("data-form") || f?.id, 40) || here();
}

function sectionName(el: Element, i: number): string {
  return el.id ? `#${el.id}` : clean(el.querySelector("h1, h2, h3")?.textContent) || `section ${i + 1}`;
}

/** Listeners that live for the whole visit. Returns a cleanup. */
export function startInteractions(): () => void {
  if (!endpoint("/b")) return () => {};
  let recent: { x: number; y: number; t: number }[] = [];
  let lastRage = 0;

  const onClick = (e: MouseEvent) => {
    if (!e.isTrusted) return;
    const el = e.target as Element | null;
    if (!el?.closest) return;
    const pos = {
      n2: Math.round((e.clientX / Math.max(1, window.innerWidth)) * 100),
      n3: Math.round(e.pageY),
    };
    const hit = clickTarget(el);
    if (hit) add({ k: "click", t: hit.name, l: hit.to, ...pos });
    else if (!isPrivatePath(here()) && !el.closest("input, select, textarea, label, option")) {
      // Looks tappable but does nothing.
      if (el.tagName === "IMG" || getComputedStyle(el).cursor === "pointer") {
        add({ k: "dead", t: clean(el.getAttribute("alt") || el.textContent) || el.tagName.toLowerCase(), l: el.tagName.toLowerCase(), ...pos });
      }
    }
    const now = Date.now();
    recent = [...recent.filter((c) => now - c.t < 1000), { x: e.clientX, y: e.clientY, t: now }];
    const burst = recent.filter((c) => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 30).length;
    if (burst >= 3 && now - lastRage > 3000 && !el.closest("input, select, textarea")) {
      lastRage = now;
      add({ k: "rage", t: hit?.name ?? (isPrivatePath(here()) ? el.tagName.toLowerCase() : clean(el.textContent) || el.tagName.toLowerCase()), ...pos, n1: burst });
    }
  };

  let open: { name: string; form: string; path: string; at: number } | null = null;
  const visits = new Map<string, number>();
  let touched: { form: string; field: string; path: string } | null = null;
  let tried: { form: string; field: string; path: string } | null = null; // pressed Send; not given up unless a message came back

  const closeField = (el: Element | null) => {
    if (!open) return;
    const key = `${open.path}|${open.form}|${open.name}`;
    const n = (visits.get(key) || 0) + 1;
    visits.set(key, n);
    const filled =
      el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")
        ? el.checked
        : el instanceof HTMLInputElement && el.type === "password"
          ? undefined
          : el && "value" in el
            ? (el as HTMLInputElement).value !== ""
            : undefined;
    add({ k: "field", t: open.form, l: open.name, p: open.path, n1: Date.now() - open.at, n2: n, n3: filled === undefined ? undefined : filled ? 1 : 0 });
    open = null;
  };
  const onIn = (e: FocusEvent) => {
    const el = e.target as Element | null;
    const name = el && fieldName(el);
    if (!el || !name) return;
    const form = formName(el);
    open = { name, form, path: here(), at: Date.now() };
    touched = { form, field: name, path: here() };
  };
  const onOut = (e: FocusEvent) => closeField(e.target as Element | null);
  const onSubmit = () => {
    tried = touched;
    touched = null;
  };

  const onError = (e: ErrorEvent) => {
    if (!e.message || /ResizeObserver|Script error/i.test(e.message)) return;
    add({ k: "jserr", t: scrub(e.message).slice(0, 80), l: (e.filename || "").split("/").pop()?.split("?")[0]?.slice(0, 60) });
  };
  const onReject = (e: PromiseRejectionEvent) => {
    const m = e.reason instanceof Error ? e.reason.message : "";
    if (m && !/aborted|AbortError|Failed to fetch|Load failed/i.test(m)) add({ k: "jserr", t: scrub(m).slice(0, 80), l: "promise" });
  };

  const seenErr = new Map<string, number>();
  const mo = new MutationObserver((list) => {
    for (const m of list) {
      const nodes = m.type === "characterData" ? [m.target.parentElement] : [...m.addedNodes];
      for (const n of nodes) {
        if (!(n instanceof Element)) continue;
        const alert = n.matches('[role="alert"]') ? n : n.querySelector('[role="alert"]') ?? n.closest('[role="alert"]');
        if (!alert || alert.id === "__next-route-announcer__") continue;
        const text = scrub(alert.textContent || "");
        if (!text || Date.now() - (seenErr.get(text) || 0) < 5000) continue;
        seenErr.set(text, Date.now());
        touched ??= tried;
        add({ k: "ferr", t: formName(alert), l: text });
      }
    }
  });

  const quit = () => {
    closeField(document.activeElement);
    if (touched) add({ k: "quit", t: touched.form, l: touched.field, p: touched.path });
    touched = null;
  };
  const onHide = () => {
    if (document.visibilityState === "hidden") {
      quit();
      flushActs();
    }
  };
  // Some browsers report the page as still visible here, so do not ask.
  const onPageHide = () => {
    quit();
    flushActs();
  };
  quitForm = quit;

  document.addEventListener("click", onClick, true);
  document.addEventListener("focusin", onIn);
  document.addEventListener("focusout", onOut);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onReject);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  const timer = setInterval(flushActs, 15000);
  return () => {
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("focusin", onIn);
    document.removeEventListener("focusout", onOut);
    document.removeEventListener("submit", onSubmit, true);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onReject);
    mo.disconnect();
    clearInterval(timer);
    quitForm = null;
  };
}

let quitForm: (() => void) | null = null;

/** Sections actually on screen on one page. Returns a cleanup that reports the totals. */
export function watchSections(path: string): () => void {
  if (!endpoint("/b") || isPrivatePath(path) || typeof IntersectionObserver === "undefined") return () => quitForm?.();
  const names = new Map<Element, string>();
  const since = new Map<Element, number>();
  const total = new Map<Element, number>();
  const reported = new Map<Element, number>();
  const visible = new Set<Element>();
  const stop = (el: Element) => {
    const t = since.get(el);
    if (t) total.set(el, (total.get(el) || 0) + Date.now() - t);
    since.delete(el);
  };
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        // Half of the section, or a section filling 40% of the screen.
        const on = e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= window.innerHeight * 0.4);
        if (on) {
          visible.add(e.target);
          if (!since.has(e.target) && document.visibilityState === "visible") since.set(e.target, Date.now());
        } else {
          visible.delete(e.target);
          stop(e.target);
        }
      }
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1] }
  );
  document.querySelectorAll("#main section").forEach((el, i) => {
    names.set(el, sectionName(el, i));
    io.observe(el);
  });
  const report = () => {
    for (const [el, name] of names) {
      stop(el);
      const ms = (total.get(el) || 0) - (reported.get(el) || 0);
      if (ms < 1000) continue;
      reported.set(el, total.get(el) || 0);
      add({ k: "section", t: name, n1: ms, p: path });
    }
  };
  const onVis = () => {
    if (document.visibilityState === "hidden") {
      report();
      flushActs();
    } else visible.forEach((el) => since.set(el, Date.now()));
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    document.removeEventListener("visibilitychange", onVis);
    io.disconnect();
    report();
    quitForm?.();
    flushActs();
  };
}
