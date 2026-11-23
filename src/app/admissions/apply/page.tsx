import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ApplyForm } from "@/components/admissions/ApplyForm";
import { SCHOOL } from "@/lib/constants";
import { telHref } from "@/lib/links";

export const metadata: Metadata = pageMetadata({
  path: "/admissions/apply/",
  title: `Apply online for ${SCHOOL.admissionsYear}`,
  description:
    "Apply online for admission to Kids Planet School, Dhalpur, Kullu. Pre-Nursery to Class 8. About five minutes on your phone, no fee to apply.",
});

const KEEP_READY = [
  "Your child's date of birth",
  "Your mobile number",
  "Photos of the birth certificate and your child, if handy",
];

export default function ApplyPage() {
  return (
    <>
      <PageHero
        eyebrow={`Admissions ${SCHOOL.admissionsYear}`}
        title={
          <>
            Apply online, <em className="italic text-primary">in about five minutes.</em>
          </>
        }
        intro="Fill this in on your phone, and the office will call you to fix a visit. There is no fee to apply, and nothing is final until you have seen the school."
      />
      <Section tone="canvas" className="!py-12 md:!py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr]">
          <Card className="p-6 md:p-9">
            <ApplyForm />
          </Card>
          <aside className="space-y-8 lg:pt-4">
            <div>
              <h2 className="font-display text-2xl">Keep ready</h2>
              <ul className="mt-4 space-y-2 leading-relaxed text-ink-soft">
                {KEEP_READY.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden className="text-gold">✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl">Prefer to talk?</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Call{" "}
                <a href={telHref} className="font-semibold text-primary">
                  {SCHOOL.phoneDisplay}
                </a>{" "}
                during office hours, or walk in on any working day. We can fill
                the form with you.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl">Already applied?</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                <Link href="/admissions/status/" className="font-semibold text-primary underline underline-offset-4">
                  Check your application
                </Link>{" "}
                with your reference and mobile number, or{" "}
                <Link href="/parent/" className="font-semibold text-primary underline underline-offset-4">
                  sign in to your parent profile
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
