import type { ReactNode } from "react";

// Small uppercase-tracking label. DESIGN.md: <= 1 per 3 sections.
// No section-number eyebrows. Gold star mark is the single celestial motif.
export function Eyebrow({
  children,
  onDark = false,
  star = false,
}: {
  children: ReactNode;
  onDark?: boolean;
  star?: boolean;
}) {
  return (
    <p
      className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${
        onDark ? "text-gold-soft" : "text-primary"
      }`}
    >
      {star && (
        <span aria-hidden className="text-gold" style={{ lineHeight: 1 }}>
          ✦
        </span>
      )}
      {children}
    </p>
  );
}
