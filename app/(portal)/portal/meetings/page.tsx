import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { rsvpToMeeting, cancelRsvp } from "@/app/actions/meetings";

const FORMAT_LABEL: Record<string, string> = {
  in_person: "In-Person",
  virtual: "Virtual",
  hybrid: "Hybrid",
};

export default async function PortalMeetingsPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, meeting_type, format, location, starts_at, agenda")
    .eq("org_id", member.orgId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const meetingIds = (meetings ?? []).map((m) => m.id);
  const { data: myRsvps } = meetingIds.length
    ? await supabase
        .from("meeting_rsvps")
        .select("meeting_id")
        .eq("member_id", member.id)
        .in("meeting_id", meetingIds)
    : { data: [] };
  const rsvpedIds = new Set((myRsvps ?? []).map((r) => r.meeting_id));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Meetings &amp; Agendas
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Upcoming meetings from {member.orgName}.
      </p>

      <div className="flex flex-col gap-4">
        {(meetings ?? []).map((meeting) => {
          const date = new Date(meeting.starts_at);
          const isRsvped = rsvpedIds.has(meeting.id);
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
                    </div>
                  </div>
                </div>
                {isRsvped ? (
                  <form action={cancelRsvp.bind(null, meeting.id)} className="shrink-0 text-right">
                    <Badge tone="green">Attending ✓</Badge>{" "}
                    <Button type="submit" variant="ghost" size="sm" className="text-xs">
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <form action={rsvpToMeeting.bind(null, meeting.id)} className="shrink-0">
                    <Button type="submit" size="sm">
                      RSVP
                    </Button>
                  </form>
                )}
              </div>
              {meeting.agenda && (
                <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-navy p-3 font-sans text-xs text-text-muted">
                  {meeting.agenda}
                </pre>
              )}
            </Card>
          );
        })}
        {(!meetings || meetings.length === 0) && (
          <Card>
            <p className="text-sm text-text-dim">No upcoming meetings.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
