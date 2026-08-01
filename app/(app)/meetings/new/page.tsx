import { MeetingForm } from "@/components/meetings/MeetingForm";

export default function NewMeetingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Schedule a Meeting
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Members will be able to see this meeting and RSVP from their portal.
      </p>
      <MeetingForm />
    </div>
  );
}
