import { notFound } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MemberForm } from "@/components/members/MemberForm";
import { InviteToPortalButton } from "@/components/members/InviteToPortalButton";
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

      <Card className="mt-6 max-w-xl">
        <h2 className="mb-3 text-sm font-semibold text-off-white">
          Portal Access
        </h2>
        {member.user_id ? (
          <Badge tone="green">Has portal access</Badge>
        ) : (
          <>
            <p className="mb-3 text-sm text-text-muted">
              Let this member log in to manage their own contact info and
              directory listing.
            </p>
            <InviteToPortalButton memberId={member.id} />
          </>
        )}
      </Card>
    </div>
  );
}
