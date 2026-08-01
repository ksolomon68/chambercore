import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/portal/ProfileForm";

export default async function PortalProfilePage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("directory_listings")
    .select("description, website_url, address")
    .eq("member_id", member.id)
    .maybeSingle();

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
