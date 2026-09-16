"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/links";
import { SCHOOL } from "@/lib/constants";
import { Button } from "./ui/Button";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-canvas/90 backdrop-blur-md"
          : "border-transparent bg-canvas/70 backdrop-blur-sm"
      }`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SCHOOL.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kp-logo.png" alt="" className="h-9 w-9 rounded-full" width={36} height={36} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              {SCHOOL.name}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              {SCHOOL.motto}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-ink-soft hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Utility actions: always reachable on desktop. Two clear intents,
            Enquire then Book a Visit, with a compact admissions cue that keeps
            the nav on one line and the header height under 80px. */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/admissions"
            className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-primary hover:text-primary-deep xl:inline-flex"
          >
            <span aria-hidden className="text-gold">✦</span>
            Admissions {SCHOOL.admissionsYear} open
          </Link>
          <Button href="/admissions#enquire" variant="secondary" size="md">
            Enquire
          </Button>
          <Button href="/admissions#visit" variant="primary" size="md">
            Book a Visit
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X strokeWidth={1.75} /> : <Menu strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-line bg-canvas lg:hidden"
          onClick={() => setOpen(false)}
        >
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-surface text-primary"
                    : "text-ink hover:bg-surface"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2.5">
              <Button href="/admissions#enquire" variant="secondary" size="lg">
                Enquire
              </Button>
              <Button href="/admissions#visit" variant="primary" size="lg">
                Book a Visit
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
