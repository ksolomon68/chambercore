"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireOrg, getCurrentUser } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const CategorySchema = z.enum(["governing", "minutes", "financial", "policies", "other"]);

export async function uploadDocument(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to upload documents." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const titleRaw = formData.get("title");
  const title = typeof titleRaw === "string" && titleRaw.trim() ? titleRaw.trim() : file.name;

  const parsedCategory = CategorySchema.safeParse(formData.get("category"));
  const category = parsedCategory.success ? parsedCategory.data : "other";

  const supabase = await createClient();
  const user = await getCurrentUser();

  const path = `${org.id}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("documents").insert({
    org_id: org.id,
    title,
    category,
    file_path: path,
    file_name: file.name,
    file_size: file.size,
    content_type: file.type || null,
    uploaded_by: user?.id ?? null,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([path]);
    return { error: insertError.message };
  }

  revalidatePath("/documents");
  redirect("/documents");
}

export async function deleteDocument(documentId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!doc) return;

  await supabase.storage.from("documents").remove([doc.file_path]);
  await supabase.from("documents").delete().eq("id", documentId).eq("org_id", org.id);

  revalidatePath("/documents");
}
