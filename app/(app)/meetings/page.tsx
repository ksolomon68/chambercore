import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, Button } from "@/components/ui/Button";
import { MinutesLinker } from "@/components/meetings/MinutesLinker";
import { deleteMeeting } from "@/app/actions/meetings";

const FORMAT_LABEL: Record<string, string> = {
  in_person: "In-Person",
  virtual: "Virtual",
  hybrid: "Hybrid",
};

export default async function MeetingsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: meetings } = await supabase
    .from("meetings")
    .select(
      "id, title, meeting_type, format, location, starts_at, agenda, minutes_document_id",
    )
    .eq("org_id", org!.id)
    .order("starts_at", { ascending: true });

  const meetingIds = (meetings ?? []).map((m) => m.id);
  const { data: rsvps } = meetingIds.length
    ? await supabase.from("meeting_rsvps").select("meeting_id").in("meeting_id", meetingIds)
    : { data: [] };
  const countByMeeting = new Map<string, number>();
  (rsvps ?? []).forEach((r) => {
    countByMeeting.set(r.meeting_id, (countByMeeting.get(r.meeting_id) ?? 0) + 1);
  });

  const { data: minutesDocs } = await supabase
    .from("documents")
    .select("id, title")
    .eq("org_id", org!.id)
    .eq("category", "minutes")
    .order("created_at", { ascending: false });

  const canDelete = canDeleteMembers(org?.role ?? null);
  const now = new Date();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Meetings &amp; Agendas
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Schedule meetings and track RSVPs.
          </p>
        </div>
        <ButtonLink href="/meetings/new">+ Schedule Meeting</ButtonLink>
      </div>

      <div className="flex flex-col gap-4">
        {(meetings ?? []).map((meeting) => {
          const date = new Date(meeting.starts_at);
          const isPast = date < now;
          return (
            <Card key={meeting.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-navy p-2 text-center">
                    <div className="text-[10px] font-bold uppercase text-gold-light">
                      {date.toLocaleDateString(undefined, { month: "short" })}
                    </div>
                    <div className="text-lg font-bold text-off-white">
                      {date.getDate()}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-off-white">
                      {meeting.title}
                    </div>
                    <div className="text-xs text-text-muted">
                      {meeting.location ?? "Location TBD"} &middot;{" "}
                      {date.toLocaleString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {meeting.meeting_type && (
                        <Badge tone="gold">{meeting.meeting_type}</Badge>
                      )}
                      <Badge tone="muted">{FORMAT_LABEL[meeting.format]}</Badge>
                      {isPast && <Badge tone="muted">Completed</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                  <div className="text-xs text-text-dim">
                    <span className="font-bold text-off-white">
                      {countByMeeting.get(meeting.id) ?? 0}
                    </span>{" "}
                    RSVPs
                  </div>
                  {canDelete && (
                    <form action={deleteMeeting.bind(null, meeting.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="!px-0 text-xs text-text-dim hover:text-red-400"
                      >
                        Delete
                      </Button>
                    </form>
                  )}
                </div>
              </div>
              {meeting.agenda && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-navy p-3 font-sans text-xs text-text-muted">
                  {meeting.agenda}
                </pre>
              )}
              {isPast && (
                <div className="mt-3 flex items-center gap-2 border-t border-card-border pt-3 text-xs text-text-dim">
                  Minutes:
                  <MinutesLinker
                    meetingId={meeting.id}
                    currentDocumentId={meeting.minutes_document_id}
                    documents={minutesDocs ?? []}
                  />
                </div>
              )}
            </Card>
          );
        })}
        {(!meetings || meetings.length === 0) && (
          <Card>
            <p className="text-sm text-text-dim">
              No meetings yet. Schedule your first one to get started.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
