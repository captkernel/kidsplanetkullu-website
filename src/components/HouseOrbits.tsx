import { FadeIn } from "@/components/ui/FadeIn";

// The four houses as a simple 2D orbital system: each planet revolves around the
// central sun on a flat circular ring (no perspective, no 3D depth). Labels
// counter-rotate to stay upright. Per user request each planet keeps its warm
// colour (Mars red, Mercury green, Venus blue, Jupiter yellow); the sun stays
// centred with its radiance. Motion is gated behind prefers-reduced-motion:
// no-preference; under reduced motion the planets are placed statically around
// the ring. All animation lives in a component-scoped <style> block.

type House = {
  name: string;
  trait: string;
  // Orbit radius as a percentage of the box half-size (bigger = further out).
  radius: number;
  // Planet size multiplier.
  size: number;
  // Seconds for one full revolution (varied so they drift out of lockstep).
  duration: number;
  // Frozen orbit angle (deg) used only under prefers-reduced-motion so the four
  // planets spread around the ring instead of stacking at the top.
  staticAngle: number;
  tone: "mars" | "mercury" | "venus" | "jupiter";
};

// Distinct radii so the four planets sit on separate concentric rings, clear of
// the sun. Smaller planets, pushed well out from the centre.
const HOUSES: House[] = [
  { name: "Jupiter", trait: "Leadership", radius: 47, size: 0.95, duration: 44, staticAngle: 152, tone: "jupiter" },
  { name: "Mars", trait: "Courage", radius: 41, size: 0.82, duration: 34, staticAngle: 216, tone: "mars" },
  { name: "Venus", trait: "Kindness", radius: 35, size: 0.74, duration: 26, staticAngle: 44, tone: "venus" },
  { name: "Mercury", trait: "Curiosity", radius: 30, size: 0.66, duration: 19, staticAngle: 302, tone: "mercury" },
];

const toneClass: Record<House["tone"], string> = {
  mars: "text-[#fbeede]",       // warm brick red
  mercury: "text-[#eef6e6]",    // warm sage green
  venus: "text-[#eef3fb]",      // muted blue
  jupiter: "text-primary-deep", // warm golden yellow, dark label
};

const toneStyle: Record<House["tone"], React.CSSProperties> = {
  mars: {
    background: "radial-gradient(circle at 32% 28%, #c56a4a 0%, #a24a2f 55%, #8a3a22 100%)",
    boxShadow: "0 0 22px rgba(165,74,47,0.32), var(--shadow-card)",
  },
  mercury: {
    background: "radial-gradient(circle at 32% 28%, #6f9a5c 0%, #4f7d3e 55%, #3d6630 100%)",
    boxShadow: "0 0 20px rgba(79,125,62,0.3), var(--shadow-card)",
  },
  venus: {
    background: "radial-gradient(circle at 32% 28%, #6f92c6 0%, #4a6ea6 55%, #395888 100%)",
    boxShadow: "0 0 20px rgba(74,110,166,0.32), var(--shadow-card)",
  },
  jupiter: {
    background: "radial-gradient(circle at 34% 30%, #e8bf3e 0%, #d3a51f 60%, #b98a12 100%)",
    boxShadow: "inset 0 -6px 14px rgba(120,84,0,0.35), var(--shadow-card)",
  },
};

// Flat 2D revolution: the arm rotates the planet around the centre; the label
// counter-rotates so the name stays upright. Reduced motion freezes each arm at
// a pleasant static angle.
const ORBIT_CSS = `
@keyframes kp-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes kp-orbit-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@media (prefers-reduced-motion: no-preference) {
  .kp-arm { animation: kp-orbit var(--kp-dur, 30s) linear infinite; }
  .kp-label { animation: kp-orbit-rev var(--kp-dur, 30s) linear infinite; }
}
@media (prefers-reduced-motion: reduce) {
  .kp-arm { transform: rotate(var(--kp-static, 0deg)); }
  .kp-label { transform: rotate(calc(-1 * var(--kp-static, 0deg))); }
}
`;

export function HouseOrbits() {
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <style>{ORBIT_CSS}</style>
      {/* Left: the editorial framing. */}
      <div className="max-w-md">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
          <span aria-hidden className="text-gold">✦</span>
          Four houses, one sky
        </p>
        <h2
          className="mt-3 font-display text-canvas lg:mt-4"
          style={{ fontSize: "clamp(1.5rem, 4.5vw, 3rem)" }}
        >
          Every child belongs to a world of their own.
        </h2>
        <p
          className="mt-3 leading-relaxed text-canvas/80 lg:mt-5 lg:text-lg"
          style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.125rem)" }}
        >
          From the first day, each child joins one of four houses named for the
          planets, a big family to belong to.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 lg:mt-8 lg:gap-x-6 lg:gap-y-5">
          {HOUSES.map((h) => (
            <div key={h.name} className="border-l border-line-dark pl-3 lg:pl-4">
              <dt className="font-display text-lg text-canvas lg:text-xl">{h.name}</dt>
              <dd className="mt-0.5 text-sm text-gold-soft">{h.trait}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Right: the 2D orbital system. A large box, small planets on flat rings. */}
      <FadeIn className="relative mx-auto aspect-square w-full max-w-[18rem] sm:max-w-[26rem] lg:max-w-[34rem]">
        <div className="absolute inset-0">
          {/* Flat orbit rings. */}
          {HOUSES.map((h) => (
            <div
              key={`ring-${h.name}`}
              aria-hidden
              className="absolute rounded-full border border-line-dark/40"
              style={{
                left: "50%",
                top: "50%",
                width: `${h.radius * 2}%`,
                height: `${h.radius * 2}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* The centre: a bright, radiant sun. A warm glowing corona behind a
              luminous white-gold disc. */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[145%] w-[145%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,240,190,0.5) 0%, rgba(248,214,110,0.3) 38%, rgba(230,190,80,0.12) 62%, transparent 78%)",
              }}
            />
            <div
              className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full text-center sm:h-32 sm:w-32"
              style={{
                background:
                  "radial-gradient(circle at 42% 36%, #fff8e2 0%, #ffe9a8 42%, #f4cf62 78%, #e6b943 100%)",
                boxShadow:
                  "0 0 18px 3px rgba(255,224,130,0.55), 0 0 38px 8px rgba(246,206,98,0.3)",
              }}
            >
              <span className="font-display text-base leading-tight text-primary-deep sm:text-lg">
                Kids
                <br />
                Planet
              </span>
            </div>
          </div>

          {/* Each planet rides an arm that rotates it around the centre (flat 2D).
              The label counter-rotates to stay upright. */}
          {HOUSES.map((h) => {
            const dim = `${3.4 * h.size}rem`;
            const vars = {
              "--kp-dur": `${h.duration}s`,
              "--kp-static": `${h.staticAngle}deg`,
            } as React.CSSProperties;
            return (
              <div
                key={h.name}
                className="kp-arm absolute inset-0 z-[5]"
                style={{ ...vars, transformOrigin: "center" }}
              >
                {/* Holder positions the planet on its ring (static translate);
                    the label inside counter-rotates to stay upright. */}
                <div
                  className="absolute"
                  style={{
                    left: "50%",
                    top: `${50 - h.radius}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <span
                    className={`kp-label flex items-center justify-center rounded-full font-display text-sm shadow-[var(--shadow-card)] md:text-base ${toneClass[h.tone]}`}
                    style={{ ...vars, width: dim, height: dim, ...toneStyle[h.tone] }}
                  >
                    {h.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </FadeIn>
    </div>
  );
}
