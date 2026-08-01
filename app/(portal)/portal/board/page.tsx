import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PortalBoardPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: boardMembers } = await supabase
    .from("board_members")
    .select("id, name, title, is_executive, member_id")
    .eq("org_id", member.orgId)
    .order("is_executive", { ascending: false });

  const memberIds = (boardMembers ?? [])
    .map((b) => b.member_id)
    .filter((id): id is string => Boolean(id));
  const { data: businesses } = memberIds.length
    ? await supabase.from("members").select("id, business_name").in("id", memberIds)
    : { data: [] };
  const businessById = new Map((businesses ?? []).map((b) => [b.id, b.business_name]));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Board Roster
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        {member.orgName}&apos;s board of directors.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(boardMembers ?? []).map((bm) => (
          <Card key={bm.id}>
            <div className="font-semibold text-off-white">{bm.name}</div>
            {bm.title && <div className="text-sm text-gold-light">{bm.title}</div>}
            {bm.member_id && businessById.get(bm.member_id) && (
              <div className="text-xs text-text-dim">
                {businessById.get(bm.member_id)}
              </div>
            )}
            {bm.is_executive && (
              <div className="mt-2">
                <Badge tone="gold">Executive</Badge>
              </div>
            )}
          </Card>
        ))}
        {(!boardMembers || boardMembers.length === 0) && (
          <p className="text-sm text-text-dim">Board roster not published yet.</p>
        )}
      </div>
    </div>
  );
}
