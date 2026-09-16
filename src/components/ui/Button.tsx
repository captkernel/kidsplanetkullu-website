import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,background-color,color,border-color] duration-200 " +
  "active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-gold " +
  "focus-visible:outline-offset-2 motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  // Forest fill, cream text (AA verified). Hover deepens.
  primary: "bg-primary text-canvas hover:bg-primary-deep shadow-[var(--shadow-card)]",
  // Forest outline on canvas.
  secondary:
    "border border-primary/40 text-primary bg-transparent hover:bg-primary hover:text-canvas",
  // Quiet link-button.
  ghost: "text-primary hover:text-primary-deep underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  href,
  external = false,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & {
  href: string;
  external?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
