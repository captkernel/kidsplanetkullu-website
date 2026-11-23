import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Phone, CalendarDays, FileCheck, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { Constellation } from "@/components/Constellation";
import { InquiryForm } from "@/components/InquiryForm";
import { SCHOOL } from "@/lib/constants";
import { telHref } from "@/lib/links";

export const metadata: Metadata = pageMetadata({
  path: "/admissions/",
  title: "Admissions 2027-28",
  description:
    "Admissions open for 2027-28 at Kids Planet School, Dhalpur, Kullu. Pre-Nursery 2+, Nursery 3+, LKG 4+, UKG 5+, Class 1 6+. Walk in, or call 94180 23454.",
});

// Amounts in rupees, from the school's fee sheet for 2026-27 (K:\2026-27\04 Finance\Fee Structure),
// confirmed by the Vice Principal on 23 Nov 2026. Tuition is billed per QUARTER, four times a year.
// Leave FEES empty to show the "ask the office" text instead. Update here when 2027-28 is fixed.
const FEES: { stage: string; admission: number; annual: number; quarter: number }[] = [
  { stage: "Pre-Nursery to UKG", admission: 12000, annual: 14000, quarter: 6600 },
  { stage: "Class 1 to 5", admission: 10000, annual: 14000, quarter: 7000 },
  { stage: "Class 6 to 8", admission: 10000, annual: 14000, quarter: 8500 },
];
const FEES_SESSION = "2026-27";
const FEE_NOTE =
  "These are the fees for the current session. Registration is paid once, by new admissions only. Annual charges are paid in two halves and tuition in four instalments through the year. Any change for 2027-28 will be shown here.";
const yearTotal = (f: { annual: number; quarter: number }) => f.annual + f.quarter * 4;
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// From 01-strategy/CLAIMS-SHEET.md (school policy).
const AGES: [string, string][] = [
  ["Pre-Nursery", "2 years and above (reopens with the 2027-28 session)"],
  ["Nursery", "3 years completed"],
  ["LKG", "4 years completed"],
  ["UKG", "5 years completed"],
  ["Class 1", "6 years completed"],
];
// Himachal Education Department letters of 24-12-2025, 12-03-2026 and 08-10-2026: the age for
// Nursery to Class 1 is counted on 30 September of the admission year, in every school.
const AGE_NOTE = "For Nursery to Class 1, the age is counted on 30 September 2027, as the Himachal Education Department requires. A child may join from the first day of the session if the birthday falls by then.";

const STEPS = [
  {
    n: "01",
    icon: Phone,
    title: "Enquire",
    body: "Call, message on WhatsApp, or send the short form below. We reply within one working day with next steps.",
  },
  {
    n: "02",
    icon: CalendarDays,
    title: "Visit",
    body: "Come to the campus, tour the classrooms, watch a class in session, and ask us anything about the fit for your child.",
  },
  {
    n: "03",
    icon: FileCheck,
    title: "Apply",
    body: "Fill the application on your phone or at the office, with the documents, and the seat is confirmed at the school.",
    link: { href: "/admissions/apply/", label: "Apply online" },
  },
];

export default function AdmissionsPage() {
  return (
    <>
      <PageHero
        eyebrow={`Admissions open for the ${SCHOOL.admissionsSession} session`}
        title={
          <>
            A seat at Kids Planet is a{" "}
            <em className="italic text-primary">short conversation away.</em>
          </>
        }
        intro="We are open for admissions for the 2027 to 2028 session, Pre-Nursery through Class 8. Enquire, visit the campus, and apply. The clearest first step is always to walk the campus and meet a teacher."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/admissions/apply/" size="lg">
            Apply Online
          </Button>
          <Button href="#visit" variant="secondary" size="lg">
            Book a Visit
          </Button>
          <Button href={telHref} external variant="secondary" size="lg">
            Call {SCHOOL.phoneDisplay}
          </Button>
        </div>
      </PageHero>

      {/* Steps: Enquire, Visit, Apply. Editorial stagger so the row is not a
          flat three-equal trio. */}
      <Section tone="canvas" id="visit">
        <div className="max-w-2xl">
          <Eyebrow star>How it works</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">
            Three simple steps to a seat.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Admissions for the {SCHOOL.admissionsSession} session move through
            three steps: Enquire, Visit, and Apply. Start with whichever suits
            you: a phone call, a walk around the campus, or the short online
            form. We keep it human, and we walk each family through it in turn.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeIn as="li" key={s.n} delay={i * 80} className={i === 1 ? "md:mt-10" : ""}>
                <Card hover className="relative flex h-full flex-col p-7">
                  <span
                    aria-hidden
                    className="absolute right-6 top-6 text-gold/70"
                    style={{ lineHeight: 1 }}
                  >
                    ✦
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary">
                      <Icon strokeWidth={1.75} size={20} />
                    </span>
                    <span className="font-display text-2xl text-primary/70">{s.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
                  {"link" in s && s.link && (
                    <Link
                      href={s.link.href}
                      className="mt-4 font-semibold text-primary underline underline-offset-4"
                    >
                      {s.link.label}
                    </Link>
                  )}
                </Card>
              </FadeIn>
            );
          })}
        </ol>
      </Section>

      {/* Safe hands reassurance. A short, warm nod for hill-town parents,
          alongside a real campus photo. Asymmetric, not a card trio. */}
      <Section tone="surface">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <FadeIn className="relative">
            <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/campus/courtyard-activities.jpg"
                alt="Children playing in the supervised, gated courtyard at Kids Planet"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <span aria-hidden className="absolute -right-3 -top-3 text-2xl text-gold">
              ✦
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary">
              <ShieldCheck strokeWidth={1.75} size={22} />
            </span>
            <h2 className="mt-5 font-display text-3xl md:text-4xl">
              Safe hands, from the first day.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              Before anything else, a parent needs to trust where their child
              spends the day. Careful vans on the valley roads, a gated and
              watched campus, first aid and a call home the same day, and a
              child handed only to a named guardian, every single day. It is the quiet
              groundwork that lets a child simply get on with being a child.
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Practical details. Fees render as a table once FEES is filled in for the
          session; until then the card says how fees are shared. Ages and the
          walk-in policy come from 01-strategy/CLAIMS-SHEET.md. No dates until
          this cycle's are fixed (claims sheet). */}
      <Section tone="canvas">
        <div className="max-w-2xl">
          <Eyebrow>The practical details</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            Fees, ages, and how to join.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="h-full p-8">
              <Eyebrow>Fees</Eyebrow>
              <h3 className="mt-3 font-display text-2xl md:text-3xl">
                Fees, session {FEES_SESSION}
              </h3>
              {FEES.length > 0 ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-ink-soft">
                        <th className="py-2 pr-4 font-semibold">Stage</th>
                        <th className="py-2 pr-4 font-semibold">Registration (once)</th>
                        <th className="py-2 pr-4 font-semibold">Annual charges</th>
                        <th className="py-2 pr-4 font-semibold">Tuition per quarter</th>
                        <th className="py-2 font-semibold">Total for the year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEES.map((f) => (
                        <tr key={f.stage} className="border-b border-line/60">
                          <td className="py-2.5 pr-4 font-medium text-ink">{f.stage}</td>
                          <td className="py-2.5 pr-4">{inr(f.admission)}</td>
                          <td className="py-2.5 pr-4">{inr(f.annual)}</td>
                          <td className="py-2.5 pr-4">{inr(f.quarter)}</td>
                          <td className="py-2.5 font-medium text-ink">{inr(yearTotal(f))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {FEE_NOTE && <p className="mt-3 text-sm text-ink-soft">{FEE_NOTE}</p>}
                </div>
              ) : (
                <p className="mt-4 leading-relaxed text-ink-soft">
                  Fees are set by stage, from Pre-Nursery to Class 8. Call or
                  visit and the office will walk you through the full breakdown
                  for your child&rsquo;s class.
                </p>
              )}
              <Button href={telHref} external variant="secondary" size="md" className="mt-6">
                Ask about fees
              </Button>
            </Card>
          </FadeIn>

          <FadeIn delay={100}>
            <Card className="h-full p-8">
              <Eyebrow>Who can join</Eyebrow>
              <h3 className="mt-3 font-display text-2xl md:text-3xl">
                Ages and admission
              </h3>
              <table className="mt-5 w-full text-left text-sm">
                <tbody>
                  {AGES.map(([cls, age]) => (
                    <tr key={cls} className="border-b border-line/60">
                      <td className="py-2.5 pr-4 font-medium text-ink">{cls}</td>
                      <td className="py-2.5 text-ink-soft">{age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{AGE_NOTE}</p>
              <ul className="mt-5 space-y-2 leading-relaxed text-ink-soft">
                <li>Admissions for {SCHOOL.admissionsYear} are open now, from Pre-Nursery to Class 8.</li>
                <li>Walk in on any working day. No appointment needed.</li>
                <li>
                  The new session begins in February for Classes 1 to 8, and in
                  March for the kindergarten classes, Pre-Nursery to UKG.
                </li>
                <li>English medium.</li>
                <li>
                  No fee to apply.{" "}
                  <Link href="/admissions/apply/" className="font-semibold text-primary underline underline-offset-4">
                    Apply online
                  </Link>{" "}
                  or{" "}
                  <Link href="/admissions/status/" className="font-semibold text-primary underline underline-offset-4">
                    check an application
                  </Link>
                  .
                </li>
              </ul>
              <ul className="mt-5 space-y-1 text-sm text-ink">
                <li>Office hours: {SCHOOL.timings.weekday}</li>
                <li>{SCHOOL.timings.saturday}</li>
              </ul>
            </Card>
          </FadeIn>
        </div>
      </Section>

      <Constellation shape="lean-left" className="bg-canvas pt-4" />

      {/* Inquiry form with a warm, aspirational close. */}
      <Section tone="canvas" id="enquire" className="pt-6 md:pt-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeIn>
            <Eyebrow star>Send an enquiry</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Tell us about your child.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Share a few details and we will get back to you with the right
              next step. Prefer to talk? Call {SCHOOL.phoneDisplay} during
              office hours, or message us on WhatsApp any time.
            </p>
            <p className="mt-6 font-display text-xl italic text-primary">
              Come and see an ordinary morning here. It says more than we can.
            </p>
            <dl className="mt-8 space-y-3 text-sm text-ink">
              <div>
                <dt className="font-semibold text-ink">Where we are</dt>
                <dd className="text-ink-soft">
                  Guru Behar, Dhalpur, Kullu, Himachal Pradesh 175101
                </dd>
              </div>
            </dl>
          </FadeIn>
          <FadeIn delay={100}>
            <Card className="p-7 md:p-9">
              <InquiryForm />
            </Card>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
