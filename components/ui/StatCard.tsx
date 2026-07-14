import type { ReactNode } from "react";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-text-muted">
          {label}
        </div>
        <div className="mt-2 font-display text-3xl font-bold text-off-white">
          {value}
        </div>
        {hint && <div className="mt-1 text-xs text-text-dim">{hint}</div>}
      </div>
      {icon && <div className="text-gold">{icon}</div>}
    </Card>
  );
}
