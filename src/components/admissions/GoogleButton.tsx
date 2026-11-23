"use client";

import { useEffect, useRef } from "react";

// "Continue with Google", using Google Identity Services. Google shows its own account chooser
// and hands back a signed token; our backend checks that token against Google's keys before
// trusting anything in it. Switched on by NEXT_PUBLIC_GOOGLE_CLIENT_ID.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const googleOn = CLIENT_ID !== "";

type Gsi = {
  accounts: {
    id: {
      initialize: (cfg: Record<string, unknown>) => void;
      renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
    };
  };
};
declare global {
  interface Window {
    google?: Gsi;
  }
}

let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading = null;
        reject(new Error("google sign-in failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

// Google keeps ONE callback for the page, so every button routes through the newest handler.
let current: ((credential: string) => void) | null = null;
let initialised = false;

export function GoogleButton({
  onCredential,
  label = "continue_with",
}: {
  onCredential: (credential: string) => void;
  label?: "continue_with" | "signin_with" | "signup_with";
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.google) return;
        if (!initialised) {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: (r: { credential?: string }) => {
              if (r.credential && current) current(r.credential);
            },
            auto_select: false,
            ux_mode: "popup",
            use_fedcm_for_button: true,
          });
          initialised = true;
        }
        box.current.innerHTML = "";
        window.google.accounts.id.renderButton(box.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: label,
          logo_alignment: "left",
          width: Math.min(box.current.offsetWidth || 320, 400),
        });
      })
      .catch(() => {
        // If Google's script is blocked, the button simply does not appear; the password form still works.
        if (box.current) box.current.style.display = "none";
      });
    return () => {
      cancelled = true;
    };
  }, [label]);

  if (!CLIENT_ID) return null;
  return <div ref={box} className="min-h-[44px]" data-testid="google-button" />;
}
