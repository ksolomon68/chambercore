import { requireMember } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PortalBoardPage() {
  const member = await requireMember();

  const boardMembers = await query<{
    id: string;
    name: string;
    title: string | null;
    is_executive: number | boolean;
    member_id: string | null;
    business_name: string | null;
  }>(
    `SELECT b.id, b.name, b.title, b.is_executive, b.member_id, m.business_name
     FROM board_members b
     LEFT JOIN members m ON m.id = b.member_id
     WHERE b.org_id = ?
     ORDER BY b.is_executive DESC, b.name ASC`,
    [member.orgId]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Board Roster
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        {member.orgName}&apos;s board of directors.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {boardMembers.map((bm) => (
          <Card key={bm.id}>
            <div className="font-semibold text-off-white">{bm.name}</div>
            {bm.title && <div className="text-sm text-gold-light">{bm.title}</div>}
            {bm.business_name && (
              <div className="text-xs text-text-dim">
                {bm.business_name}
              </div>
            )}
            {Boolean(bm.is_executive) && (
              <div className="mt-2">
                <Badge tone="gold">Executive</Badge>
              </div>
            )}
          </Card>
        ))}
        {boardMembers.length === 0 && (
          <p className="text-sm text-text-dim">Board roster not published yet.</p>
        )}
      </div>
    </div>
  );
}
