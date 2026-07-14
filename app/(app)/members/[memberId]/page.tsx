import { notFound } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MemberForm } from "@/components/members/MemberForm";
import { updateMember } from "@/app/actions/members";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", memberId)
    .eq("org_id", org!.id)
    .maybeSingle();

  if (!member) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        {member.business_name}
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Update this member&apos;s details.
      </p>
      <MemberForm
        action={updateMember.bind(null, memberId)}
        defaultValues={member}
        submitLabel="Save Changes"
      />
    </div>
  );
}
