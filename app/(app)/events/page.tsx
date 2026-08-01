import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canDeleteMembers } from "@/lib/auth/permissions";
import { Card } from "@/components/ui/Card";
import { ButtonLink, Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { deleteEvent } from "@/app/actions/events";

export default async function EventsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, location, starts_at, price, capacity")
    .eq("org_id", org!.id)
    .order("starts_at", { ascending: true });

  const eventIds = (events ?? []).map((e) => e.id);
  const { data: registrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
    : { data: [] };

  const countByEvent = new Map<string, number>();
  (registrations ?? []).forEach((r) => {
    countByEvent.set(r.event_id, (countByEvent.get(r.event_id) ?? 0) + 1);
  });

  const canDelete = canDeleteMembers(org?.role ?? null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Events &amp; Registration
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage upcoming events and track registrations.
          </p>
        </div>
        <ButtonLink href="/events/new">+ Create Event</ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-3">
          {(events ?? []).map((event) => {
            const registered = countByEvent.get(event.id) ?? 0;
            const date = new Date(event.starts_at);
            return (
              <Card key={event.id} className="flex items-center gap-4">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-navy p-2 text-center">
                  <div className="text-[10px] font-bold uppercase text-gold-light">
                    {date.toLocaleDateString(undefined, { month: "short" })}
                  </div>
                  <div className="text-lg font-bold text-off-white">
                    {date.getDate()}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-off-white">
                    {event.title}
                  </div>
                  <div className="text-xs text-text-muted">
                    {event.location ?? "Location TBD"} &middot;{" "}
                    {date.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    &middot;{" "}
                    {event.price ? `$${Number(event.price)}/person` : "Free"}
                  </div>
                </div>
                <div className="text-right text-xs text-text-dim">
                  <div className="font-bold text-off-white">{registered}</div>
                  registered
                </div>
                {canDelete && (
                  <form action={deleteEvent.bind(null, event.id)}>
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
              </Card>
            );
          })}
          {(!events || events.length === 0) && (
            <Card>
              <p className="text-sm text-text-dim">
                No events yet. Create your first one to get started.
              </p>
            </Card>
          )}
        </div>

        <Card>
          <div className="mb-4 text-sm font-semibold text-off-white">
            Registration Progress
          </div>
          <div className="flex flex-col gap-3">
            {(events ?? []).map((event) => (
              <div key={event.id}>
                <div className="mb-1 flex justify-between text-xs text-text-muted">
                  <span className="truncate">{event.title}</span>
                </div>
                <ProgressBar
                  value={countByEvent.get(event.id) ?? 0}
                  max={event.capacity}
                />
              </div>
            ))}
            {(!events || events.length === 0) && (
              <p className="text-xs text-text-dim">No events yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
