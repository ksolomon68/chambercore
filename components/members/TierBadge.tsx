import { Badge } from "@/components/ui/Badge";
import type { MemberTier } from "@/lib/types/database.types";

const TONE: Record<MemberTier, "gold" | "muted" | "teal"> = {
  gold: "gold",
  silver: "muted",
  bronze: "teal",
};

export function TierBadge({ tier }: { tier: MemberTier }) {
  return <Badge tone={TONE[tier]}>{tier}</Badge>;
}
