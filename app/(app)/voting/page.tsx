import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink, Button } from "@/components/ui/Button";
import { VoteCard } from "@/components/voting/VoteCard";
import { closeVote } from "@/app/actions/voting";

export default async function VotingPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { count: totalEligible } = await supabase
    .from("board_members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org!.id);

  const { data: votes } = await supabase
    .from("votes")
    .select("id, title, description, status, closes_at")
    .eq("org_id", org!.id)
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
    ? await supabase.from("vote_casts").select("vote_id, option_id").in("vote_id", voteIds)
    : { data: [] };

  const countByOption = new Map<string, number>();
  (casts ?? []).forEach((c) => {
    countByOption.set(c.option_id, (countByOption.get(c.option_id) ?? 0) + 1);
  });

  const optionsByVote = new Map<string, { id: string; label: string; count: number }[]>();
  (options ?? []).forEach((o) => {
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
        {(votes ?? []).map((vote) => (
          <VoteCard
            key={vote.id}
            title={vote.title}
            description={vote.description}
            status={vote.status}
            closesAt={vote.closes_at}
            options={optionsByVote.get(vote.id) ?? []}
            totalEligible={totalEligible ?? 0}
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
        {(!votes || votes.length === 0) && (
          <p className="text-sm text-text-dim">
            No votes yet. Create your first one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
