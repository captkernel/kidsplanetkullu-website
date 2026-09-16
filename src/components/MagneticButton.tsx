"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";

// A tactile, magnetic CTA. The button eases toward the pointer within a small
// radius and springs back on leave. Pure transform, rAF-throttled, and fully
// disabled under prefers-reduced-motion (the .magnetic CSS zeroes the transform).
export function MagneticButton({
  href,
  external = false,
  variant,
  size,
  className = "",
  strength = 0.28,
  children,
}: {
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  strength?: number;
  children: React.ReactNode;
}) {
  const wrap = useRef<HTMLSpanElement | null>(null);
  const frame = useRef(0);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (reduced()) return;
    const node = wrap.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      node.style.setProperty("--mx", `${x * strength}px`);
      node.style.setProperty("--my", `${y * strength}px`);
    });
  }

  function reset() {
    const node = wrap.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  }

  return (
    <span
      ref={wrap}
      className="magnetic inline-flex"
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <Button
        href={href}
        external={external}
        variant={variant}
        size={size}
        className={className}
      >
        {children}
      </Button>
    </span>
  );
}
