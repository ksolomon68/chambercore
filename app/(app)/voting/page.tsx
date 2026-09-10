import { getCurrentOrg } from "@/lib/auth/session";
import { query, queryOne } from "@/lib/db/mysql";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink, Button } from "@/components/ui/Button";
import { VoteCard } from "@/components/voting/VoteCard";
import { closeVote } from "@/app/actions/voting";
import type { VoteStatus } from "@/lib/types/database.types";

export default async function VotingPage() {
  const org = await getCurrentOrg();

  const totalEligibleCount = await queryOne<{ total: number }>(
    "SELECT COUNT(*) as total FROM board_members WHERE org_id = ?",
    [org!.id]
  );
  const totalEligible = totalEligibleCount?.total ?? 0;

  const votes = await query<{
    id: string;
    title: string;
    description: string | null;
    status: VoteStatus;
    closes_at: string | Date | null;
  }>(
    "SELECT id, title, description, status, closes_at FROM votes WHERE org_id = ? ORDER BY created_at DESC",
    [org!.id]
  );

  const voteIds = votes.map((v) => v.id);
  const options = voteIds.length
    ? await query<{ id: string; vote_id: string; label: string; position: number }>(
        `SELECT id, vote_id, label, position FROM vote_options WHERE org_id = ? ORDER BY position ASC`,
        [org!.id]
      )
    : [];

  const casts = voteIds.length
    ? await query<{ vote_id: string; option_id: string }>(
        `SELECT vote_id, option_id FROM vote_casts WHERE org_id = ?`,
        [org!.id]
      )
    : [];

  const countByOption = new Map<string, number>();
  casts.forEach((c) => {
    countByOption.set(c.option_id, (countByOption.get(c.option_id) ?? 0) + 1);
  });

  const optionsByVote = new Map<string, { id: string; label: string; count: number }[]>();
  options.forEach((o) => {
    const list = optionsByVote.get(o.vote_id) ?? [];
    list.push({ id: o.id, label: o.label, count: countByOption.get(o.id) ?? 0 });
    optionsByVote.set(o.vote_id, list);
  });

  const canClose = canDeleteMembers(org?.role ?? null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Voting &amp; Polls
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Only board members can cast a vote.
          </p>
        </div>
        <ButtonLink href="/voting/new">+ Create Vote</ButtonLink>
      </div>

      <div className="flex flex-col gap-4">
        {votes.map((vote) => (
          <VoteCard
            key={vote.id}
            title={vote.title}
            description={vote.description}
            status={vote.status}
            closesAt={vote.closes_at ? new Date(vote.closes_at).toISOString() : null}
            options={optionsByVote.get(vote.id) ?? []}
            totalEligible={totalEligible}
            headerActions={
              canClose && vote.status === "open" ? (
                <form action={closeVote.bind(null, vote.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="!px-0 text-xs">
                    Close Vote
                  </Button>
                </form>
              ) : undefined
            }
          />
        ))}
        {votes.length === 0 && (
          <p className="text-sm text-text-dim">
            No votes yet. Create your first one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
