import Link from "next/link";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { StatusBadge } from "@/components/members/StatusBadge";
import { TierBadge } from "@/components/members/TierBadge";
import { archiveMember } from "@/app/actions/members";

export default async function MembersPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("org_id", org!.id)
    .order("business_name", { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Member Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {members?.length ?? 0} member{members?.length === 1 ? "" : "s"}
            {org?.memberLimit ? ` of ${org.memberLimit} allowed` : ""}
          </p>
        </div>
        <ButtonLink href="/members/new">+ Add Member</ButtonLink>
      </div>

      <div className="overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card-bg text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Since</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => (
              <tr key={m.id} className="border-t border-card-border">
                <td className="px-4 py-3 font-medium text-off-white">
                  {m.business_name}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {m.contact_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {m.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={m.tier} />
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(m.member_since).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/members/${m.id}`}
                      className="text-xs text-gold hover:text-gold-light"
                    >
                      Edit
                    </Link>
                    {canDeleteMembers(org?.role ?? null) &&
                      m.status !== "archived" && (
                        <form action={archiveMember.bind(null, m.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="!px-0 text-xs text-text-dim hover:text-red-400"
                          >
                            Archive
                          </Button>
                        </form>
                      )}
                  </div>
                </td>
              </tr>
            ))}
            {(!members || members.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-dim">
                  No members yet. Add your first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
