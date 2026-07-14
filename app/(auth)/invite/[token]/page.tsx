import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteAcceptButton } from "@/components/auth/InviteAcceptButton";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: invite } = await admin
    .from("org_invites")
    .select("org_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-off-white">
          Invite not found
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          This invite link is invalid. Ask your chamber admin to send a new one.
        </p>
      </div>
    );
  }

  const { data: org } = await admin
    .from("organizations")
    .select("name")
    .eq("id", invite.org_id)
    .maybeSingle();

  const orgName = org?.name ?? "your chamber";

  if (invite.accepted_at) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-off-white">
          Already accepted
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          This invite has already been used.{" "}
          <Link href="/login" className="text-gold hover:text-gold-light">
            Log in
          </Link>{" "}
          instead.
        </p>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-off-white">
          Invite expired
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Ask your chamber admin to send a new invite.
        </p>
      </div>
    );
  }

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/invite/${token}`)}&inviteEmail=${encodeURIComponent(invite.email)}`,
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Join {orgName}
      </h1>
      <p className="mt-2 mb-6 text-sm text-text-muted">
        You&apos;ve been invited as <span className="text-gold">{invite.role}</span>.
      </p>
      <InviteAcceptButton token={token} />
    </div>
  );
}
