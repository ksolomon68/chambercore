import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CommitteeType } from "@/lib/types/database.types";

const TYPE_ICON: Record<CommitteeType, string> = {
  executive: "🏛️",
  finance: "💰",
  committee: "📣",
};

const TYPE_LABEL: Record<CommitteeType, string> = {
  executive: "Executive",
  finance: "Finance",
  committee: "Committee",
};

const TYPE_TONE: Record<CommitteeType, "gold" | "green" | "muted"> = {
  executive: "gold",
  finance: "green",
  committee: "muted",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CommitteeCard({
  committee,
  chairName,
  memberNames,
  renderActions,
}: {
  committee: {
    id: string;
    name: string;
    description: string | null;
    committee_type: CommitteeType;
    next_meeting_at: string | null;
  };
  chairName: string | null;
  memberNames: string[];
  renderActions?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{TYPE_ICON[committee.committee_type]}</span>
          <div>
            <div className="font-semibold text-off-white">{committee.name}</div>
            {chairName && (
              <div className="text-xs text-text-muted">Chair: {chairName}</div>
            )}
          </div>
        </div>
        <Badge tone={TYPE_TONE[committee.committee_type]}>
          {TYPE_LABEL[committee.committee_type]}
        </Badge>
      </div>
      {committee.description && (
        <p className="mt-2 text-xs leading-relaxed text-text-muted">
          {committee.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-card-border pt-3">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {memberNames.slice(0, 3).map((name, i) => (
              <div
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card-bg bg-gold/20 text-[9px] font-bold text-gold-light"
              >
                {initials(name)}
              </div>
            ))}
          </div>
          <span className="ml-2 text-xs text-text-dim">
            {memberNames.length} member{memberNames.length === 1 ? "" : "s"}
          </span>
        </div>
        <span className="text-xs text-text-dim">
          {committee.next_meeting_at
            ? `Next: ${new Date(committee.next_meeting_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
            : ""}
        </span>
      </div>
      {renderActions && <div className="mt-2 text-right">{renderActions}</div>}
    </Card>
  );
}
