"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { send, track } from "@/lib/track";

// Page views on every route change, engaged time on leave, and outbound-contact clicks
// (WhatsApp, call, email, map, social, JustDial) picked up by one delegated listener.
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const visibleSince = useRef<number>(0);
  const engaged = useRef<number>(0);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    send({
      t: "pv",
      p: pathname,
      h: location.hash || undefined,
      // Only the landing page carries the external referrer.
      r: first.current ? document.referrer || undefined : undefined,
      us: q.get("utm_source") || undefined,
      um: q.get("utm_medium") || undefined,
      uc: q.get("utm_campaign") || undefined,
      w: window.screen?.width,
      l: navigator.language,
    });
    first.current = false;
    visibleSince.current = Date.now();
    engaged.current = 0;

    const flush = () => {
      if (visibleSince.current) engaged.current += Date.now() - visibleSince.current;
      visibleSince.current = 0;
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        flush();
        if (engaged.current > 0) send({ t: "leave", p: pathname, d: engaged.current });
        engaged.current = 0;
      } else {
        visibleSince.current = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      flush();
      if (engaged.current > 0) send({ t: "leave", p: pathname, d: engaged.current });
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.href;
      const label = (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 60);
      if (href.startsWith("https://wa.me/")) track("whatsapp_click", label);
      else if (href.startsWith("tel:")) track("call_click", label);
      else if (href.startsWith("mailto:")) track("email_click", label);
      else if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps/.test(href)) track("map_click", label);
      else if (/facebook\.com|instagram\.com/.test(href)) track("social_click", new URL(href).hostname);
      else if (/justdial\.com/.test(href)) track("justdial_click", label);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
