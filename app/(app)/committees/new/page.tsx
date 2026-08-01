import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CommitteeForm } from "@/components/committees/CommitteeForm";

export default async function NewCommitteePage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: boardMembers } = await supabase
    .from("board_members")
    .select("id, name, title")
    .eq("org_id", org!.id)
    .order("name", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        New Committee
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Committees are made up of board members.
      </p>
      <CommitteeForm boardMembers={boardMembers ?? []} />
    </div>
  );
}
