import { IssueForm } from "@/components/advocacy/IssueForm";

export default function NewIssuePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        New Advocacy Issue
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Members will see this issue and the call to action from their portal.
      </p>
      <IssueForm />
    </div>
  );
}
