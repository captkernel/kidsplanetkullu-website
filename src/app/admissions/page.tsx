import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Admissions open for 2026-27",
  description:
    "Admissions are open at Kids Planet, Kullu for the 2026 to 2027 session, Playgroup through Class 8. Enquire, visit the campus, and apply. Send an enquiry or book a visit today.",
};

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
    body: "Submit the application with the required documents and secure your child's seat for the coming session.",
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
        intro="We are open for admissions for the 2026 to 2027 session, Playgroup through Class 8. Enquire, visit the campus, and apply. The clearest first step is always to walk the campus and meet a teacher."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#visit" size="lg">
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
            three steps: Enquire, Visit, and Apply. No forms to puzzle over
            before you have even seen the school. We keep it human, and we walk
            each family through it in turn.
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
              watched campus, staff trained in first aid, and nutritious meals
              are looked after here every single day. It is the quiet
              groundwork that lets a child simply get on with being a child.
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* Fees & calendar placeholders. Kept intact. */}
      <Section tone="canvas">
        <div className="max-w-2xl">
          <Eyebrow>The practical details</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            Fees, dates, and everything in between.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <Card className="h-full p-8">
              <Eyebrow>Fees</Eyebrow>
              <h3 className="mt-3 font-display text-2xl md:text-3xl">
                Fee structure
              </h3>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Fees vary by stage, from Playgroup to Class 8. For the current
                fee schedule and any sibling concession, please speak with the
                school office. We will share the full breakdown during your
                visit.
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-ink-soft">
                [TO CONFIRM: published fee table for 2026 to 27, per stage.]
              </div>
              <Button href={telHref} external variant="secondary" size="md" className="mt-6">
                Ask about fees
              </Button>
            </Card>
          </FadeIn>

          <FadeIn delay={100}>
            <Card className="h-full p-8">
              <Eyebrow>Calendar</Eyebrow>
              <h3 className="mt-3 font-display text-2xl md:text-3xl">
                Session and key dates
              </h3>
              <p className="mt-4 leading-relaxed text-ink-soft">
                The academic session runs across the year, with admission
                windows opening ahead of it. Reach out for the exact
                application deadline for your child&rsquo;s class this year.
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-ink-soft">
                [TO CONFIRM: session start date and admission deadlines for 2026 to 27.]
              </div>
              <ul className="mt-6 space-y-2 text-sm text-ink">
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
              We would love to help your child aim for the stars.
            </p>
            <dl className="mt-8 space-y-3 text-sm text-ink">
              <div>
                <dt className="font-semibold text-ink">Where we are</dt>
                <dd className="text-ink-soft">
                  Guru Behar, Dhalpur, Kullu, Himachal Pradesh 175101
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Affiliation</dt>
                <dd className="text-ink-soft">
                  {SCHOOL.board}
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
