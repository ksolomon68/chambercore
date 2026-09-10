import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { BoardMemberForm } from "@/components/board/BoardMemberForm";

export default async function NewBoardMemberPage() {
  const org = await getCurrentOrg();

  const members = org?.id
    ? await query<any>(
        "SELECT id, business_name FROM members WHERE org_id = ? AND status != 'archived' ORDER BY business_name ASC",
        [org.id]
      )
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Add Board Member
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Add a person to the board roster, optionally linked to their business.
      </p>
      <BoardMemberForm members={members} />
    </div>
  );
}

