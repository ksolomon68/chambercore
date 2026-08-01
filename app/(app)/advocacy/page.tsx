import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { IssueCard } from "@/components/advocacy/IssueCard";
import { deleteIssue, deleteOfficial } from "@/app/actions/advocacy";

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  state: "State",
  local: "Local",
};

export default async function AdvocacyPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: issues } = await supabase
    .from("advocacy_issues")
    .select("id, title, description, status, position, goal_count")
    .eq("org_id", org!.id)
    .order("created_at", { ascending: false });

  const issueIds = (issues ?? []).map((i) => i.id);
  const { data: actionLogs } = issueIds.length
    ? await supabase
        .from("advocacy_action_log")
        .select("issue_id")
        .in("issue_id", issueIds)
    : { data: [] };
  const countByIssue = new Map<string, number>();
  (actionLogs ?? []).forEach((a) => {
    countByIssue.set(a.issue_id, (countByIssue.get(a.issue_id) ?? 0) + 1);
  });

  const { data: officials } = await supabase
    .from("officials")
    .select("id, name, title, level, email, phone")
    .eq("org_id", org!.id)
    .order("level", { ascending: true });

  const canDelete = canDeleteMembers(org?.role ?? null);
  const activeIssues = (issues ?? []).filter(
    (i) => i.status === "urgent" || i.status === "watch",
  );
  const positions = (issues ?? []).filter((i) => i.position);

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
            label: `Issues (${issues?.length ?? 0})`,
            content: (
              <div className="flex flex-col gap-4">
                {(issues ?? []).map((issue) => (
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
                {(!issues || issues.length === 0) && (
                  <p className="text-sm text-text-dim">
                    No issues yet. Create your first one to get started.
                  </p>
                )}
              </div>
            ),
          },
          {
            label: `Officials (${officials?.length ?? 0})`,
            content: (
              <div>
                <div className="mb-3 flex justify-end">
                  <ButtonLink href="/advocacy/officials/new" size="sm">
                    + Add Official
                  </ButtonLink>
                </div>
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
                  {(!officials || officials.length === 0) && (
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
