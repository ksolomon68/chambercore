import { requireMember } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { CommitteeCard } from "@/components/committees/CommitteeCard";
import type { CommitteeType } from "@/lib/types/database.types";

export default async function PortalCommitteesPage() {
  const member = await requireMember();

  const committees = await query<{
    id: string;
    name: string;
    description: string | null;
    committee_type: CommitteeType;
    chair_board_member_id: string | null;
    next_meeting_at: string | Date | null;
  }>(
    "SELECT id, name, description, committee_type, chair_board_member_id, next_meeting_at FROM committees WHERE org_id = ? ORDER BY created_at ASC",
    [member.orgId]
  );

  const boardMembers = await query<{ id: string; name: string }>(
    "SELECT id, name FROM board_members WHERE org_id = ?",
    [member.orgId]
  );
  const nameByBoardMemberId = new Map(boardMembers.map((b) => [b.id, b.name]));

  const committeeIds = committees.map((c) => c.id);
  const memberships = committeeIds.length
    ? await query<{ committee_id: string; board_member_id: string }>(
        `SELECT committee_id, board_member_id FROM committee_memberships WHERE committee_id IN (${committeeIds.map(() => "?").join(",")})`,
        committeeIds
      )
    : [];

  const membersByCommittee = new Map<string, string[]>();
  memberships.forEach((m) => {
    const name = nameByBoardMemberId.get(m.board_member_id);
    if (!name) return;
    const list = membersByCommittee.get(m.committee_id) ?? [];
    list.push(name);
    membersByCommittee.set(m.committee_id, list);
  });

  const formattedCommittees = committees.map((c) => ({
    ...c,
    next_meeting_at: c.next_meeting_at
      ? c.next_meeting_at instanceof Date
        ? c.next_meeting_at.toISOString()
        : String(c.next_meeting_at)
      : null,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Committees
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        {member.orgName}&apos;s board committees.
      </p>

      <div className="flex flex-col gap-4">
        {formattedCommittees.map((committee) => (
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
        {formattedCommittees.length === 0 && (
          <p className="text-sm text-text-dim">No committees published yet.</p>
        )}
      </div>
    </div>
  );
}
