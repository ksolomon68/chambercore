import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { registerForEvent, cancelRegistration } from "@/app/actions/events";

export default async function PortalEventsPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, location, starts_at, price, capacity")
    .eq("org_id", member.orgId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const eventIds = (events ?? []).map((e) => e.id);
  const { data: myRegistrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("member_id", member.id)
        .in("event_id", eventIds)
    : { data: [] };
  const registeredIds = new Set((myRegistrations ?? []).map((r) => r.event_id));

  const { data: allRegistrations } = eventIds.length
    ? await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
    : { data: [] };
  const countByEvent = new Map<string, number>();
  (allRegistrations ?? []).forEach((r) => {
    countByEvent.set(r.event_id, (countByEvent.get(r.event_id) ?? 0) + 1);
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Events
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Upcoming events from {member.orgName}.
      </p>

      <div className="flex flex-col gap-3">
        {(events ?? []).map((event) => {
          const date = new Date(event.starts_at);
          const isRegistered = registeredIds.has(event.id);
          const isFull =
            event.capacity != null &&
            (countByEvent.get(event.id) ?? 0) >= event.capacity &&
            !isRegistered;

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
              {isRegistered ? (
                <form action={cancelRegistration.bind(null, event.id)}>
                  <Badge tone="green">Registered ✓</Badge>{" "}
                  <Button type="submit" variant="ghost" size="sm" className="text-xs">
                    Cancel
                  </Button>
                </form>
              ) : isFull ? (
                <Badge tone="muted">Full</Badge>
              ) : (
                <form action={registerForEvent.bind(null, event.id)}>
                  <Button type="submit" size="sm">
                    Register
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
        {(!events || events.length === 0) && (
          <Card>
            <p className="text-sm text-text-dim">No upcoming events.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
