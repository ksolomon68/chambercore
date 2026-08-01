import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink, Button } from "@/components/ui/Button";
import { CommitteeCard } from "@/components/committees/CommitteeCard";
import { deleteCommittee } from "@/app/actions/committees";

export default async function CommitteesPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: committees } = await supabase
    .from("committees")
    .select("id, name, description, committee_type, chair_board_member_id, next_meeting_at")
    .eq("org_id", org!.id)
    .order("created_at", { ascending: true });

  const { data: boardMembers } = await supabase
    .from("board_members")
    .select("id, name")
    .eq("org_id", org!.id);
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

  const canDelete = canDeleteMembers(org?.role ?? null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Committees
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage board committees and their membership.
          </p>
        </div>
        <ButtonLink href="/committees/new">+ New Committee</ButtonLink>
      </div>

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
            renderActions={
              canDelete ? (
                <form action={deleteCommittee.bind(null, committee.id)}>
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
        {(!committees || committees.length === 0) && (
          <p className="text-sm text-text-dim">
            No committees yet. Create your first one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
