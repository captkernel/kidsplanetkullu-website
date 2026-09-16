import type { Metadata } from "next";
import { Trees, ShieldCheck, BookOpen, Palette, Bus, Trophy } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { StatBand } from "@/components/ui/StatBand";
import { Constellation } from "@/components/Constellation";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Kids Planet was founded in 2010 in Dhalpur, Kullu. Sixteen years of teaching children from Playgroup to Class 8 with small classes, patient teaching, and high standards.",
};

const FACILITIES = [
  { icon: BookOpen, title: "Bright classrooms", body: "Thirteen classrooms across Playgroup to Class 8, decorated for the age that learns in each one." },
  { icon: Palette, title: "Art and activity", body: "Craft, drawing, and exhibition spaces where the annual art show comes together each year." },
  { icon: Trophy, title: "Sports and assembly", body: "An open courtyard for morning assembly, yoga day, and the annual sports meet." },
  { icon: ShieldCheck, title: "Safe campus", body: "A watched, walkable site in Dhalpur, close to the circuit house and easy for families to reach." },
  { icon: Bus, title: "Transport", body: "School vans on known, supervised routes carry families across the Kullu town area to the gate and home again." },
  { icon: Trees, title: "Outdoor learning", body: "Planting, forest walks, and hands-on activity that take lessons beyond the desk." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Kids Planet"
        title={
          <>
            A valley school built on{" "}
            <em className="italic text-primary">patient teaching.</em>
          </>
        }
        intro="Established in 2010, Kids Planet has grown from a small playgroup into a full Playgroup to Class 8 school trusted by hundreds of Kullu families."
      />

      {/* Founder story */}
      <Section tone="canvas">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/founders/founders-portrait.jpg"
                alt="The founders of Kids Planet"
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <Eyebrow>Our founding</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              One belief, sixteen years in the making.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
              <p>
                Kids Planet was founded in 2010 by Mrs. Neeta Parmar, whose years
                of teaching shaped a simple belief: every child in the valley
                deserves a school where they are truly known.
              </p>
              <p>
                Alongside Mr. Ranjeet Parmar, she grew a small playgroup into a
                full Playgroup to Class 8 institution trusted by hundreds of
                Kullu families. We remember them with love.
              </p>
              <p>
                Their vision is carried forward today by the founding family, who
                stay close to the classroom and to every name on the roll.
              </p>
            </div>
            <p className="mt-6 text-sm italic text-ink-soft">
              [TO CONFIRM: founder wording to be approved before publishing.]
            </p>
          </FadeIn>
        </div>
      </Section>

      {/* From the Chairman & Principal. Current leadership's message, placed
          respectfully alongside the founder heritage above. Swap the portrait
          by dropping a file at /public/images/leadership/karan-parmar.jpg and
          setting `src` on the img below. */}
      <Section tone="surface">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <FadeIn>
            {/* Portrait slot: same framed, gold-ringed style as the faculty
                tiles. Ready for Karan's real portrait. */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl ring-1 ring-gold/40 lg:mx-0">
              {/* When ready: replace this block with
                  <img src="/images/leadership/karan-parmar.jpg" ... /> */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-primary/8">
                <span className="font-display text-4xl leading-none text-primary">
                  KP
                </span>
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.16em] text-ink-soft">
                  Portrait
                </span>
              </div>
              <span
                aria-hidden
                className="absolute right-3 top-3 text-lg text-gold"
              >
                ✦
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <Eyebrow>From the Chairman & Principal</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              A word from Karan Parmar.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
              <p>
                When my family opened Kids Planet in 2010, the idea was simple.
                Build the school we wished for the children of this valley.
                Sixteen years on, I have the privilege of carrying that work
                forward.
              </p>
              <p>
                What I promise every parent is this. Your child will be taught
                with patience, held to a high standard, and given the room to
                become fully themselves. We ask our children to excel and to
                explore in equal measure, and we mean it.
              </p>
              <p>
                Come and spend a morning with us. There is no better way to
                understand who we are.
              </p>
            </div>
            <div className="mt-6">
              <p className="font-display text-xl text-ink">Karan Parmar</p>
              <p className="text-sm text-ink-soft">Chairman &amp; Principal</p>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Facts band */}
      <Section tone="dark">
        <div className="max-w-xl">
          <Eyebrow onDark>At a glance</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl text-canvas">
            Small enough to know you, established enough to trust.
          </h2>
        </div>
        <div className="mt-12">
          <StatBand stats={SCHOOL.stats} onDark />
        </div>
      </Section>

      {/* Facilities */}
      <Section tone="surface">
        <div className="max-w-2xl">
          <Eyebrow>The campus</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">
            Everything a growing child needs, in one walkable place.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f, i) => {
            const Icon = f.icon;
            const feature = i === 0;
            return (
              <FadeIn
                key={f.title}
                delay={i * 50}
                className={feature ? "sm:col-span-2 lg:row-span-2" : ""}
              >
                <Card
                  hover
                  className={`relative flex h-full flex-col p-7 ${
                    feature ? "justify-end lg:p-9" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute right-6 top-6 text-gold/60"
                    style={{ lineHeight: 1 }}
                  >
                    ✦
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full bg-primary/8 text-primary ${
                      feature ? "h-14 w-14" : "h-11 w-11"
                    }`}
                  >
                    <Icon strokeWidth={1.75} size={feature ? 26 : 20} />
                  </span>
                  <h3 className={`mt-5 font-display ${feature ? "text-2xl md:text-3xl" : "text-xl"}`}>
                    {f.title}
                  </h3>
                  <p className={`mt-2 leading-relaxed text-ink-soft ${feature ? "text-lg max-w-sm" : ""}`}>
                    {f.body}
                  </p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Constellation shape="lean-right" className="bg-canvas pt-4" />

      {/* Heritage / houses. Overlapping type + tiles, staggered heights. */}
      <Section tone="canvas" className="pt-4">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <FadeIn>
            <Eyebrow star>Four houses, one sky</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Belonging that lasts long after Class 8.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Every child at Kids Planet belongs to one of four houses, named for
              the planets that share our sky: Mars, Venus, Jupiter, and Mercury.
              Houses carry the friendly rivalry of sports day, the teamwork of
              cultural events, and a sense of belonging that lasts long after
              Class 8.
            </p>
            <Button href="/admissions" size="md" className="mt-8">
              Join the Kids Planet family
            </Button>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { h: "Mars", t: "Courage" },
                { h: "Venus", t: "Kindness" },
                { h: "Jupiter", t: "Leadership" },
                { h: "Mercury", t: "Curiosity" },
              ].map(({ h, t }, i) => (
                <Card
                  key={h}
                  className={`flex flex-col justify-between gap-8 p-6 ${
                    i % 2 === 1 ? "sm:mt-8" : ""
                  }`}
                >
                  <span aria-hidden className="text-2xl text-gold">✦</span>
                  <div>
                    <p className="font-display text-2xl">{h}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{t}</p>
                  </div>
                </Card>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
