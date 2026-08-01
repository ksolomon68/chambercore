import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("org_invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (inviteError || !invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json(
      { error: "This invite has already been used." },
      { status: 410 },
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }

  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address." },
      { status: 403 },
    );
  }

  if (invite.role === "member") {
    if (!invite.member_id) {
      return NextResponse.json(
        { error: "This invite is missing a linked member record." },
        { status: 500 },
      );
    }

    const { error: linkError } = await admin
      .from("members")
      .update({ user_id: user.id })
      .eq("id", invite.member_id);

    if (linkError) {
      return NextResponse.json(
        { error: "Could not link your account. Please contact your chamber." },
        { status: 500 },
      );
    }

    await admin
      .from("org_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    return NextResponse.json({ portal: true });
  }

  const { error: memberError } = await admin.from("org_members").upsert(
    {
      org_id: invite.org_id,
      user_id: user.id,
      role: invite.role,
    },
    { onConflict: "org_id,user_id" },
  );

  if (memberError) {
    return NextResponse.json(
      { error: "Could not add you to the organization." },
      { status: 500 },
    );
  }

  await admin
    .from("org_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ orgId: invite.org_id });
}
