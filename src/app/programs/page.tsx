import type { Metadata } from "next";
import { Check, Heart, Compass, ShieldCheck, Sprout } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Constellation } from "@/components/Constellation";
import programs from "@/content/programs.json";

// Safety net: any stray dash in a range renders as a natural word range so no
// dash tell can reach the page.
const toRange = (s: string) => s.replace(/\s*[—–]\s*/g, " to ");

export const metadata: Metadata = {
  title: "Programs",
  description:
    "From Playgroup to Class 8, Kids Planet teaches one steady path through the foundation years. Early years, primary, and middle school programs in Kullu, built on character, curiosity, and confidence.",
};

// Group the flat program list into three stages, each an id-anchored section.
const STAGES = [
  {
    id: "early-years",
    label: "Early Years",
    range: "Playgroup to UKG",
    overview:
      "The first years are about wonder, not worksheets. Children build language, confidence, and social habits through play, sound, and story, so that formal school later feels like a natural next step.",
    image: "/images/classroom/colorful-preschool.jpg",
    ids: ["playgroup", "nursery", "lkg", "ukg"],
  },
  {
    id: "primary",
    label: "Primary School",
    range: "Class 1 to 5",
    overview:
      "The foundation years, taught for understanding rather than rote. English and Hindi, science that gets explored, and value education woven through the ordinary day.",
    image: "/images/classroom/students-in-class.jpg",
    ids: ["primary-lower", "primary-upper"],
  },
  {
    id: "middle",
    label: "Middle School",
    range: "Class 6 to 8",
    overview:
      "Real depth in science and mathematics, project work, and the first taste of leadership. Children leave well prepared and confident for whatever secondary school they choose.",
    image: "/images/activities/science-exhibition.jpg",
    ids: ["middle"],
  },
];

// What guides every stage. The homepage rhythm, said as the qualities we grow
// in a child rather than as exams or boards.
const VALUES = [
  {
    icon: Heart,
    title: "Character",
    body: "Kindness, honesty, and the everyday habits that keep a child grounded and rooted in the valley.",
  },
  {
    icon: Compass,
    title: "Curiosity",
    body: "A day where asking questions is the normal thing to do, from science models to forest walks.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence",
    body: "The quiet self-belief that comes from being truly known, and from being stretched at the right pace.",
  },
  {
    icon: Sprout,
    title: "Well-rounded growth",
    body: "Arts, sport, and the outdoors alongside strong academics, so the whole child grows, not just the marks.",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="How we learn"
        title={
          <>
            One steady path through the{" "}
            <em className="italic text-primary">foundation years.</em>
          </>
        }
        intro="Kids Planet carries a child from the first day of playgroup to a confident Class 8, one stage flowing into the next with no jolt in between. Here is how each one works."
      />

      {/* What guides every stage. Foundation-years framing that echoes the
          homepage: character, curiosity, confidence, well-rounded growth. */}
      <Section tone="canvas">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <Eyebrow star>What we grow in a child</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-5xl">
              The years that shape a child.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft lg:pb-2">
            The aim never changes from stage to stage. We are not teaching to a
            single exam. We are raising curious, confident, well-rounded
            children who are ready for whatever comes next.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <FadeIn key={v.title} delay={i * 60}>
                <Card hover className="relative flex h-full flex-col p-7">
                  <span
                    aria-hidden
                    className="absolute right-6 top-6 text-gold/70"
                    style={{ lineHeight: 1 }}
                  >
                    ✦
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Icon strokeWidth={1.75} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-xl">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{v.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Constellation shape="lean-right" className="bg-canvas pt-2" />

      {STAGES.map((stage, si) => (
        <Section
          key={stage.id}
          id={stage.id}
          tone={si % 2 === 0 ? "canvas" : "surface"}
        >
          <div
            className={`grid items-center gap-10 lg:grid-cols-2 ${
              si % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <FadeIn>
              <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stage.image}
                  alt={`${stage.label} at Kids Planet`}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <Eyebrow star>{stage.range}</Eyebrow>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                {stage.label}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                {stage.overview}
              </p>
            </FadeIn>
          </div>

          {/* Say it, then show it: the specific classes within the stage. */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {programs
              .filter((p) => stage.ids.includes(p.id))
              .map((p) => (
                <FadeIn key={p.id}>
                  <Card hover className="flex h-full flex-col p-7">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-2xl">{toRange(p.name)}</h3>
                      <span className="shrink-0 text-sm font-medium uppercase tracking-[0.08em] text-primary">
                        {toRange(p.ageRange)}
                      </span>
                    </div>
                    <p className="mt-3 leading-relaxed text-ink-soft">
                      {p.description}
                    </p>
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-ink">
                          <Check
                            size={16}
                            strokeWidth={2}
                            className="mt-0.5 shrink-0 text-primary"
                          />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </FadeIn>
              ))}
          </div>
        </Section>
      ))}

      <Constellation shape="zigzag" tone="dark" className="bg-primary-deep pt-6" />

      <Section tone="dark" className="pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow onDark star>Ready to see it in person?</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl text-canvas">
            The best way to understand a program is to watch a class.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-canvas/80">
            Come and sit in on a morning. See how a child is taught, met, and
            known here, and picture your own in the room.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              href="/admissions#visit"
              size="lg"
              className="bg-gold text-primary-deep hover:bg-gold-soft"
            >
              Book a Visit
            </Button>
            <Button
              href="/admissions"
              variant="secondary"
              size="lg"
              className="border-canvas/50 text-canvas hover:bg-canvas hover:text-primary"
            >
              Admissions
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
