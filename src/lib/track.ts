// Cookieless visitor analytics -> kp-pulse Cloudflare Worker (see ../website-analytics).
// No cookies, no personal data: a random per-tab session id lives in sessionStorage only.
// Disabled unless NEXT_PUBLIC_PULSE_URL is set at build time.

const ENDPOINT = process.env.NEXT_PUBLIC_PULSE_URL;

type Payload = Record<string, string | number | undefined>;

function sessionId(): string {
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
  if (location.hostname === "localhost" && !location.search.includes("pulse")) return;
  const body = JSON.stringify({ ...data, s: sessionId(), p: data.p ?? location.pathname });
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
