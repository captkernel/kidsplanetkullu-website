import { FadeIn } from "./FadeIn";

type Stat = { value: string; label: string };

// Fast-fact panel. Hairline-divided, Newsreader numerals. Works on dark or light.
export function StatBand({
  stats,
  onDark = false,
}: {
  stats: readonly Stat[];
  onDark?: boolean;
}) {
  const divide = onDark ? "divide-line-dark" : "divide-line";
  const value = onDark ? "text-canvas" : "text-primary";
  const label = onDark ? "text-canvas/70" : "text-ink-soft";
  // Columns follow the stat count so a trimmed list still reads intentional.
  const cols =
    stats.length === 3
      ? "sm:grid-cols-3"
      : stats.length === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-4";
  return (
    <dl
      className={`grid grid-cols-2 gap-y-5 ${cols} sm:gap-y-8 sm:divide-x ${divide}`}
    >
      {stats.map((s, i) => (
        <FadeIn as="div" key={s.label} delay={i * 70} className="px-2 sm:px-6 text-center sm:text-left">
          <dt
            className="font-display text-4xl md:text-5xl font-medium tracking-tight"
            style={{ color: `var(--color-${onDark ? "gold-soft" : "primary"})` }}
          >
            <span className={value}>{s.value}</span>
          </dt>
          <dd className={`mt-1 text-sm ${label}`}>{s.label}</dd>
        </FadeIn>
      ))}
    </dl>
  );
}
