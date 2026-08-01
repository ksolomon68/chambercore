"use client";

import { setMeetingMinutes } from "@/app/actions/meetings";

export function MinutesLinker({
  meetingId,
  currentDocumentId,
  documents,
}: {
  meetingId: string;
  currentDocumentId: string | null;
  documents: { id: string; title: string }[];
}) {
  return (
    <form
      action={setMeetingMinutes.bind(null, meetingId)}
      className="flex items-center gap-1.5"
    >
      <select
        name="minutesDocumentId"
        defaultValue={currentDocumentId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-card-border bg-navy px-1.5 py-1 text-xs text-off-white outline-none focus:border-gold"
      >
        <option value="">No minutes linked</option>
        {documents.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.title}
          </option>
        ))}
      </select>
    </form>
  );
}
