import { Badge } from "@/components/ui/Badge";
import type { MemberStatus } from "@/lib/types/database.types";

const TONE: Record<MemberStatus, "green" | "gold" | "muted" | "danger"> = {
  active: "green",
  pending: "gold",
  lapsed: "danger",
  archived: "muted",
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  return <Badge tone={TONE[status]}>{status}</Badge>;
}
