import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VoteCard } from "@/components/voting/VoteCard";
import { castVote } from "@/app/actions/voting";

export default async function PortalVotingPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: myBoardMember } = await supabase
    .from("board_members")
    .select("id")
    .eq("org_id", member.orgId)
    .eq("member_id", member.id)
    .maybeSingle();

  const { count: totalEligible } = await supabase
    .from("board_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", member.orgId);

  const { data: votes } = await supabase
    .from("votes")
    .select("id, title, description, status, closes_at")
    .eq("org_id", member.orgId)
    .order("created_at", { ascending: false });

  const voteIds = (votes ?? []).map((v) => v.id);
  const { data: options } = voteIds.length
    ? await supabase
        .from("vote_options")
        .select("id, vote_id, label, position")
        .in("vote_id", voteIds)
        .order("position", { ascending: true })
    : { data: [] };
  const { data: casts } = voteIds.length
    ? await supabase.from("vote_casts").select("vote_id, option_id, board_member_id").in("vote_id", voteIds)
    : { data: [] };

  const countByOption = new Map<string, number>();
  const myCastByVote = new Map<string, string>();
  (casts ?? []).forEach((c) => {
    countByOption.set(c.option_id, (countByOption.get(c.option_id) ?? 0) + 1);
    if (myBoardMember && c.board_member_id === myBoardMember.id) {
      myCastByVote.set(c.vote_id, c.option_id);
    }
  });

  const optionsByVote = new Map<string, { id: string; label: string; count: number }[]>();
  (options ?? []).forEach((o) => {
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
        {(votes ?? []).map((vote) => {
          const voteOptions = optionsByVote.get(vote.id) ?? [];
          const myCast = myCastByVote.get(vote.id);
          const canCastNow = myBoardMember && vote.status === "open" && !myCast;

          return (
            <VoteCard
              key={vote.id}
              title={vote.title}
              description={vote.description}
              status={vote.status}
              closesAt={vote.closes_at}
              options={voteOptions}
              totalEligible={totalEligible ?? 0}
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
        {(!votes || votes.length === 0) && (
          <Card>
            <p className="text-sm text-text-dim">No votes yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
