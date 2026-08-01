import Link from "next/link";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink, Button } from "@/components/ui/Button";
import { deleteBoardMember } from "@/app/actions/board";

export default async function BoardOverviewPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const [
    { data: boardMembers },
    { count: meetingsYtd },
    { data: openVotes },
    { count: docsCount },
    { data: upcomingMeetings },
  ] = await Promise.all([
    supabase
      .from("board_members")
      .select("id, name, title, is_executive")
      .eq("org_id", org!.id),
    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org!.id)
      .gte("starts_at", yearStart),
    supabase
      .from("votes")
      .select("id, title, closes_at")
      .eq("org_id", org!.id)
      .eq("status", "open"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org!.id),
    supabase
      .from("meetings")
      .select("id, title, starts_at, location")
      .eq("org_id", org!.id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3),
  ]);

  const voteIds = (openVotes ?? []).map((v) => v.id);
  const { data: castCounts } = voteIds.length
    ? await supabase.from("vote_casts").select("vote_id").in("vote_id", voteIds)
    : { data: [] };
  const castsByVote = new Map<string, number>();
  (castCounts ?? []).forEach((c) => {
    castsByVote.set(c.vote_id, (castsByVote.get(c.vote_id) ?? 0) + 1);
  });

  const canDelete = canDeleteMembers(org?.role ?? null);
  const totalBoardMembers = boardMembers?.length ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Board Overview
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            A snapshot of board membership, meetings, and votes.
          </p>
        </div>
        <ButtonLink href="/board/new">+ Add Board Member</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Board Members" value={totalBoardMembers} />
        <StatCard label="Meetings YTD" value={meetingsYtd ?? 0} />
        <StatCard label="Open Votes" value={openVotes?.length ?? 0} />
        <StatCard label="Docs in Vault" value={docsCount ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-off-white">
              Upcoming Meetings
            </div>
            <Link href="/meetings" className="text-xs text-gold hover:text-gold-light">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {(upcomingMeetings ?? []).map((m) => (
              <div key={m.id} className="rounded-lg bg-navy p-3 text-sm">
                <div className="font-semibold text-off-white">{m.title}</div>
                <div className="text-xs text-text-muted">
                  {new Date(m.starts_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  &middot; {m.location ?? "Location TBD"}
                </div>
              </div>
            ))}
            {(!upcomingMeetings || upcomingMeetings.length === 0) && (
              <p className="text-xs text-text-dim">No upcoming meetings.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-off-white">
              Open Votes
            </div>
            <Link href="/voting" className="text-xs text-gold hover:text-gold-light">
              Vote Now
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {(openVotes ?? []).map((v) => (
              <div key={v.id} className="rounded-lg bg-navy p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-off-white">
                    {v.title}
                  </span>
                  <Badge tone="green">Open</Badge>
                </div>
                <ProgressBar
                  value={castsByVote.get(v.id) ?? 0}
                  max={totalBoardMembers || null}
                />
                <div className="mt-1 text-xs text-text-dim">
                  {castsByVote.get(v.id) ?? 0} of {totalBoardMembers} votes cast
                  {v.closes_at
                    ? ` · Closes ${new Date(v.closes_at).toLocaleDateString()}`
                    : ""}
                </div>
              </div>
            ))}
            {(!openVotes || openVotes.length === 0) && (
              <p className="text-xs text-text-dim">No open votes.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
          Board Roster
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {(boardMembers ?? []).map((bm) => (
                <tr key={bm.id} className="border-t border-card-border">
                  <td className="px-4 py-3 font-medium text-off-white">
                    {bm.name}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {bm.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {bm.is_executive && <Badge tone="gold">Executive</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canDelete && (
                      <form action={deleteBoardMember.bind(null, bm.id)}>
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
                  </td>
                </tr>
              ))}
              {(!boardMembers || boardMembers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-text-dim">
                    No board members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
