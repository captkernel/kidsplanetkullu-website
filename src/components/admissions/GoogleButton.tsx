"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

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

  // Read on the phone only (the page is pre-built without a browser), as a plain string so it is stable.
  const inAppKey = useSyncExternalStore(noSubscribe, () => {
    const a = inAppBrowser();
    return a ? `${a.name}|${a.android ? 1 : 0}` : "";
  }, () => "");
  const inApp: InApp = inAppKey ? { name: inAppKey.split("|")[0], android: inAppKey.endsWith("|1") } : null;

  if (!CLIENT_ID) return null;
  if (inApp) return <OpenInBrowser app={inApp} />;
  return <div ref={box} className="min-h-[44px]" data-testid="google-button" />;
}

// Google refuses to sign people in inside the Instagram / Facebook / WhatsApp in-app
// browsers ("disallowed_useragent"). Most campaign visitors arrive in exactly those,
// so instead of a button that fails we tell them how to open the page in their browser.
type InApp = { name: string; android: boolean } | null;

function inAppBrowser(): InApp {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  const android = /Android/i.test(ua);
  if (/Instagram/i.test(ua)) return { name: "Instagram", android };
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return { name: "Facebook", android };
  if (/WhatsApp/i.test(ua)) return { name: "WhatsApp", android };
  if (/Snapchat|Line\/|LinkedInApp|Twitter/i.test(ua)) return { name: "this app", android };
  if (android && /; wv\)/.test(ua)) return { name: "this app", android };
  return null;
}

function OpenInBrowser({ app }: { app: { name: string; android: boolean } }) {
  const [copied, setCopied] = useState(false);
  const here = typeof window !== "undefined" ? window.location.href : "";
  // Android: an intent link opens the same page in Chrome (or the phone's default browser).
  const intent = here
    ? `intent://${here.replace(/^https?:\/\//, "")}#Intent;scheme=https;S.browser_fallback_url=${encodeURIComponent(here)};end`
    : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(here);
      setCopied(true);
    } catch {
      // Clipboard blocked: the instructions below still work.
    }
  };
  return (
    <div className="rounded-xl border border-line bg-canvas p-4 text-sm leading-relaxed text-ink" data-testid="google-open-in-browser">
      <p>
        <strong>Sign in with Google</strong> works in your phone&rsquo;s browser, not inside {app.name}.
      </p>
      {app.android ? (
        <a
          href={intent}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-semibold text-canvas"
        >
          Open this page in Chrome
        </a>
      ) : (
        <p className="mt-2 text-ink-soft">
          Tap <strong>&middot;&middot;&middot;</strong> (top right) and choose <strong>Open in browser</strong>.
        </p>
      )}
      <button type="button" onClick={() => void copy()} className="mt-3 block font-semibold text-primary underline underline-offset-4">
        {copied ? "Link copied. Paste it in Chrome or Safari." : "Or copy the link"}
      </button>
      <p className="mt-2 text-ink-soft">You can also carry on below with your mobile number.</p>
    </div>
  );
}
