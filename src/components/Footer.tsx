import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { SCHOOL } from "@/lib/constants";
import { whatsappHref, telHref, mailHref } from "@/lib/links";
import { Container } from "./ui/Container";

const explore = [
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/faculty", label: "Our Faculty" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-primary-deep text-canvas">
      <Container className="py-16 md:py-20">
        {/* Mission line, reinforced. */}
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
            <span aria-hidden className="text-gold">✦</span> {SCHOOL.motto}
          </p>
          <p className="mt-4 font-display text-2xl md:text-3xl leading-snug text-canvas">
            A school in the Kullu Valley with small classes, patient teaching,
            and teachers who stay close to your child through the years.
          </p>
          <Link
            href="/admissions"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-soft transition-colors hover:text-gold"
          >
            <span aria-hidden className="text-gold">✦</span>
            Admissions open for {SCHOOL.admissionsYear}
          </Link>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/kp-logo.png" alt="" className="h-10 w-10 rounded-full" width={40} height={40} />
              <span className="font-display text-xl font-semibold">{SCHOOL.name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-canvas/70">
              Established {SCHOOL.founded}. Playgroup to Class 8, English medium.
              Affiliated to the state board.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-canvas/60">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-canvas/80 transition-colors hover:text-gold-soft"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-canvas/60">
              Reach Us
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-canvas/80">
              <li className="flex gap-2.5">
                <MapPin size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-soft" />
                <span>Guru Behar, Dhalpur, Kullu, Himachal Pradesh 175101</span>
              </li>
              <li>
                <a href={telHref} className="flex items-center gap-2.5 hover:text-gold-soft">
                  <Phone size={17} strokeWidth={1.75} className="shrink-0 text-gold-soft" />
                  {SCHOOL.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={mailHref} className="flex items-center gap-2.5 hover:text-gold-soft">
                  <Mail size={17} strokeWidth={1.75} className="shrink-0 text-gold-soft" />
                  {SCHOOL.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref("Hello, I would like to know more about Kids Planet.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-gold-soft"
                >
                  <MessageCircle size={17} strokeWidth={1.75} className="shrink-0 text-gold-soft" />
                  Message on WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-canvas/60">
              Office Hours
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-canvas/80">
              <li className="flex gap-2.5">
                <Clock size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-gold-soft" />
                <span>
                  {SCHOOL.timings.weekday}
                  <br />
                  {SCHOOL.timings.saturday}
                  <br />
                  {SCHOOL.timings.sunday}
                </span>
              </li>
            </ul>
            <dl className="mt-6 space-y-1 text-xs text-canvas/60">
              <div className="flex gap-2">
                <dt className="font-semibold">Board:</dt>
                <dd>{SCHOOL.board}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line-dark pt-6 text-xs text-canvas/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SCHOOL.name}, Kullu. All rights reserved.
          </p>
          <p>Guru Behar, Dhalpur, Kullu, Himachal Pradesh 175101</p>
        </div>
      </Container>
    </footer>
  );
}
