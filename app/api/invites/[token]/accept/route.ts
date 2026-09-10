import { NextResponse } from "next/server";
import crypto from "crypto";
import { queryOne, execute, transaction } from "@/lib/db/mysql";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const invite = await queryOne<{
    id: string;
    org_id: string;
    email: string;
    role: "admin" | "staff" | "member";
    member_id: string | null;
    expires_at: string | Date;
    accepted_at: string | Date | null;
  }>("SELECT * FROM org_invites WHERE token = ?", [token]);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json(
      { error: "This invite has already been used." },
      { status: 410 },
    );
  }

  const expiresDate = new Date(invite.expires_at);
  if (expiresDate < new Date()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }

  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite was sent to a different email address." },
      { status: 403 },
    );
  }

  try {
    if (invite.role === "member") {
      if (!invite.member_id) {
        return NextResponse.json(
          { error: "This invite is missing a linked member record." },
          { status: 500 },
        );
      }

      await transaction(async (conn) => {
        await conn.execute("UPDATE members SET user_id = ? WHERE id = ?", [
          user.id,
          invite.member_id,
        ]);
        await conn.execute("UPDATE org_invites SET accepted_at = NOW() WHERE id = ?", [
          invite.id,
        ]);
      });

      return NextResponse.json({ portal: true });
    }

    // Staff/Admin invite
    const orgMemberId = crypto.randomUUID();
    await transaction(async (conn) => {
      await conn.execute(
        `INSERT INTO org_members (id, org_id, user_id, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [orgMemberId, invite.org_id, user.id, invite.role]
      );
      await conn.execute("UPDATE org_invites SET accepted_at = NOW() WHERE id = ?", [
        invite.id,
      ]);
    });

    return NextResponse.json({ orgId: invite.org_id });
  } catch (err: any) {
    console.error("Invite acceptance error:", err);
    return NextResponse.json(
      { error: "Could not accept invite. Please try again." },
      { status: 500 },
    );
  }
}
