import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { IssueCard } from "@/components/advocacy/IssueCard";
import { logAction } from "@/app/actions/advocacy";

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  state: "State",
  local: "Local",
};

export default async function PortalAdvocacyPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: issues } = await supabase
    .from("advocacy_issues")
    .select(
      "id, title, description, status, position, goal_count, cta_headline, cta_email_subject, cta_email_body",
    )
    .eq("org_id", member.orgId)
    .neq("status", "resolved")
    .order("created_at", { ascending: false });

  const issueIds = (issues ?? []).map((i) => i.id);
  const { data: actionLogs } = issueIds.length
    ? await supabase
        .from("advocacy_action_log")
        .select("issue_id, member_id")
        .in("issue_id", issueIds)
    : { data: [] };
  const countByIssue = new Map<string, number>();
  const myActionIssues = new Set<string>();
  (actionLogs ?? []).forEach((a) => {
    countByIssue.set(a.issue_id, (countByIssue.get(a.issue_id) ?? 0) + 1);
    if (a.member_id === member.id) myActionIssues.add(a.issue_id);
  });

  const { data: officials } = await supabase
    .from("officials")
    .select("id, name, title, level, email")
    .eq("org_id", member.orgId)
    .order("level", { ascending: true });

  const positions = (issues ?? []).filter((i) => i.position);

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
            label: `Issues (${issues?.length ?? 0})`,
            content: (
              <div className="flex flex-col gap-4">
                {(issues ?? []).map((issue) => {
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
                {(!issues || issues.length === 0) && (
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
            label: `Officials (${officials?.length ?? 0})`,
            content: (
              <div className="flex flex-col gap-3">
                {(officials ?? []).map((official) => (
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
                {(!officials || officials.length === 0) && (
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
