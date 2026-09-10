import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { queryOne } from "@/lib/db/mysql";
import { getCurrentUser, getCurrentOrg, getCurrentMember } from "@/lib/auth/session";

const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads", "documents");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staffOrg = await getCurrentOrg();
  const portalMember = await getCurrentMember();
  const orgId = staffOrg?.id || portalMember?.orgId;

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await queryOne<{
    file_path: string;
    file_name: string;
    content_type: string | null;
  }>("SELECT file_path, file_name, content_type FROM documents WHERE id = ? AND org_id = ?", [
    id,
    orgId,
  ]);

  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const fullPath = path.join(UPLOAD_BASE_DIR, doc.file_path);

  try {
    const fileBuffer = await fs.readFile(fullPath);
    const contentType = doc.content_type || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.file_name)}"`,
      },
    });
  } catch (err) {
    console.error("Document download read error:", err);
    return NextResponse.json({ error: "File not found on server disk." }, { status: 404 });
  }
}
