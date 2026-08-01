import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS on `documents` scopes this to the caller's own org, whether they're
  // staff (org_members) or a portal member.
  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, file_name")
    .eq("id", id)
    .maybeSingle();

  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.file_path, 60, { download: doc.file_name });

  if (error || !data) {
    return NextResponse.json({ error: "Could not generate download link." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
