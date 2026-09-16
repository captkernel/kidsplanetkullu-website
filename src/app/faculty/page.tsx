import type { Metadata } from "next";

import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { Constellation } from "@/components/Constellation";
import facultyData from "@/data/faculty.generated.json";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "Meet the teaching staff of Kids Planet, Kullu. Trained, qualified teachers who stay close to your child across Playgroup to Class 8.",
};

// Data source: src/data/faculty.generated.json (KP Master Staff Register, active
// teachers, public fields only: name, qualifications, class assigned). No PII,
// no photos. Qualifications are recorded for some staff and blank for others
// pending a register update, so we render them gracefully either way.

type Teacher = {
  name: string;
  academic: string;
  professional: string;
  qualification: string;
  classAssigned: string;
  // Optional portrait. Drop a file under /public/images/faculty/ and set its
  // path here (e.g. "/images/faculty/anita-devi.jpg") to swap the placeholder.
  photo?: string;
};

const teachers = (facultyData.teachers as Teacher[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// A single elegant roster tile: portrait placeholder, name, class, qualification.
function TeacherTile({ t, delay }: { t: Teacher; delay: number }) {
  return (
    <FadeIn delay={delay}>
      <div className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        {/* Portrait slot: a fixed 3:4 gold-ringed frame. Renders the real photo
            when a teacher has `photo`; otherwise a clean initials placeholder. */}
        <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-gold/40">
          {t.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.photo}
              alt={`Portrait of ${t.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary/8">
              <span className="font-display text-lg leading-none text-primary">
                {initials(t.name)}
              </span>
              <span className="text-[0.55rem] font-medium uppercase tracking-[0.14em] text-ink-soft">
                Portrait
              </span>
            </div>
          )}
          <span aria-hidden className="absolute right-1 top-1 text-[0.7rem] text-gold">
            ✦
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight">{t.name}</h3>
          {t.classAssigned && (
            <p className="mt-0.5 text-sm font-medium text-primary">
              {t.classAssigned}
            </p>
          )}
          {t.qualification ? (
            <p className="mt-1.5 text-sm leading-snug text-ink-soft">
              {t.qualification}
            </p>
          ) : (
            <p className="mt-1.5 text-sm leading-snug text-ink-soft/70">
              Held in the staff register
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

export default function FacultyPage() {
  return (
    <>
      <PageHero
        eyebrow="Our teachers"
        title="Qualified teachers who give your child real personal attention."
        intro="Our strength is not a building. It is a team of trained, qualified teachers who stay close to every child through the years that matter most."
      />

      <Section tone="canvas">
        <Eyebrow star>Our teaching team</Eyebrow>
        <h2 className="mt-4 flex items-baseline gap-2.5 font-display text-2xl md:text-3xl">
          <span aria-hidden className="text-lg text-gold">
            ✦
          </span>
          The people behind every day at Kids Planet
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          {teachers.length} teachers across Playgroup to Class 8. Qualifications
          are shown where recorded in our staff register.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t, i) => (
            <TeacherTile key={t.name} t={t} delay={(i % 3) * 70} />
          ))}
        </div>

        <p className="mt-14 max-w-2xl border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-ink-soft">
          This roster reflects our current teaching staff, drawn from the school
          records. Teacher portraits are being added; until then you are warmly
          welcome to meet the team in person on a campus visit.
        </p>
      </Section>

      <Constellation shape="zigzag" tone="dark" className="bg-primary-deep pt-6" />

      <Section tone="dark" className="pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow onDark star>
            Come meet them
          </Eyebrow>
          <h2 className="mt-4 font-display text-3xl text-canvas md:text-4xl">
            The teachers are the reason families stay for years.
          </h2>
          <div className="mt-8 flex justify-center">
            <Button
              href="/admissions#visit"
              size="lg"
              className="bg-gold text-primary-deep hover:bg-gold-soft"
            >
              Book a Visit
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
