"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import { queryOne, execute } from "@/lib/db/mysql";
import { requireOrg, getCurrentUser } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const CategorySchema = z.enum(["governing", "minutes", "financial", "policies", "other"]);

const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads", "documents");

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

  const user = await getCurrentUser();
  const documentId = crypto.randomUUID();
  const uniqueFileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const relativePath = path.join(org.id, uniqueFileName).replace(/\\/g, "/");
  const targetDir = path.join(UPLOAD_BASE_DIR, org.id);
  const targetFilePath = path.join(targetDir, uniqueFileName);

  try {
    await fs.mkdir(targetDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetFilePath, buffer);

    await execute(
      `INSERT INTO documents (
        id, org_id, title, category, file_path, file_name, file_size, content_type, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        org.id,
        title,
        category,
        relativePath,
        file.name,
        file.size,
        file.type || null,
        user?.id ?? null,
      ]
    );
  } catch (error: any) {
    console.error("Document upload error:", error);
    try {
      await fs.unlink(targetFilePath);
    } catch {}
    return { error: error?.message || "Could not upload document." };
  }

  revalidatePath("/documents");
  redirect("/documents");
}

export async function deleteDocument(documentId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const doc = await queryOne<{ file_path: string }>(
    "SELECT file_path FROM documents WHERE id = ? AND org_id = ?",
    [documentId, org.id]
  );

  if (!doc) return;

  try {
    const fullPath = path.join(UPLOAD_BASE_DIR, doc.file_path);
    await fs.unlink(fullPath);
  } catch (err) {
    console.warn("Could not delete file from disk:", err);
  }

  await execute("DELETE FROM documents WHERE id = ? AND org_id = ?", [
    documentId,
    org.id,
  ]);

  revalidatePath("/documents");
}
