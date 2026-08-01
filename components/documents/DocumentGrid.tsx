import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DocumentCategory } from "@/lib/types/database.types";

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  governing: "Governing",
  minutes: "Minutes",
  financial: "Financial",
  policies: "Policies",
  other: "Other",
};

const CATEGORY_TONE: Record<DocumentCategory, "gold" | "teal" | "green" | "muted"> = {
  governing: "gold",
  minutes: "teal",
  financial: "green",
  policies: "muted",
  other: "muted",
};

function formatSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentGrid({
  documents,
  renderActions,
}: {
  documents: {
    id: string;
    title: string;
    category: DocumentCategory;
    file_size: number | null;
    created_at: string;
  }[];
  renderActions?: (documentId: string) => React.ReactNode;
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-text-dim">No documents in this category yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <div className="text-2xl">📄</div>
          <div className="mt-2 font-semibold text-off-white">{doc.title}</div>
          <div className="mt-1 text-xs text-text-muted">
            {new Date(doc.created_at).toLocaleDateString()}
            {formatSize(doc.file_size) ? ` · ${formatSize(doc.file_size)}` : ""}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge tone={CATEGORY_TONE[doc.category]}>
              {CATEGORY_LABEL[doc.category]}
            </Badge>
            <div className="flex items-center gap-3 text-xs">
              <a
                href={`/api/documents/${doc.id}/download`}
                className="text-gold hover:text-gold-light"
              >
                Download
              </a>
              {renderActions?.(doc.id)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
