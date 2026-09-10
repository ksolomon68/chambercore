import { requireMember } from "@/lib/auth/session";
import { queryOne } from "@/lib/db/mysql";
import { ProfileForm } from "@/components/portal/ProfileForm";

export default async function PortalProfilePage() {
  const member = await requireMember();

  const listing = await queryOne<{
    description: string | null;
    website_url: string | null;
    address: string | null;
  }>(
    "SELECT description, website_url, address FROM directory_listings WHERE member_id = ?",
    [member.id]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        My Profile
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Update your contact info and how {member.businessName} appears in the
        directory.
      </p>
      <ProfileForm
        contactName={member.contactName}
        email={member.email}
        phone={member.phone}
        description={listing?.description ?? ""}
        websiteUrl={listing?.website_url ?? ""}
        address={listing?.address ?? ""}
      />
    </div>
  );
}
