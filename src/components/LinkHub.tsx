"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  FileCheck,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { telHref, whatsappHref } from "@/lib/links";
import { track } from "@/lib/track";

// The one link in the Instagram and Facebook bios: kidsplanetkullu.com/links/
//
// Every link into the site carries UTM tags, so the kp-pulse dashboard and online applications
// (visitSource in lib/admissions.ts) can tell bio traffic apart from posters, teachers and ads.
// The source comes from the link itself (?utm_source=instagram) when it has one, otherwise from
// the in-app browser: Instagram and Facebook both name themselves in the user agent.
// utm_content says which button was tapped. Values follow the office link builder
// (public/marketing/links/): lowercase, hyphens only.

type Tags = { source: string; medium: string; campaign: string };

const FALLBACK: Tags = { source: "linkpage", medium: "bio", campaign: "admissions27" };

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

let cached: Tags | null = null;

function readTags(): Tags {
  if (cached) return cached;
  try {
    const q = new URLSearchParams(location.search);
    const given = slug(q.get("utm_source") || q.get("src") || "");
    const ua = navigator.userAgent || "";
    const ref = document.referrer || "";
    const source =
      given ||
      (/Instagram/i.test(ua) || /instagram\.com/i.test(ref)
        ? "instagram"
        : /FBAN|FBAV|FB_IAB|FBIOS|FB4A/.test(ua) || /facebook\.com|fb\.me/i.test(ref)
          ? "facebook"
          : FALLBACK.source);
    cached = {
      source,
      medium: slug(q.get("utm_medium") || "") || FALLBACK.medium,
      campaign: slug(q.get("utm_campaign") || "") || FALLBACK.campaign,
    };
  } catch {
    cached = FALLBACK;
  }
  return cached;
}

const noSubscribe = () => () => {};
// The static HTML carries the fallback tags; the browser swaps in the real source on load.
const useTags = () => useSyncExternalStore(noSubscribe, readTags, () => FALLBACK);

function tagged(path: string, key: string, t: Tags, hash = "") {
  const q = new URLSearchParams({
    utm_source: t.source,
    utm_medium: t.medium,
    utm_campaign: t.campaign,
    utm_content: key,
  });
  return `${path}?${q.toString()}${hash}`;
}

type Item = {
  key: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
  primary?: boolean;
};

function Row({ item, source }: { item: Item; source: string }) {
  const Icon = item.icon;
  const cls =
    "group flex min-h-[68px] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left " +
    "shadow-[var(--shadow-card)] transition-[transform,background-color,border-color] duration-200 " +
    "active:scale-[0.98] motion-reduce:transition-none " +
    (item.primary
      ? "border-primary bg-primary text-canvas hover:bg-primary-deep"
      : "border-line bg-surface text-ink hover:border-primary/40");
  const body = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          item.primary ? "bg-canvas/15 text-gold-soft" : "bg-canvas text-primary"
        }`}
      >
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug">{item.title}</span>
        <span className={`block text-sm leading-snug ${item.primary ? "text-canvas/80" : "text-ink-soft"}`}>
          {item.sub}
        </span>
      </span>
      <ArrowRight
        size={18}
        strokeWidth={1.75}
        aria-hidden
        className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none ${
          item.primary ? "text-gold-soft" : "text-primary/70"
        }`}
      />
    </>
  );
  const onClick = () => track("linkpage_tap", `${item.key} ${source}`);
  if (item.external) {
    const newTab = item.href.startsWith("http");
    return (
      <a
        href={item.href}
        onClick={onClick}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {body}
      </a>
    );
  }
  return (
    <Link href={item.href} onClick={onClick} className={cls}>
      {body}
    </Link>
  );
}

function Group({ title, items, source }: { title?: string; items: Item[]; source: string }) {
  return (
    <section className="mt-8 first:mt-0">
      {title && <h2 className="mb-3 px-1 font-sans text-sm font-semibold tracking-normal text-ink-soft">{title}</h2>}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.key}>
            <Row item={item} source={source} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LinkHub() {
  const t = useTags();
  const where = t.source === "instagram" ? " on Instagram" : t.source === "facebook" ? " on Facebook" : "";
  // The office sees where the family found us in the first WhatsApp message, for the enquiry tracker.
  const waText = where
    ? `Hello, I found Kids Planet${where} and would like to know about admissions for ${SCHOOL.admissionsYear}.`
    : `Hello, I would like to know about admissions at Kids Planet for ${SCHOOL.admissionsYear}.`;

  const newFamilies: Item[] = [
    {
      key: "admissions",
      title: `Admissions ${SCHOOL.admissionsYear}`,
      sub: "Classes, ages, fees and how to join",
      icon: GraduationCap,
      href: tagged("/admissions/", "admissions", t),
      primary: true,
    },
    {
      key: "apply",
      title: "Apply online",
      sub: "Fill in the application on your phone",
      icon: Send,
      href: tagged("/admissions/apply/", "apply", t),
    },
    {
      key: "visit",
      title: "Book a visit",
      sub: "Tell us when you would like to come and see the school",
      icon: CalendarDays,
      href: tagged("/admissions/", "visit", t, "#enquire"),
    },
    {
      key: "whatsapp",
      title: "WhatsApp the school office",
      sub: "Ask about seats, fees or transport",
      icon: MessageCircle,
      href: whatsappHref(waText),
      external: true,
    },
    {
      key: "call",
      title: "Call the school",
      sub: `${SCHOOL.phoneDisplay}, Monday to Saturday`,
      icon: Phone,
      href: telHref,
      external: true,
    },
  ];

  const parents: Item[] = [
    {
      key: "parent",
      title: "Parent profile",
      sub: "Sign in, or make one, for school updates and admissions",
      icon: UserRound,
      href: tagged("/parent/", "parent", t),
    },
    {
      key: "status",
      title: "Check an application",
      sub: "See where your child's application stands",
      icon: FileCheck,
      href: tagged("/admissions/status/", "status", t),
    },
  ];

  const more: Item[] = [
    {
      key: "home",
      title: "Visit our website",
      sub: "kidsplanetkullu.com",
      icon: Compass,
      href: tagged("/", "home", t),
    },
    {
      key: "directions",
      title: "Directions",
      sub: "Find us in Dhalpur on Google Maps",
      icon: MapPin,
      href: SCHOOL.mapUrl,
      external: true,
    },
  ];

  const small =
    "rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary " +
    "transition-colors hover:border-primary/40 active:scale-[0.98]";

  return (
    <div data-bare-page className="min-h-[100dvh] bg-canvas">
      <div className="mx-auto w-full max-w-md px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-10 sm:pt-14">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kp-logo-small.png" alt="Kids Planet School crest" width={80} height={87} className="h-[87px] w-20" />
          <h1 className="mt-4 text-3xl font-semibold">{SCHOOL.name} School</h1>
          <p className="mt-2 text-sm text-ink-soft">Pre-Nursery to Class 8 in Dhalpur, Kullu. Since {SCHOOL.founded}.</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-surface px-4 py-1.5 text-xs font-semibold text-primary">
            <span aria-hidden className="text-gold">✦</span>
            Admissions open for {SCHOOL.admissionsYear}
          </p>
        </div>

        <div className="mt-9">
          <Group items={newFamilies} source={t.source} />
          <Group title="For parents" items={parents} source={t.source} />
          <Group title="More" items={more} source={t.source} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <a href={SCHOOL.social.instagram} target="_blank" rel="noopener noreferrer" className={small}>
            Instagram
          </a>
          <a href={SCHOOL.social.facebook} target="_blank" rel="noopener noreferrer" className={small}>
            Facebook
          </a>
          <a href={SCHOOL.justdial} target="_blank" rel="noopener noreferrer" className={small}>
            Reviews on JustDial
          </a>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-ink-soft">
          {SCHOOL.address}
          <br />
          {SCHOOL.timings.weekday}. {SCHOOL.timings.saturday}.
          <br />
          <Link href="/privacy/" className="underline underline-offset-4 hover:text-primary">
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
