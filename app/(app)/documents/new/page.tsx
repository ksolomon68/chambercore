import { DocumentForm } from "@/components/documents/DocumentForm";

export default function NewDocumentPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Upload Document
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Members will be able to view and download this from their portal.
      </p>
      <DocumentForm />
    </div>
  );
}
