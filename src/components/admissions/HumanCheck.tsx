"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile: proves a person, not a script, is sending the form. Most parents
// never see a puzzle, only a box that ticks itself. Switched on by NEXT_PUBLIC_TURNSTILE_SITEKEY;
// the backend enforces it independently, so leaving this out of a form cannot bypass the check.
const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";
export const humanCheckOn = SITEKEY !== "";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading = null;
        reject(new Error("turnstile failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/**
 * `onToken` receives the token, or null when it expires. A token works once: after each
 * submit, change `resetKey` to get a fresh one. `onToken` must be a stable function
 * (a state setter is ideal).
 */
export function HumanCheck({ onToken, resetKey = 0 }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITEKEY) return;
    let cancelled = false;
    let id: string | null = null;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        id = window.turnstile.render(box.current, {
          sitekey: SITEKEY,
          action: "kp-admissions",
          theme: "light",
          size: "flexible",
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));
    return () => {
      cancelled = true;
      onToken(null);
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [onToken, resetKey]);

  if (!SITEKEY) return null;
  return <div ref={box} className="min-h-[65px]" data-testid="human-check" />;
}
