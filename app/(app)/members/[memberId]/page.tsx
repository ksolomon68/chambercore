import { notFound } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { queryOne } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MemberForm } from "@/components/members/MemberForm";
import { InviteToPortalButton } from "@/components/members/InviteToPortalButton";
import { updateMember } from "@/app/actions/members";
import type { MemberStatus, MemberTier } from "@/lib/types/database.types";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const org = await getCurrentOrg();

  const member = await queryOne<{
    id: string;
    org_id: string;
    user_id: string | null;
    business_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    category: string | null;
    tier: MemberTier;
    status: MemberStatus;
    notes: string | null;
  }>(
    "SELECT id, org_id, user_id, business_name, contact_name, email, phone, category, tier, status, notes FROM members WHERE id = ? AND org_id = ?",
    [memberId, org!.id]
  );

  if (!member) notFound();

  const defaultValues = {
    businessName: member.business_name,
    contactName: member.contact_name ?? undefined,
    email: member.email ?? undefined,
    phone: member.phone ?? undefined,
    category: member.category ?? undefined,
    tier: member.tier,
    status: member.status,
    notes: member.notes ?? undefined,
  };

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
        defaultValues={defaultValues}
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
