import type { ReactNode } from "react";

type Tone = "gold" | "teal" | "green" | "muted" | "danger";

const toneClasses: Record<Tone, string> = {
  gold: "bg-gold/15 text-gold-light border-gold/30",
  teal: "bg-teal/10 text-teal border-teal/25",
  green: "bg-green/10 text-green border-green/25",
  muted: "bg-white/5 text-text-muted border-card-border",
  danger: "bg-red-500/10 text-red-400 border-red-500/25",
};

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
