import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { IssueCard } from "@/components/advocacy/IssueCard";
import { deleteIssue, deleteOfficial } from "@/app/actions/advocacy";
import type { IssueStatus, OfficialLevel } from "@/lib/types/database.types";

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  state: "State",
  local: "Local",
};

export default async function AdvocacyPage() {
  const org = await getCurrentOrg();

  const issues = await query<{
    id: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    position: string | null;
    goal_count: number | null;
  }>(
    "SELECT id, title, description, status, position, goal_count FROM advocacy_issues WHERE org_id = ? ORDER BY created_at DESC",
    [org!.id]
  );

  const issueIds = issues.map((i) => i.id);
  const actionLogs = issueIds.length
    ? await query<{ issue_id: string }>(
        `SELECT issue_id FROM advocacy_action_log WHERE issue_id IN (${issueIds.map(() => "?").join(",")})`,
        issueIds
      )
    : [];

  const countByIssue = new Map<string, number>();
  actionLogs.forEach((a) => {
    countByIssue.set(a.issue_id, (countByIssue.get(a.issue_id) ?? 0) + 1);
  });

  const officials = await query<{
    id: string;
    name: string;
    title: string | null;
    level: OfficialLevel;
    email: string | null;
    phone: string | null;
  }>(
    "SELECT id, name, title, level, email, phone FROM officials WHERE org_id = ? ORDER BY level ASC",
    [org!.id]
  );

  const canDelete = canDeleteMembers(org?.role ?? null);
  const activeIssues = issues.filter(
    (i) => i.status === "urgent" || i.status === "watch",
  );
  const positions = issues.filter((i) => i.position);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Legislative Action Center
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track issues, positions, and officials.
          </p>
        </div>
        <ButtonLink href="/advocacy/new">+ New Issue</ButtonLink>
      </div>

      {activeIssues.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {activeIssues.map((issue) => (
            <div
              key={issue.id}
              className={`rounded-lg border px-4 py-2.5 text-sm ${
                issue.status === "urgent"
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-gold/30 bg-gold/10 text-gold-light"
              }`}
            >
              <strong>{issue.status === "urgent" ? "Urgent: " : "Watching: "}</strong>
              {issue.title}
            </div>
          ))}
        </div>
      )}

      <Tabs
        tabs={[
          {
            label: `Issues (${issues.length})`,
            content: (
              <div className="flex flex-col gap-4">
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    actionCount={countByIssue.get(issue.id) ?? 0}
                    renderActions={
                      canDelete ? (
                        <form action={deleteIssue.bind(null, issue.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="!px-0 text-xs text-text-dim hover:text-red-400"
                          >
                            Delete
                          </Button>
                        </form>
                      ) : undefined
                    }
                  />
                ))}
                {issues.length === 0 && (
                  <p className="text-sm text-text-dim">
                    No issues yet. Create your first one to get started.
                  </p>
                )}
              </div>
            ),
          },
          {
            label: `Officials (${officials.length})`,
            content: (
              <div>
                <div className="mb-3 flex justify-end">
                  <ButtonLink href="/advocacy/officials/new" size="sm">
                    + Add Official
                  </ButtonLink>
                </div>
                <div className="flex flex-col gap-3">
                  {officials.map((official) => (
                    <Card key={official.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-off-white">
                          {official.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {official.title ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-text-dim">
                          {official.email ?? "No email on file"}
                          {official.phone ? ` · ${official.phone}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="muted">{LEVEL_LABEL[official.level]}</Badge>
                        {canDelete && (
                          <form action={deleteOfficial.bind(null, official.id)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="!px-0 text-xs text-text-dim hover:text-red-400"
                            >
                              Remove
                            </Button>
                          </form>
                        )}
                      </div>
                    </Card>
                  ))}
                  {officials.length === 0 && (
                    <p className="text-sm text-text-dim">No officials added yet.</p>
                  )}
                </div>
              </div>
            ),
          },
          {
            label: `Positions (${positions.length})`,
            content: (
              <div className="flex flex-col gap-3">
                {positions.map((issue) => (
                  <Card key={issue.id}>
                    <div className="font-semibold text-off-white">{issue.title}</div>
                    <p className="mt-1 text-sm text-text-muted">{issue.position}</p>
                  </Card>
                ))}
                {positions.length === 0 && (
                  <p className="text-sm text-text-dim">
                    No adopted positions yet.
                  </p>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
