"use client";

import { useEffect, useRef } from "react";

// §0.5 THE CONSTELLATION — the signature thread.
// A thin gold star-map line that connects one section to the next. The stroke
// draws itself in as the connector scrolls into view (IntersectionObserver,
// never a window scroll listener). Reduced-motion renders it fully drawn.
//
// `shape` picks one of a few hand-tuned connector paths so the line reads like
// a real constellation (gentle bends, star nodes at the vertices) rather than a
// straight rule. `tone="dark"` brightens it for use over the forest sections.

type Shape = "descend" | "lean-left" | "lean-right" | "zigzag";

// viewBox is 120 wide x 200 tall. Paths run top->bottom; dots mark star nodes.
const SHAPES: Record<Shape, { d: string; nodes: [number, number][] }> = {
  descend: {
    d: "M60 4 C60 46 44 70 44 104 C44 140 74 158 74 196",
    nodes: [
      [60, 4],
      [44, 104],
      [74, 196],
    ],
  },
  "lean-left": {
    d: "M78 4 C78 50 40 66 40 106 C40 150 58 160 58 196",
    nodes: [
      [78, 4],
      [40, 106],
      [58, 196],
    ],
  },
  "lean-right": {
    d: "M42 4 C42 48 82 70 82 108 C82 148 60 162 60 196",
    nodes: [
      [42, 4],
      [82, 108],
      [60, 196],
    ],
  },
  zigzag: {
    d: "M56 4 C56 40 84 52 84 88 C84 124 40 132 40 168 C40 184 60 188 60 196",
    nodes: [
      [56, 4],
      [84, 88],
      [40, 168],
      [60, 196],
    ],
  },
};

export function Constellation({
  shape = "descend",
  tone = "light",
  className = "",
}: {
  shape?: Shape;
  tone?: "light" | "dark";
  className?: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const path = svg.querySelector("path");
    if (path) {
      // Set the dash length to the true path length so the draw-in is exact.
      const len = path.getTotalLength();
      svg.style.setProperty("--len", `${len}`);
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      svg.classList.add("is-drawn");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            svg.classList.add("is-drawn");
            observer.unobserve(e.target);
          }
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const { d, nodes } = SHAPES[shape];
  const stroke = tone === "dark" ? "var(--color-gold-soft)" : "var(--color-gold)";
  const nodeFill = tone === "dark" ? "var(--color-gold-soft)" : "var(--color-gold)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none flex justify-center ${className}`}
    >
      <svg
        ref={ref}
        className="constellation-line"
        width="60"
        height="100"
        viewBox="0 0 120 200"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={d}
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={tone === "dark" ? 0.5 : 0.4}
        />
        {nodes.map(([cx, cy], i) => (
          <g key={i} className="constellation-star">
            <circle cx={cx} cy={cy} r="2.4" fill={nodeFill} opacity="0.9" />
            {/* Middle nodes get a faint four-point sparkle. */}
            {i === Math.floor(nodes.length / 2) && (
              <path
                d={`M${cx} ${cy - 8} L${cx + 1.4} ${cy - 1.4} L${cx + 8} ${cy} L${cx + 1.4} ${cy + 1.4} L${cx} ${cy + 8} L${cx - 1.4} ${cy + 1.4} L${cx - 8} ${cy} L${cx - 1.4} ${cy - 1.4} Z`}
                fill={nodeFill}
                opacity="0.7"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
