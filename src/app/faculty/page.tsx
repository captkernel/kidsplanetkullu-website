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

// Data source: src/data/faculty.generated.json, exported from the Student Portal
// by scripts/pull-faculty.mjs (active staff, public fields only: name, role,
// subjects, class-teacher assignment, register qualification, portrait). No PII.
// Qualifications are recorded for some staff and blank for others pending a
// register update, so we render them gracefully either way.

type StaffMember = {
  name: string;
  title: string;
  isTeacher: boolean;
  classTeacherOf: string | null;
  subjects: string[];
  qualification: string;
  photo: string | null;
};

const CLASS_ORDER = ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"];
const LEAD_TITLES = ["Vice Principal", "Administration"];

// Leadership first, then class teachers in class order, then the rest by name.
function rank(s: StaffMember): number {
  const lead = LEAD_TITLES.indexOf(s.title);
  if (lead >= 0) return lead;
  const cls = s.classTeacherOf ? CLASS_ORDER.indexOf(s.classTeacherOf) : -1;
  return cls >= 0 ? 10 + cls : 100;
}

const allStaff = facultyData.staff as StaffMember[];
const teachers = allStaff
  .filter((s) => s.isTeacher)
  .slice()
  .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
const supportStaff = allStaff
  .filter((s) => !s.isTeacher)
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// A single elegant roster tile: portrait, name, role, subjects, qualification.
function TeacherTile({ t, delay }: { t: StaffMember; delay: number }) {
  const role = t.classTeacherOf
    ? `${t.title}, Class Teacher of ${t.classTeacherOf}`
    : t.title;
  return (
    <FadeIn delay={delay}>
      <div className="flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        {/* Portrait slot: a fixed 3:4 gold-ringed frame. Renders the real photo
            when a teacher has `photo`; otherwise a clean initials placeholder. */}
        <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-gold/40 sm:w-24">
          {t.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.photo}
              alt={`Portrait of ${t.name}`}
              width={480}
              height={640}
              loading="lazy"
              decoding="async"
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
          <p className="mt-0.5 text-sm font-medium text-primary">{role}</p>
          {t.subjects.length > 0 && (
            <p className="mt-1.5 text-sm leading-snug text-ink-soft">
              {t.subjects.join(", ")}
            </p>
          )}
          {t.qualification && (
            <p className="mt-1 text-xs leading-snug text-ink-soft/80">
              {t.qualification}
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
          {teachers.length} teachers across Playgroup to Class 8, led by our
          Chairman and Principal, Karan Parmar. Subjects are as taught this
          session; qualifications are shown where recorded in our staff register.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t, i) => (
            <TeacherTile key={t.name} t={t} delay={(i % 3) * 70} />
          ))}
        </div>

        <div className="mt-16">
          <Eyebrow star>Support team</Eyebrow>
          <h2 className="mt-4 font-display text-2xl md:text-3xl">
            The people who keep the school running
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Our support staff look after the campus and the children every
            single day.
          </p>
          <ul className="mt-8 flex flex-wrap gap-6">
            {supportStaff.map((s, i) => (
              <li key={s.name} className="w-24 text-center sm:w-28">
                <FadeIn delay={(i % 5) * 60}>
                  <div className="relative mx-auto aspect-[3/4] w-20 overflow-hidden rounded-xl ring-1 ring-gold/40 sm:w-24">
                    {s.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo}
                        alt={`Portrait of ${s.name}`}
                        width={480}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/8 font-display text-lg text-primary">
                        {initials(s.name)}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 font-display text-base leading-tight">{s.name}</p>
                  <p className="text-xs text-ink-soft">{s.title}</p>
                </FadeIn>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-14 max-w-2xl border-l-2 border-gold/50 pl-4 text-sm leading-relaxed text-ink-soft">
          This roster reflects our current staff, drawn from the school records
          and updated each session. You are warmly welcome to meet the team in
          person on a campus visit.
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
