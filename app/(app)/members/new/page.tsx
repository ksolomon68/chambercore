import { MemberForm } from "@/components/members/MemberForm";
import { createMember } from "@/app/actions/members";

export default function NewMemberPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Add Member
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Add a new business member to your chamber.
      </p>
      <MemberForm action={createMember} submitLabel="Add Member" />
    </div>
  );
}
