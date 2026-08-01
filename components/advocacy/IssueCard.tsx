import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { IssueStatus } from "@/lib/types/database.types";

const STATUS_TONE: Record<IssueStatus, "danger" | "gold" | "teal" | "muted"> = {
  urgent: "danger",
  watch: "gold",
  monitoring: "teal",
  resolved: "muted",
};

const STATUS_LABEL: Record<IssueStatus, string> = {
  urgent: "Urgent",
  watch: "Watch",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

export function IssueCard({
  issue,
  actionCount,
  renderActions,
  footerActions,
}: {
  issue: {
    id: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    goal_count: number | null;
  };
  actionCount: number;
  renderActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="font-semibold text-off-white">{issue.title}</div>
        <Badge tone={STATUS_TONE[issue.status]}>{STATUS_LABEL[issue.status]}</Badge>
      </div>
      {issue.description && (
        <p className="mb-3 text-xs leading-relaxed text-text-muted">
          {issue.description}
        </p>
      )}
      {issue.goal_count != null && (
        <div className="mb-2">
          <ProgressBar value={actionCount} max={issue.goal_count} />
          <div className="mt-1 text-xs text-text-dim">
            {actionCount} of {issue.goal_count} members have taken action
          </div>
        </div>
      )}
      {renderActions && (
        <div className="mt-2 flex justify-end">{renderActions}</div>
      )}
      {footerActions && <div className="mt-3 border-t border-card-border pt-3">{footerActions}</div>}
    </Card>
  );
}
