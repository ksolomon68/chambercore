import { Badge } from "@/components/ui/Badge";

export function DirectoryCard({
  businessName,
  category,
  description,
  websiteUrl,
  address,
  featured,
}: {
  businessName: string;
  category: string | null;
  description: string | null;
  websiteUrl: string | null;
  address: string | null;
  featured: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        featured ? "border-gold/40 bg-gold/5" : "border-card-border bg-card-bg"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-display text-lg font-bold text-off-white">
          {businessName}
        </div>
        {featured && <Badge tone="gold">Featured</Badge>}
      </div>
      {category && <div className="mt-1 text-xs text-text-dim">{category}</div>}
      {description && (
        <p className="mt-3 text-sm text-text-muted">{description}</p>
      )}
      {address && <p className="mt-3 text-xs text-text-dim">{address}</p>}
      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-gold hover:text-gold-light"
        >
          Visit website →
        </a>
      )}
    </div>
  );
}
