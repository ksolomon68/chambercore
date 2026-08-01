import { VoteForm } from "@/components/voting/VoteForm";

export default function NewVotePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Create Vote
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Only board members can cast a vote; results are visible to all
        members.
      </p>
      <VoteForm />
    </div>
  );
}
