import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Compass,
  ShieldCheck,
  Trees,
  Users,
  Star,
  Facebook,
  MapPin,
  CalendarClock,
  Bus,
  Utensils,
  HeartPulse,
  DoorClosed,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { MagneticButton } from "@/components/MagneticButton";
import { HouseOrbits } from "@/components/HouseOrbits";
import { SCHOOL } from "@/lib/constants";
import { whatsappHref } from "@/lib/links";
import { clean } from "@/lib/text";

import announcements from "@/content/announcements.json";

// ────────────────────────────────────────────────────────────────────────────
// STICKY-STACK homepage. Every top-level section is its own full-viewport panel
// that pins to top-0; the next panel scrolls up and covers it (pure CSS sticky,
// no scroll listeners). Panels carry SOLID canvas/forest backgrounds so the
// cover is clean. Content is designed MOBILE-FIRST to fit inside 100dvh; a panel
// that cannot fit a very small phone gets overflow-y-auto as a graceful
// fallback rather than clipping.
//
// Each <section> uses `kp-panel` = sticky top-0, min-h-[100dvh], flex column,
// content vertically centred, y-scroll fallback. Stacking order ascends down
// the page so later panels always cover earlier ones.
// ────────────────────────────────────────────────────────────────────────────

// The six promises, said as behaviours. Compact bento that fits one screen.
// Six promises as an asymmetric star-field bento. On a 4-column desktop grid the
// tiles carry VARIED spans: "Known" is the hero tile (2 cols x 2 rows), "Ours" is
// wide (2 cols), the rest are single cells. Gold ✦ marks accent each tile.
const PROMISES = [
  {
    key: "known",
    title: "Known",
    icon: Heart,
    body: "Small classes, so one teacher learns your child by name, mood, and pace.",
    span: "col-span-2",
    feature: true,
  },
  {
    key: "ready",
    title: "Ready",
    icon: ShieldCheck,
    body: "A calm, structured day that sends a child into each next class well prepared.",
    span: "",
  },
  {
    key: "forward",
    title: "Forward",
    icon: ArrowRight,
    body: "Progress tracked every term, so you always know where your child stands.",
    span: "",
  },
  {
    key: "curious",
    title: "Curious",
    icon: Compass,
    body: "Science models, art, and outdoor days that make asking questions ordinary.",
    span: "",
  },
  {
    key: "cared-for",
    title: "Cared for",
    icon: Trees,
    body: "A gated, walkable Dhalpur campus where a child feels safe enough to try.",
    span: "",
  },
  {
    key: "ours",
    title: "Ours",
    icon: Users,
    body: "Sixteen years of Kullu families, four houses, and a founding family who stayed.",
    span: "col-span-2",
  },
];

const STAGES = [
  {
    label: "Early Years",
    range: "Playgroup to UKG, ages 2 to 6",
    body: "Play, sound, and story build the first love of learning, long before worksheets.",
    image: "/images/classroom/colorful-preschool.jpg",
    href: "/programs#early-years",
  },
  {
    label: "Primary",
    range: "Class 1 to 5, ages 6 to 11",
    body: "Reading, numbers, and ideas taught for real understanding, in English and Hindi.",
    image: "/images/classroom/students-in-class.jpg",
    href: "/programs#primary",
  },
  {
    label: "Middle",
    range: "Class 6 to 8, ages 11 to 14",
    body: "Genuine depth in science and mathematics, and the confidence to lead and move on.",
    image: "/images/activities/science-exhibition.jpg",
    href: "/programs#middle",
  },
];

const SAFE_HANDS = [
  {
    icon: Bus,
    title: "Careful vans on mountain roads",
    body: "Familiar, trained drivers hold slow, steady, supervised routes across the valley.",
  },
  {
    icon: DoorClosed,
    title: "A gated campus, watched all day",
    body: "The Dhalpur grounds stay closed to the road, with staff keeping an eye out.",
  },
  {
    icon: HeartPulse,
    title: "First aid, and a call home",
    body: "Teachers handle the everyday scrapes, and a parent hears about it the same day.",
  },
  {
    icon: Utensils,
    title: "A warm meal every day",
    body: "Freshly cooked, wholesome food, so no child sits through the afternoon hungry.",
  },
  {
    icon: ShieldCheck,
    title: "Only into hands you know",
    body: "A child leaves with a named guardian, on a pickup routine parents recognise.",
  },
];

// Honest "why families trust us" facts. No exact student counts, no fabricated
// precision. Each is a true, verifiable signal a parent weighs when choosing.
const TRUST_FACTS = [
  {
    icon: CalendarClock,
    title: "Rooted since 2010",
    body: "Sixteen years in the valley, still run by the family that opened the doors.",
  },
  {
    icon: Users,
    title: "Small classes",
    body: "About ten children to a teacher, so no one slips quietly to the back.",
  },
  {
    icon: Compass,
    title: "Playgroup to Class 8",
    body: "One unbroken path through the foundation years, all on one Dhalpur campus.",
  },
  {
    icon: Trees,
    title: "Four houses",
    body: "Mars, Venus, Jupiter, and Mercury give every child a team to belong to.",
  },
];

const recentNews = announcements
  .filter((a) => a.type === "event" || a.type === "general")
  .slice(0, 3);

export default function HomePage() {
  return (
    <>
      {/* ── 1 · HERO ─────────────────────────────────────────────────────────
          A real campus moment under a warm forest scrim, one signature star,
          the emblem, gentle image parallax, magnetic CTAs. NO NightSky. */}
      <section className="kp-hero relative isolate z-[1] overflow-hidden text-canvas">
        {/* Full-bleed campus photograph, the industry-standard school hero: a warm
            authentic student moment. Gentle parallax, reduced-motion safe. */}
        <div className="absolute inset-0 -z-30 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/campus/morning-assembly.jpg"
            alt="Children at morning assembly on the Kids Planet campus in Dhalpur, Kullu"
            className="hero-parallax h-full w-full object-cover object-[center_35%]"
          />
        </div>
        {/* Left-weighted warm scrim: copy is fully readable on the left, the
            photograph breathes on the right. One tone, no muddiness. */}
        <div
          className="absolute inset-0 -z-20"
          style={{
            background:
              "linear-gradient(102deg, rgba(18,32,12,0.94) 0%, rgba(22,38,16,0.80) 38%, rgba(22,38,16,0.42) 66%, rgba(22,38,16,0.14) 100%)",
          }}
        />
        <Container className="flex w-full flex-col items-start">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* Logo to the LEFT of the text, a decent moderate size, nudged
                toward the left edge of the hero. Stacks above the text on mobile. */}
            <div className="hero-logo flex shrink-0 items-center sm:-ml-8 lg:-ml-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kp-logo-nocircles.png"
                alt="Kids Planet"
                width={112}
                height={112}
                className="h-28 w-auto object-contain sm:h-40 lg:h-48"
              />
            </div>
            <div className="max-w-xl">
              <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-soft">
              <span aria-hidden className="text-sm text-gold">✦</span>
              Admissions open for 2026 to 2027
            </p>
            <h1
              className="mt-4 font-display font-medium leading-[1.1] text-canvas"
              style={{ fontSize: "clamp(1.85rem, 4vw, 2.65rem)" }}
            >
              A valley school where children
              <br className="hidden sm:block" /> learn to{" "}
              <em className="italic text-gold-soft">excel and explore.</em>
            </h1>
            <p
              className="mt-5 max-w-lg leading-relaxed text-canvas/85"
              style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
            >
              A Playgroup to Class 8 school in Dhalpur, Kullu, rooted in the
              valley since {SCHOOL.founded}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/admissions#visit" size="lg">
                Book a Visit
              </MagneticButton>
              <MagneticButton
                href={whatsappHref(
                  "Hello, I would like to know more about admissions at Kids Planet."
                )}
                external
                variant="secondary"
                size="lg"
                className="border-canvas/50 text-canvas hover:bg-canvas hover:text-primary"
              >
                Message on WhatsApp
              </MagneticButton>
            </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 2 · THE KIDS PLANET WAY · six promises ───────────────────────────
          Editorial star-field bento sized to fit inside ONE 100dvh panel at
          desktop AND mobile. Desktop is a compact 4-column x 2-row grid with
          VARIED spans (Known wide + prominent, Ours wide) so it reads
          asymmetric, not tidy. Element sizes, paddings, and gaps are trimmed
          so the heading plus grid clear the viewport. */}
      <section className="kp-panel z-[2] bg-canvas text-ink">
        <Container className="flex w-full flex-col justify-center">
          <FadeIn>
            <Eyebrow star>The Kids Planet Way</Eyebrow>
            <h2 className="mt-2 max-w-2xl font-display"
              style={{ fontSize: "clamp(1.15rem, 3.6vw, 2.6rem)" }}
            >
              Six things we promise every child.
            </h2>
          </FadeIn>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-3 lg:mt-6 lg:auto-rows-fr lg:grid-cols-4 lg:gap-3.5">
            {PROMISES.map((p, i) => {
              const Icon = p.icon;
              const feature = "feature" in p && p.feature;
              return (
                <FadeIn key={p.key} delay={i * 45} className={p.span}>
                  <Card
                    className={`relative flex h-full flex-col ${
                      feature ? "p-3 sm:p-5" : "p-2.5 sm:p-4"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="absolute right-3 top-3 text-sm text-gold/70 sm:right-3.5 sm:top-3.5 sm:text-base"
                      style={{ lineHeight: 1 }}
                    >
                      ✦
                    </span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full bg-primary/8 text-primary ${
                        feature ? "h-9 w-9 sm:h-11 sm:w-11" : "h-7 w-7 sm:h-9 sm:w-9"
                      }`}
                    >
                      <Icon strokeWidth={1.75} size={feature ? 20 : 16} />
                    </span>
                    <h3
                      className={`mt-1.5 font-display sm:mt-2.5 ${
                        feature ? "text-lg sm:text-2xl" : "text-base sm:text-xl"
                      }`}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={`mt-1 leading-snug text-ink-soft sm:mt-1.5 ${
                        feature ? "text-[0.82rem] sm:text-base" : "text-[0.76rem] sm:text-[0.88rem]"
                      }`}
                    >
                      {p.body}
                    </p>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── 3 · HOW WE LEARN · programs by stage ─────────────────────────────
          Three equal-size stage cards (per explicit user request). */}
      <section className="kp-panel z-[3] bg-surface text-ink">
        <Container className="flex w-full flex-col justify-center">
          <FadeIn className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-primary">How we learn</p>
              <h2 className="mt-2 font-display"
                style={{ fontSize: "clamp(1.6rem, 5vw, 3rem)" }}
              >
                One path, from first words to Class 8.
              </h2>
            </div>
            <Button href="/programs" variant="ghost" size="md">
              See all programs <ArrowRight size={16} strokeWidth={1.75} />
            </Button>
          </FadeIn>
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:mt-9 lg:gap-5">
            {STAGES.map((s, i) => (
              <FadeIn key={s.label} delay={i * 70} className="h-full">
                {/* Horizontal on phone (image left, text right) to stay compact;
                    vertical equal-size cards on sm+ (per user request). */}
                <Card hover className="group flex h-full flex-row overflow-hidden sm:flex-col">
                  <div className="relative aspect-square w-28 shrink-0 overflow-hidden sm:aspect-[4/3] sm:w-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt={`${s.label} at Kids Planet`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                    <h3 className="font-display text-lg sm:text-2xl">{s.label}</h3>
                    <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-primary sm:mt-1 sm:text-xs">
                      {s.range}
                    </p>
                    <p className="mt-1.5 flex-1 text-[0.8rem] leading-snug text-ink-soft sm:mt-2 sm:text-sm sm:leading-relaxed">
                      {s.body}
                    </p>
                    <Link
                      href={s.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-[gap] hover:gap-2.5 sm:mt-3"
                    >
                      Learn more <ArrowRight size={15} strokeWidth={2} />
                    </Link>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 4 · SAFE HANDS · five concrete safety promises ───────────────────
          Photo + compact list. Photo hidden on the smallest phones to fit. */}
      <section className="kp-panel z-[4] bg-canvas text-ink">
        <Container className="flex w-full flex-col justify-center">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
            <FadeIn className="relative order-last hidden sm:block lg:order-first">
              <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/campus/courtyard-activities.jpg"
                  alt="Children playing in the supervised, gated courtyard at Kids Planet"
                  className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
                />
              </div>
              <span aria-hidden className="absolute -left-3 -top-3 text-2xl text-gold">
                ✦
              </span>
            </FadeIn>

            <FadeIn delay={80}>
              <Eyebrow star>Safe hands</Eyebrow>
              <h2 className="mt-3 font-display"
                style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.5rem)" }}
              >
                Before anything else, they come home safe.
              </h2>
              <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
                The quiet details a parent worries about, handled the same way
                every single day.
              </p>
              <ul className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {SAFE_HANDS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.title} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <Icon strokeWidth={1.75} size={18} />
                      </span>
                      <div>
                        <h3 className="font-display text-base sm:text-lg">{s.title}</h3>
                        <p className="mt-0.5 text-[0.8rem] leading-snug text-ink-soft sm:text-[0.9rem]">
                          {s.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ── 5 · THE FOUR HOUSES · orbital signature ──────────────────────────*/}
      <section className="kp-panel z-[5] bg-primary-deep text-canvas">
        <Container className="flex w-full flex-col justify-center">
          <HouseOrbits />
        </Container>
      </section>

      {/* ── 6 · AT A GLANCE · honest trust band ──────────────────────────────
          Why families trust us, no exact counts, no fabricated precision. The
          real JustDial 4.4/5 rating leads as the concrete outside signal, with
          four true facts as flavour beneath it. */}
      <section className="kp-panel z-[6] bg-canvas text-ink">
        <Container className="flex w-full flex-col justify-center">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
            <FadeIn className="max-w-md">
              <Eyebrow star>Why families trust us</Eyebrow>
              <h2 className="mt-3 font-display"
                style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.5rem)" }}
              >
                Sixteen years, and Kullu keeps sending its children.
              </h2>
              {/* The real, verifiable outside signal. Gold star rating, linked. */}
              <a
                href={SCHOOL.justdial}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-4 py-2.5 shadow-[var(--shadow-card)] transition-colors hover:border-gold sm:mt-7"
              >
                <span className="flex items-center gap-0.5 text-gold" aria-hidden>
                  <Star size={16} strokeWidth={0} className="fill-gold" />
                  <Star size={16} strokeWidth={0} className="fill-gold" />
                  <Star size={16} strokeWidth={0} className="fill-gold" />
                  <Star size={16} strokeWidth={0} className="fill-gold" />
                  <Star size={16} strokeWidth={0} className="fill-gold/40" />
                </span>
                <span className="text-sm text-ink">
                  <span className="font-display text-lg font-semibold">
                    {SCHOOL.justdialRating} out of 5
                  </span>{" "}
                  <span className="text-ink-soft">rated by parents on JustDial</span>
                </span>
              </a>
              <p className="mt-4 text-sm text-ink-soft">
                Affiliated to the {SCHOOL.board}.
              </p>
            </FadeIn>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3.5">
              {TRUST_FACTS.map((f, i) => {
                const Icon = f.icon;
                return (
                  <FadeIn key={f.title} delay={i * 60}>
                    <Card className="flex h-full items-start gap-3.5 p-4 sm:p-5">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <Icon strokeWidth={1.75} size={18} />
                      </span>
                      <div>
                        <h3 className="font-display text-base sm:text-lg">
                          {f.title}
                        </h3>
                        <p className="mt-0.5 text-[0.8rem] leading-snug text-ink-soft sm:text-[0.9rem]">
                          {f.body}
                        </p>
                      </div>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ── 7 · FOUNDER STORY · editorial split ──────────────────────────────*/}
      <section className="kp-panel z-[7] bg-canvas text-ink">
        <Container className="flex w-full flex-col justify-center">
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            <FadeIn className="relative hidden sm:block">
              <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
                {/* A warm, sharp campus moment: a teacher caring for the little
                    ones. Native 1600x1205, framed 4:5 portrait with object-cover
                    on the central figures, so it never upscales past source. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gallery/teacher-nurturing.jpg"
                  alt="A teacher caring for young children on the Kids Planet campus in Dhalpur"
                  width={1600}
                  height={1205}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] h-full w-full object-cover object-center lg:aspect-auto"
                />
              </div>
              <span aria-hidden className="absolute -right-3 -top-3 text-2xl text-gold">
                ✦
              </span>
            </FadeIn>
            <FadeIn delay={80}>
              <p className="text-sm font-semibold text-primary">Our story</p>
              <h2 className="mt-2 font-display"
                style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.5rem)" }}
              >
                Started by a family that still knows every name.
              </h2>
              <div className="mt-4 space-y-3 leading-relaxed text-ink-soft sm:mt-5"
                style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.125rem)" }}
              >
                <p>
                  In 2010, Kids Planet opened as a small playgroup with one
                  belief: every child in the valley deserves a school where they
                  are truly known, not just enrolled.
                </p>
                <p>
                  Sixteen years on, it is a full Playgroup to Class 8 school
                  trusted by hundreds of Kullu families, still run by the
                  founding family, close to every name on the roll.
                </p>
              </div>
              <Button href="/about" variant="secondary" size="md" className="mt-6">
                Read our full story
              </Button>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* ── 8 · COMMUNITY · honest social proof ──────────────────────────────
          No invented parent quotes. Real signals only: the JustDial rating, the
          active Facebook community, and a warm invitation to meet families in
          person on a campus visit. */}
      <section className="kp-panel z-[8] bg-surface text-ink">
        <Container className="flex w-full flex-col justify-center">
          <FadeIn className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Our community</p>
            <h2 className="mt-2 font-display"
              style={{ fontSize: "clamp(1.6rem, 5vw, 3rem)" }}
            >
              Don't take our word for it. Take theirs.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.125rem)" }}
            >
              We would rather you heard it from the families than from us. Read
              how parents rate us, follow the everyday life of the school, then
              come walk the campus and ask them yourself.
            </p>
          </FadeIn>
          {/* Asymmetric: the real outside rating is the anchor (wide), with the
              Facebook community and a visit invite stacked beside it. */}
          <div className="mt-6 grid gap-3 lg:mt-9 lg:grid-cols-[1.15fr_1fr] lg:gap-5">
            <FadeIn>
              <a
                href={SCHOOL.justdial}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-center rounded-2xl border border-line bg-canvas p-5 shadow-[var(--shadow-card)] transition-colors hover:border-gold sm:p-7"
              >
                <span className="flex items-center gap-1 text-gold" aria-hidden>
                  <Star size={22} strokeWidth={0} className="fill-gold" />
                  <Star size={22} strokeWidth={0} className="fill-gold" />
                  <Star size={22} strokeWidth={0} className="fill-gold" />
                  <Star size={22} strokeWidth={0} className="fill-gold" />
                  <Star size={22} strokeWidth={0} className="fill-gold/40" />
                </span>
                <p className="mt-3 font-display text-3xl font-semibold sm:text-5xl">
                  {SCHOOL.justdialRating} out of 5
                </p>
                <p className="mt-1.5 text-[0.9rem] leading-snug text-ink-soft sm:text-base">
                  How Kullu parents rate Kids Planet on JustDial, in their own
                  reviews.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read the reviews <ArrowRight size={15} strokeWidth={2} />
                </span>
              </a>
            </FadeIn>
            <div className="grid gap-3 sm:grid-cols-2 lg:gap-5">
              <FadeIn delay={80}>
                <a
                  href={SCHOOL.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-2xl border border-line bg-canvas p-5 shadow-[var(--shadow-card)] transition-colors hover:border-gold"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Facebook strokeWidth={1.75} size={20} />
                  </span>
                  <p className="mt-3 font-display text-lg">
                    Follow along on Facebook
                  </p>
                  <p className="mt-1 flex-1 text-[0.85rem] leading-snug text-ink-soft">
                    Photos from the day, events, and notices, shared as they happen.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Follow along <ArrowRight size={15} strokeWidth={2} />
                  </span>
                </a>
              </FadeIn>
              <FadeIn delay={160}>
                <Link
                  href="/admissions#visit"
                  className="flex h-full flex-col rounded-2xl border border-line bg-canvas p-5 shadow-[var(--shadow-card)] transition-colors hover:border-gold"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <MapPin strokeWidth={1.75} size={20} />
                  </span>
                  <p className="mt-3 font-display text-lg">
                    Come see for yourself
                  </p>
                  <p className="mt-1 flex-1 text-[0.85rem] leading-snug text-ink-soft">
                    Walk the Dhalpur campus and meet the teachers and families.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Book a visit <ArrowRight size={15} strokeWidth={2} />
                  </span>
                </Link>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 9 · ADMISSIONS CLOSE · the one closing intent ────────────────────
          Closing band that clearly invites admissions for the new session, with
          the current news surfaced beneath it so the page ends on momentum plus
          a single, unambiguous call to action. */}
      <section className="kp-panel z-[9] bg-primary-deep text-canvas">
        <Container className="flex w-full flex-col justify-center">
          <FadeIn className="max-w-2xl">
            <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-soft">
              <span aria-hidden className="text-sm text-gold">✦</span>
              Admissions open for {SCHOOL.admissionsSession}
            </p>
            <h2 className="mt-4 font-display text-canvas"
              style={{ fontSize: "clamp(1.6rem, 5vw, 3rem)" }}
            >
              Save your child a place for {SCHOOL.admissionsYear}.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-canvas/85"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.125rem)" }}
            >
              Seats from Playgroup to Class 8 are filling now. Book a visit to
              walk the Dhalpur campus, meet the teachers, and begin the
              admission.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <MagneticButton href="/admissions#visit" size="lg">
                Book a Visit
              </MagneticButton>
              <MagneticButton
                href={whatsappHref(
                  `Hello, I would like to apply for admission at Kids Planet for the ${SCHOOL.admissionsSession} session.`
                )}
                external
                variant="secondary"
                size="lg"
                className="border-canvas/50 text-canvas hover:bg-canvas hover:text-primary"
              >
                Message on WhatsApp
              </MagneticButton>
            </div>
          </FadeIn>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line-dark bg-line-dark sm:grid-cols-3 lg:mt-10">
            {recentNews.map((n) => (
              <article key={n.id} className="bg-primary-deep p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-gold-soft">
                  {new Date(n.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 font-display text-base leading-snug text-canvas sm:text-lg">
                  {clean(n.title)}
                </h3>
                <p className="mt-1.5 text-[0.78rem] leading-snug text-canvas/75 sm:text-[0.85rem]">
                  {clean(n.content).slice(0, 110)}
                  {clean(n.content).length > 110 ? "..." : ""}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
