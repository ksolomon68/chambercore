import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BoardMemberForm } from "@/components/board/BoardMemberForm";

export default async function NewBoardMemberPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, business_name")
    .eq("org_id", org!.id)
    .neq("status", "archived")
    .order("business_name", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Add Board Member
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Add a person to the board roster, optionally linked to their business.
      </p>
      <BoardMemberForm members={members ?? []} />
    </div>
  );
}
