import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, category, file_size, created_at")
    .eq("org_id", member.orgId)
    .order("created_at", { ascending: false });

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
              documents={(documents ?? []).filter(
                (d) => key === "all" || d.category === key,
              )}
            />
          ),
        }))}
      />
    </div>
  );
}
