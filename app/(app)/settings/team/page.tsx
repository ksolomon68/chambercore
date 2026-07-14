import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/auth/permissions";
import { InviteForm } from "@/components/settings/InviteForm";
import { TeamRoster } from "@/components/settings/TeamRoster";

export default async function TeamSettingsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: members } = await supabase
    .from("org_members")
    .select("*")
    .eq("org_id", org!.id);

  const membersWithEmail = await Promise.all(
    (members ?? []).map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return { ...m, email: data.user?.email ?? "Unknown" };
    }),
  );

  const { data: invites } = await supabase
    .from("org_invites")
    .select("*")
    .eq("org_id", org!.id)
    .is("accepted_at", null);

  const canManage = canManageTeam(org?.role ?? null);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Team
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Manage who has access to your chamber&apos;s back office.
      </p>

      {canManage && <InviteForm />}

      <TeamRoster
        members={membersWithEmail}
        invites={invites ?? []}
        canManage={canManage}
        currentUserId={undefined}
      />
    </div>
  );
}
