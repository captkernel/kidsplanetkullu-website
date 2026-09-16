import type { ReactNode } from "react";

// One elevation step. Soft tinted shadow + hairline. rounded-2xl (shape lock).
export function Card({
  className = "",
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] ${
        hover
          ? "transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
