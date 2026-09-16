import type { ReactNode } from "react";
import { Container } from "./ui/Container";
import { Eyebrow } from "./ui/Eyebrow";

// Compact page header for interior pages. Editorial, not a viewport hero.
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-surface pb-14 pt-16 md:pt-20">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow star>{eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 text-lg leading-relaxed text-ink-soft md:text-xl">
              {intro}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
