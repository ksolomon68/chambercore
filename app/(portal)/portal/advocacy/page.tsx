import { requireMember } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { IssueCard } from "@/components/advocacy/IssueCard";
import { logAction } from "@/app/actions/advocacy";
import type { IssueStatus, OfficialLevel } from "@/lib/types/database.types";

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  state: "State",
  local: "Local",
};

export default async function PortalAdvocacyPage() {
  const member = await requireMember();

  const issues = await query<{
    id: string;
    title: string;
    description: string | null;
    status: IssueStatus;
    position: string | null;
    goal_count: number | null;
    cta_headline: string | null;
    cta_email_subject: string | null;
    cta_email_body: string | null;
  }>(
    `SELECT id, title, description, status, position, goal_count,
            cta_headline, cta_email_subject, cta_email_body
     FROM advocacy_issues
     WHERE org_id = ? AND status != 'resolved'
     ORDER BY created_at DESC`,
    [member.orgId]
  );

  const issueIds = issues.map((i) => i.id);
  const actionLogs = issueIds.length
    ? await query<{ issue_id: string; member_id: string }>(
        `SELECT issue_id, member_id FROM advocacy_action_log WHERE issue_id IN (${issueIds.map(() => "?").join(",")})`,
        issueIds
      )
    : [];

  const countByIssue = new Map<string, number>();
  const myActionIssues = new Set<string>();
  actionLogs.forEach((a) => {
    countByIssue.set(a.issue_id, (countByIssue.get(a.issue_id) ?? 0) + 1);
    if (a.member_id === member.id) myActionIssues.add(a.issue_id);
  });

  const officials = await query<{
    id: string;
    name: string;
    title: string | null;
    level: OfficialLevel;
    email: string | null;
  }>(
    "SELECT id, name, title, level, email FROM officials WHERE org_id = ? ORDER BY level ASC",
    [member.orgId]
  );

  const positions = issues.filter((i) => i.position);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Legislative Action Center
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Stay informed and make your voice heard.
      </p>

      <Tabs
        tabs={[
          {
            label: `Issues (${issues.length})`,
            content: (
              <div className="flex flex-col gap-4">
                {issues.map((issue) => {
                  const hasActed = myActionIssues.has(issue.id);
                  const mailto = `mailto:?subject=${encodeURIComponent(
                    issue.cta_email_subject ?? issue.title,
                  )}&body=${encodeURIComponent(issue.cta_email_body ?? "")}`;

                  return (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      actionCount={countByIssue.get(issue.id) ?? 0}
                      footerActions={
                        issue.cta_headline || issue.cta_email_body ? (
                          <div>
                            {issue.cta_headline && (
                              <div className="mb-2 text-sm font-semibold text-gold-light">
                                {issue.cta_headline}
                              </div>
                            )}
                            {hasActed ? (
                              <Badge tone="green">You took action ✓</Badge>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={mailto}
                                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold-light"
                                >
                                  Draft Email
                                </a>
                                <form action={logAction.bind(null, issue.id)}>
                                  <Button type="submit" variant="outline" size="sm">
                                    I Contacted My Officials
                                  </Button>
                                </form>
                              </div>
                            )}
                          </div>
                        ) : undefined
                      }
                    />
                  );
                })}
                {issues.length === 0 && (
                  <Card>
                    <p className="text-sm text-text-dim">
                      No active issues right now.
                    </p>
                  </Card>
                )}
              </div>
            ),
          },
          {
            label: `Officials (${officials.length})`,
            content: (
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
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{LEVEL_LABEL[official.level]}</Badge>
                      {official.email && (
                        <a
                          href={`mailto:${official.email}`}
                          className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-off-white hover:border-gold/60"
                        >
                          Draft Email
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
                {officials.length === 0 && (
                  <p className="text-sm text-text-dim">
                    No officials published yet.
                  </p>
                )}
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
