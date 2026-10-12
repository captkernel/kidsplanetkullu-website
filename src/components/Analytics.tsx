"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { send, track } from "@/lib/track";

type NetInfo = { effectiveType?: string; saveData?: boolean };

// Core Web Vitals for the hard page load, measured with the browser's own PerformanceObserver
// (no library). Sent once, with the first "leave" beacon of the landing page.
const vitals: { lcp?: number; fcp?: number; ttfb?: number; inp?: number; cls?: number } = {};
let vitalsSent = false;

function observeVitals() {
  if (typeof PerformanceObserver === "undefined") return;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav && nav.responseStart > 0) vitals.ttfb = nav.responseStart;
  const watch = (type: string, cb: (list: PerformanceEntryList) => void, extra: object = {}) => {
    try {
      new PerformanceObserver((l) => cb(l.getEntries())).observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {}
  };
  watch("paint", (es) => {
    for (const e of es) if (e.name === "first-contentful-paint") vitals.fcp = e.startTime;
  });
  watch("largest-contentful-paint", (es) => {
    const last = es[es.length - 1];
    if (last) vitals.lcp = last.startTime;
  });
  // CLS: largest session window of shifts not caused by user input.
  let win = 0, winStart = 0, winLast = 0;
  watch("layout-shift", (es) => {
    for (const e of es as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
      if (e.hadRecentInput) continue;
      if (win && e.startTime - winLast < 1000 && e.startTime - winStart < 5000) {
        win += e.value;
      } else {
        win = e.value;
        winStart = e.startTime;
      }
      winLast = e.startTime;
      vitals.cls = Math.max(vitals.cls ?? 0, win);
    }
  });
  // INP approximation: the slowest interaction on the page.
  watch(
    "event",
    (es) => {
      for (const e of es as (PerformanceEntry & { interactionId?: number })[]) {
        if (e.interactionId) vitals.inp = Math.max(vitals.inp ?? 0, e.duration);
      }
    },
    { durationThreshold: 40 }
  );
}

function deviceInfo() {
  const n = navigator as Navigator & { connection?: NetInfo; deviceMemory?: number };
  let tz: string | undefined;
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {}
  return {
    w: window.screen?.width,
    vw: window.innerWidth,
    vh: window.innerHeight,
    dpr: window.devicePixelRatio,
    tc: navigator.maxTouchPoints > 0 ? 1 : 0,
    mem: n.deviceMemory,
    cpu: navigator.hardwareConcurrency,
    ct: n.connection?.effectiveType,
    sd: n.connection?.saveData ? 1 : undefined,
    dk: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? 1 : 0,
    l: navigator.language,
    ls: (navigator.languages || []).slice(0, 4).join(","),
    tz,
  };
}

function scrollPct() {
  const h = document.documentElement.scrollHeight;
  return h ? Math.min(100, Math.round(((window.scrollY + window.innerHeight) / h) * 100)) : 0;
}

// Page views on every route change; engaged time, scroll depth and page speed on leave; and
// contact clicks, outbound links, downloads, form starts and phone/address copies via delegated listeners.
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const visibleSince = useRef<number>(0);
  const engaged = useRef<number>(0);
  const maxScroll = useRef<number>(0);

  useEffect(() => {
    if (first.current) observeVitals();
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
      ux: q.get("utm_content") || undefined,
      ti: document.title,
      ...deviceInfo(),
    });
    first.current = false;
    visibleSince.current = Date.now();
    engaged.current = 0;
    maxScroll.current = scrollPct();
    const formStarted = { done: false };

    const onScroll = () => {
      const s = scrollPct();
      if (s > maxScroll.current) maxScroll.current = s;
    };
    const flush = () => {
      if (visibleSince.current) engaged.current += Date.now() - visibleSince.current;
      visibleSince.current = 0;
    };
    const leave = () => {
      if (engaged.current <= 0) return;
      const v = !vitalsSent ? vitals : {};
      vitalsSent = true;
      send({
        t: "leave",
        p: pathname,
        d: engaged.current,
        sc: maxScroll.current,
        lcp: v.lcp,
        fcp: v.fcp,
        ttfb: v.ttfb,
        inp: v.inp,
        cls: v.cls,
      });
      engaged.current = 0;
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        flush();
        leave();
      } else {
        visibleSince.current = Date.now();
      }
    };
    const onFocus = (e: FocusEvent) => {
      if (formStarted.done || !(e.target as Element | null)?.closest?.("form")) return;
      formStarted.done = true;
      track("form_start", pathname);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("focusin", onFocus);
      flush();
      leave();
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
      else if (/\.(pdf|docx?|xlsx?|jpe?g|png|zip)(\?|$)/i.test(href)) track("download", href.split("/").pop());
      else if (a.host && a.host !== location.host) track("outbound_click", a.host);
    };
    // Copying the phone number or address is an enquiry that never shows up as a tap.
    const onCopy = () => {
      const text = (document.getSelection()?.toString() || "").trim();
      if (!text) return;
      const digits = text.replace(/\D/g, "");
      const kind = /94180\s?23454/.test(text) || digits.endsWith("9418023454")
        ? "phone number"
        : /dhalpur|gurubehar|175101/i.test(text)
          ? "address"
          : /@/.test(text)
            ? "email"
            : "other text";
      track("copy", kind);
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("copy", onCopy);
    };
  }, []);

  return null;
}
