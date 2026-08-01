import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CommitteeCard } from "@/components/committees/CommitteeCard";

export default async function PortalCommitteesPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: committees } = await supabase
    .from("committees")
    .select("id, name, description, committee_type, chair_board_member_id, next_meeting_at")
    .eq("org_id", member.orgId)
    .order("created_at", { ascending: true });

  const { data: boardMembers } = await supabase
    .from("board_members")
    .select("id, name")
    .eq("org_id", member.orgId);
  const nameByBoardMemberId = new Map((boardMembers ?? []).map((b) => [b.id, b.name]));

  const committeeIds = (committees ?? []).map((c) => c.id);
  const { data: memberships } = committeeIds.length
    ? await supabase
        .from("committee_memberships")
        .select("committee_id, board_member_id")
        .in("committee_id", committeeIds)
    : { data: [] };
  const membersByCommittee = new Map<string, string[]>();
  (memberships ?? []).forEach((m) => {
    const name = nameByBoardMemberId.get(m.board_member_id);
    if (!name) return;
    const list = membersByCommittee.get(m.committee_id) ?? [];
    list.push(name);
    membersByCommittee.set(m.committee_id, list);
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Committees
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        {member.orgName}&apos;s board committees.
      </p>

      <div className="flex flex-col gap-4">
        {(committees ?? []).map((committee) => (
          <CommitteeCard
            key={committee.id}
            committee={committee}
            chairName={
              committee.chair_board_member_id
                ? (nameByBoardMemberId.get(committee.chair_board_member_id) ?? null)
                : null
            }
            memberNames={membersByCommittee.get(committee.id) ?? []}
          />
        ))}
        {(!committees || committees.length === 0) && (
          <p className="text-sm text-text-dim">No committees published yet.</p>
        )}
      </div>
    </div>
  );
}
