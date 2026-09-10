import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";
import type { DocumentCategory } from "@/lib/types/database.types";

const CATEGORIES: { key: DocumentCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "governing", label: "Governing" },
  { key: "minutes", label: "Minutes" },
  { key: "financial", label: "Financial" },
  { key: "policies", label: "Policies" },
];

export default async function DocumentsPage() {
  const org = await getCurrentOrg();

  const documents = await query<{
    id: string;
    title: string;
    category: DocumentCategory;
    file_size: number | null;
    created_at: string | Date;
  }>(
    "SELECT id, title, category, file_size, created_at FROM documents WHERE org_id = ? ORDER BY created_at DESC",
    [org!.id]
  );

  const canDelete = canDeleteMembers(org?.role ?? null);

  const formattedDocs = documents.map((d) => ({
    ...d,
    created_at: d.created_at instanceof Date ? d.created_at.toISOString() : String(d.created_at),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Document Vault
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {documents.length} document{documents.length === 1 ? "" : "s"}
          </p>
        </div>
        <ButtonLink href="/documents/new">+ Upload</ButtonLink>
      </div>

      <Tabs
        tabs={CATEGORIES.map(({ key, label }) => ({
          label,
          content: (
            <DocumentGrid
              documents={formattedDocs.filter(
                (d) => key === "all" || d.category === key,
              )}
              renderActions={
                canDelete
                  ? (id) => <DeleteDocumentButton documentId={id} />
                  : undefined
              }
            />
          ),
        }))}
      />
    </div>
  );
}
