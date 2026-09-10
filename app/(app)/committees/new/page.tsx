import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { CommitteeForm } from "@/components/committees/CommitteeForm";

export default async function NewCommitteePage() {
  const org = await getCurrentOrg();

  const boardMembers = org?.id
    ? await query<any>(
        "SELECT id, name, title FROM board_members WHERE org_id = ? ORDER BY name ASC",
        [org.id]
      )
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        New Committee
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Committees are made up of board members.
      </p>
      <CommitteeForm boardMembers={boardMembers} />
    </div>
  );
}

