export function ProgressBar({
  value,
  max,
  tone = "gold",
}: {
  value: number;
  max: number | null;
  tone?: "gold" | "teal" | "danger";
}) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fillClass =
    tone === "danger" ? "bg-red-500" : tone === "teal" ? "bg-teal" : "bg-gold";

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        {max ? (
          <div
            className={`h-full rounded-full ${fillClass}`}
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className={`h-full rounded-full ${fillClass} w-full opacity-40`} />
        )}
      </div>
      <div className="mt-1 text-xs text-text-dim">
        {value} {max ? `/ ${max}` : "/ Unlimited"}
      </div>
    </div>
  );
}
