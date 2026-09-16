// A whisper of night sky: a scatter of faint gold stars, drifting slowly.
// Purely decorative, deterministic (no hydration mismatch), and calm. The
// forest scrim over the campus photo keeps it grounded, not literal space.

// Hand-placed so the field reads as a real sky, weighted to the upper area.
const STARS: { x: number; y: number; r: number; d: number }[] = [
  { x: 8, y: 12, r: 1.1, d: 0 },
  { x: 18, y: 26, r: 0.8, d: 1.2 },
  { x: 27, y: 8, r: 1.4, d: 2.1 },
  { x: 39, y: 20, r: 0.7, d: 0.6 },
  { x: 52, y: 10, r: 1.2, d: 3 },
  { x: 63, y: 24, r: 0.9, d: 1.7 },
  { x: 71, y: 9, r: 1.5, d: 0.9 },
  { x: 82, y: 18, r: 0.8, d: 2.4 },
  { x: 91, y: 7, r: 1.1, d: 1.4 },
  { x: 12, y: 40, r: 0.7, d: 2.8 },
  { x: 34, y: 44, r: 1, d: 0.4 },
  { x: 58, y: 40, r: 0.8, d: 3.3 },
  { x: 77, y: 46, r: 1.2, d: 1.1 },
  { x: 95, y: 34, r: 0.9, d: 2 },
  { x: 46, y: 30, r: 0.6, d: 1.9 },
  { x: 24, y: 56, r: 0.7, d: 2.6 },
];

export function NightSky({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <svg
        className="sky-drift h-full w-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid slice"
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            className="star-twinkle"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="var(--color-gold-soft)"
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}
        {/* One signature four-point star, brighter than the rest. */}
        <g transform="translate(85 14)">
          <path
            d="M0 -5 L1 -1 L5 0 L1 1 L0 5 L-1 1 L-5 0 L-1 -1 Z"
            fill="var(--color-gold)"
          />
        </g>
      </svg>
    </div>
  );
}
