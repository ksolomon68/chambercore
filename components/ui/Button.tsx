import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "filled" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  filled:
    "bg-gold text-navy hover:bg-gold-light",
  outline:
    "bg-transparent border border-card-border text-off-white hover:border-gold/60",
  ghost: "bg-transparent text-text-muted hover:text-off-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-md",
  md: "text-sm px-5 py-2.5 rounded-lg",
  lg: "text-base px-8 py-3.5 rounded-lg",
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "filled",
  size = "md",
  className = "",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "filled",
  size = "md",
  className = "",
  children,
  target,
}: CommonProps & { href: string; target?: string }) {
  return (
    <Link
      href={href}
      target={target}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
