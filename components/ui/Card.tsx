import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-card-bg border border-card-border rounded-xl p-6 ${className}`}
      {...props}
    />
  );
}
