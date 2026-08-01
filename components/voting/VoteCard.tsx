import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function VoteCard({
  title,
  description,
  status,
  closesAt,
  options,
  totalEligible,
  headerActions,
  footerActions,
}: {
  title: string;
  description: string | null;
  status: "open" | "closed";
  closesAt: string | null;
  options: { id: string; label: string; count: number }[];
  totalEligible: number;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}) {
  const totalCasts = options.reduce((sum, o) => sum + o.count, 0);

  return (
    <Card>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="font-semibold text-off-white">{title}</div>
        <Badge tone={status === "open" ? "green" : "muted"}>
          {status === "open" ? "Open" : "Closed"}
        </Badge>
      </div>
      {description && (
        <p className="mb-3 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const pct = totalCasts ? Math.round((option.count / totalCasts) * 100) : 0;
          return (
            <div key={option.id} className="flex items-center gap-3 text-xs">
              <div className="w-32 shrink-0 truncate text-text-muted">
                {option.label}
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-9 shrink-0 text-right text-text-dim">{pct}%</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-card-border pt-3 text-xs text-text-dim">
        <span>
          {totalCasts} of {totalEligible} votes cast
          {closesAt ? ` · Closes ${new Date(closesAt).toLocaleDateString()}` : ""}
        </span>
        {headerActions}
      </div>
      {footerActions && <div className="mt-2">{footerActions}</div>}
    </Card>
  );
}
