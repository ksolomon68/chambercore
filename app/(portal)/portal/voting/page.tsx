import { requireMember } from "@/lib/auth/session";
import { query, queryOne } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VoteCard } from "@/components/voting/VoteCard";
import { castVote } from "@/app/actions/voting";

export default async function PortalVotingPage() {
  const member = await requireMember();

  const myBoardMember = await queryOne<{ id: string }>(
    "SELECT id FROM board_members WHERE org_id = ? AND member_id = ?",
    [member.orgId, member.id]
  );

  const totalEligibleCount = await queryOne<{ total: number }>(
    "SELECT COUNT(*) as total FROM board_members WHERE org_id = ?",
    [member.orgId]
  );
  const totalEligible = totalEligibleCount?.total ?? 0;

  const votes = await query<{
    id: string;
    title: string;
    description: string | null;
    status: "open" | "closed";
    closes_at: string | Date | null;
  }>(
    "SELECT id, title, description, status, closes_at FROM votes WHERE org_id = ? ORDER BY created_at DESC",
    [member.orgId]
  );

  const voteIds = votes.map((v) => v.id);

  const options = voteIds.length
    ? await query<{ id: string; vote_id: string; label: string; position: number }>(
        `SELECT id, vote_id, label, position FROM vote_options WHERE org_id = ? ORDER BY position ASC`,
        [member.orgId]
      )
    : [];

  const casts = voteIds.length
    ? await query<{ vote_id: string; option_id: string; board_member_id: string }>(
        `SELECT vote_id, option_id, board_member_id FROM vote_casts WHERE org_id = ?`,
        [member.orgId]
      )
    : [];

  const countByOption = new Map<string, number>();
  const myCastByVote = new Map<string, string>();
  casts.forEach((c) => {
    countByOption.set(c.option_id, (countByOption.get(c.option_id) ?? 0) + 1);
    if (myBoardMember && c.board_member_id === myBoardMember.id) {
      myCastByVote.set(c.vote_id, c.option_id);
    }
  });

  const optionsByVote = new Map<string, { id: string; label: string; count: number }[]>();
  options.forEach((o) => {
    const list = optionsByVote.get(o.vote_id) ?? [];
    list.push({ id: o.id, label: o.label, count: countByOption.get(o.id) ?? 0 });
    optionsByVote.set(o.vote_id, list);
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Voting &amp; Polls
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        {myBoardMember
          ? "Cast your vote as a board member."
          : "Voting is limited to board members — results are visible to all members."}
      </p>

      <div className="flex flex-col gap-4">
        {votes.map((vote) => {
          const voteOptions = optionsByVote.get(vote.id) ?? [];
          const myCast = myCastByVote.get(vote.id);
          const canCastNow = myBoardMember && vote.status === "open" && !myCast;

          return (
            <VoteCard
              key={vote.id}
              title={vote.title}
              description={vote.description}
              status={vote.status}
              closesAt={vote.closes_at ? new Date(vote.closes_at).toISOString() : null}
              options={voteOptions}
              totalEligible={totalEligible}
              footerActions={
                canCastNow ? (
                  <form
                    action={castVote.bind(null, vote.id)}
                    className="flex flex-col gap-2 border-t border-card-border pt-3"
                  >
                    {voteOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 text-sm text-off-white"
                      >
                        <input
                          type="radio"
                          name="optionId"
                          value={option.id}
                          required
                          className="accent-gold"
                        />
                        {option.label}
                      </label>
                    ))}
                    <Button type="submit" size="sm" className="w-fit">
                      Cast Your Vote
                    </Button>
                  </form>
                ) : myBoardMember && myCast ? (
                  <div className="border-t border-card-border pt-3">
                    <Badge tone="green">You voted</Badge>
                  </div>
                ) : undefined
              }
            />
          );
        })}
        {votes.length === 0 && (
          <Card>
            <p className="text-sm text-text-dim">No votes yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
