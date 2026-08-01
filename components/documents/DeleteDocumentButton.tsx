"use client";

import { deleteDocument } from "@/app/actions/documents";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  return (
    <form action={deleteDocument.bind(null, documentId)}>
      <button
        type="submit"
        className="text-text-dim hover:text-red-400"
      >
        Delete
      </button>
    </form>
  );
}
