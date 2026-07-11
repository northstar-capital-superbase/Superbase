"use client";

import { EmptyState } from "@/components/ui";
import { CcSection } from "./CcSection";

// The centerpiece — but Northstar has no recommendations engine yet, so we show
// an honest empty state. We NEVER synthesize recommendations from agent prompts
// or fabricate confidence scores. When a real engine lands it will populate at
// most three cards here (title / explanation / confidence / review).
export function Recommendations() {
  return (
    <CcSection label="Recommendations">
      <EmptyState
        icon={<SparkIcon />}
        title="No recommendations yet"
        description="Northstar surfaces suggestions here as it learns your goals and connects your accounts. Nothing is invented — this stays empty until there's something real to act on."
      />
    </CcSection>
  );
}

function SparkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}
