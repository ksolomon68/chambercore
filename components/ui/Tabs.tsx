"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function Tabs({
  tabs,
}: {
  tabs: { label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-1 border-b border-card-border mb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              i === active
                ? "border-gold text-off-white"
                : "border-transparent text-text-muted hover:text-off-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
