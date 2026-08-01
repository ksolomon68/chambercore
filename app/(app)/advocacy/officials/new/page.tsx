import { OfficialForm } from "@/components/advocacy/OfficialForm";

export default function NewOfficialPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Add Official
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Officials appear in the directory members use to reach out.
      </p>
      <OfficialForm />
    </div>
  );
}
