import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OrganizationForm } from "@/components/settings/OrganizationForm";

export default async function OrganizationSettingsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: fullOrg } = await supabase
    .from("organizations")
    .select("name, slug, primary_color")
    .eq("id", org!.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Organization Settings
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Your chamber&apos;s public directory lives at{" "}
        <code className="text-gold-light">/c/{fullOrg?.slug}</code>.
      </p>
      <OrganizationForm
        defaultName={fullOrg?.name ?? ""}
        defaultColor={fullOrg?.primary_color ?? "#C8942A"}
        canEdit={org?.role === "owner" || org?.role === "admin"}
      />
    </div>
  );
}
