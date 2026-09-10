import { requireMember } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { Tabs } from "@/components/ui/Tabs";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import type { DocumentCategory } from "@/lib/types/database.types";

const CATEGORIES: { key: DocumentCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "governing", label: "Governing" },
  { key: "minutes", label: "Minutes" },
  { key: "financial", label: "Financial" },
  { key: "policies", label: "Policies" },
];

export default async function PortalDocumentsPage() {
  const member = await requireMember();

  const documents = await query<{
    id: string;
    title: string;
    category: DocumentCategory;
    file_size: number | null;
    created_at: string | Date;
  }>(
    "SELECT id, title, category, file_size, created_at FROM documents WHERE org_id = ? ORDER BY created_at DESC",
    [member.orgId]
  );

  const formattedDocs = documents.map((d) => ({
    ...d,
    created_at: d.created_at instanceof Date ? d.created_at.toISOString() : String(d.created_at),
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Document Vault
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Chamber documents shared with members.
      </p>

      <Tabs
        tabs={CATEGORIES.map(({ key, label }) => ({
          label,
          content: (
            <DocumentGrid
              documents={formattedDocs.filter(
                (d) => key === "all" || d.category === key,
              )}
            />
          ),
        }))}
      />
    </div>
  );
}
