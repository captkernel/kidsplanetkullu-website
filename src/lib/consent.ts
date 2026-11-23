// The visitor's choice about being remembered between visits and having the visit recorded.
// Nothing here is on until they tap Allow. Anonymous counts (see track.ts) do not depend on it.

const KEY = "kp_visit_choice";
const ALLOW_DAYS = 365;
const NO_DAYS = 180;

export type Choice = { value: "allow" | "no"; at: number; vid?: string };

const listeners = new Set<() => void>();
export function onChoiceChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The browser itself says "do not track me": never ask, never remember. */
export function browserSaysNo(): boolean {
  if (typeof navigator === "undefined") return true;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.globalPrivacyControl === true || n.doNotTrack === "1";
}

export function getChoice(): Choice | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null") as Choice | null;
    if (!c) return null;
    const days = (Date.now() - c.at) / 864e5;
    if (days > (c.value === "allow" ? ALLOW_DAYS : NO_DAYS)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return c;
  } catch {
    return null;
  }
}

/** Can the choice be stored at all? If not, do not ask: the answer would not stick. */
export function canStore(): boolean {
  try {
    localStorage.setItem("kp_probe", "1");
    localStorage.removeItem("kp_probe");
    return true;
  } catch {
    return false;
  }
}

/** The lasting id, or undefined unless this visitor chose Allow. */
export function lastingId(): string | undefined {
  if (browserSaysNo()) return undefined;
  const c = getChoice();
  return c?.value === "allow" ? c.vid : undefined;
}

function newId(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function save(c: Choice) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {}
  listeners.forEach((fn) => fn());
}

export function allow() {
  save({ value: "allow", at: Date.now(), vid: newId() });
}

export function decline() {
  save({ value: "no", at: Date.now() });
}

/** Withdraw: stop now, and ask the collector to delete what it holds under this id. */
export async function withdraw(): Promise<boolean> {
  const vid = getChoice()?.vid;
  decline();
  const base = process.env.NEXT_PUBLIC_PULSE_URL;
  if (!vid || !base) return true;
  try {
    const res = await fetch(base.replace(/\/p$/, "/forget"), {
      method: "POST",
      body: JSON.stringify({ v: vid }),
      headers: { "Content-Type": "text/plain" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Pages where a family's own details are on screen: never recorded, and no on-screen text is kept. */
export function isPrivatePath(p: string): boolean {
  return /^\/(parent|admissions\/apply|admissions\/status)(\/|$)/.test(p);
}
