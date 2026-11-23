"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile: evidence that a person, not a script, is sending the form.
// It must never stand between a parent and the school: the box appears only when Cloudflare
// wants a tap, and if the check fails or hangs (it does on some phones and browsers) it
// disappears and the form is sent without it. The backend then applies a smaller daily
// allowance instead of refusing. Switched on by NEXT_PUBLIC_TURNSTILE_SITEKEY.
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
          appearance: "interaction-only",
          retry: "never",
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(null),
          // Returning true tells Turnstile we have handled it, so it shows no error of its own.
          "error-callback": () => {
            onToken(null);
            if (box.current) box.current.style.display = "none";
            return true;
          },
          "timeout-callback": () => onToken(null),
          "unsupported-callback": () => {
            onToken(null);
            if (box.current) box.current.style.display = "none";
          },
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
  return <div ref={box} data-testid="human-check" />;
}
