import type { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "canvas" | "surface" | "dark";

const toneClass: Record<Tone, string> = {
  canvas: "bg-canvas text-ink",
  surface: "bg-surface text-ink",
  dark: "bg-primary-deep text-canvas",
};

// A section wrapper enforcing DENSITY 3 (py-24/py-32) and the tone palette.
// `bleed` skips the inner container for full-bleed section families.
export function Section({
  tone = "canvas",
  bleed = false,
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  bleed?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${toneClass[tone]} py-20 md:py-28 lg:py-32 ${className}`}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
