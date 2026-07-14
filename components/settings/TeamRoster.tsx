"use client";

import { removeTeamMember, revokeInvite } from "@/app/actions/team";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Database } from "@/lib/types/database.types";

type OrgMember = Database["public"]["Tables"]["org_members"]["Row"] & {
  email: string;
};
type OrgInvite = Database["public"]["Tables"]["org_invites"]["Row"];

export function TeamRoster({
  members,
  invites,
  canManage,
}: {
  members: OrgMember[];
  invites: OrgInvite[];
  canManage: boolean;
  currentUserId: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">
          Team Members
        </div>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-card-border bg-card-bg px-4 py-3"
            >
              <div className="text-sm text-off-white">{m.email}</div>
              <div className="flex items-center gap-3">
                <Badge tone={m.role === "owner" ? "gold" : "muted"}>
                  {m.role}
                </Badge>
                {canManage && m.role !== "owner" && (
                  <form action={removeTeamMember.bind(null, m.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="!px-0 text-xs text-text-dim hover:text-red-400"
                    >
                      Remove
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {invites.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">
            Pending Invites
          </div>
          <div className="flex flex-col gap-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-card-border bg-card-bg px-4 py-3"
              >
                <div className="text-sm text-text-muted">{inv.email}</div>
                <div className="flex items-center gap-3">
                  <Badge tone="gold">{inv.role} · pending</Badge>
                  {canManage && (
                    <form action={revokeInvite.bind(null, inv.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="!px-0 text-xs text-text-dim hover:text-red-400"
                      >
                        Revoke
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
