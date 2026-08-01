import { EventForm } from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Create Event
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Members will be able to see and register for this event from their
        portal.
      </p>
      <EventForm />
    </div>
  );
}
