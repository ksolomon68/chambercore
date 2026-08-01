import { MarketplaceForm } from "@/components/marketplace/MarketplaceForm";
import { submitListing } from "@/app/actions/marketplace";

export default function SubmitListingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Submit to Marketplace
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Your submission will be reviewed by chamber staff before it appears in
        the marketplace.
      </p>
      <MarketplaceForm action={submitListing} />
    </div>
  );
}
