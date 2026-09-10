import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { canManageTeam } from "@/lib/auth/permissions";
import { InviteForm } from "@/components/settings/InviteForm";
import { TeamRoster } from "@/components/settings/TeamRoster";

export default async function TeamSettingsPage() {
  const org = await getCurrentOrg();

  const membersWithEmail = org?.id
    ? await query<any>(
        `SELECT om.*, COALESCE(u.email, 'Unknown') AS email
         FROM org_members om
         LEFT JOIN users u ON om.user_id = u.id
         WHERE om.org_id = ?`,
        [org.id]
      )
    : [];

  const invites = org?.id
    ? await query<any>(
        "SELECT * FROM org_invites WHERE org_id = ? AND accepted_at IS NULL",
        [org.id]
      )
    : [];

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
        invites={invites}
        canManage={canManage}
        currentUserId={undefined}
      />
    </div>
  );
}

