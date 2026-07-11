"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui";
import {
  confidenceLabel,
  topRecommendations,
  type Recommendation,
} from "@/lib/dashboard/recommendations";
import { CcSection } from "./CcSection";

// The centerpiece — but Northstar has no recommendations engine yet, so
// `recommendations` is [] today and we show an honest empty state. We NEVER
// synthesize recommendations from agent prompts or fabricate confidence
// scores. When a real engine lands it plugs straight into this prop (at most
// three cards: title / description / confidence / review action).
export function Recommendations({
  recommendations = [],
}: {
  recommendations?: Recommendation[];
}) {
  const top = topRecommendations(recommendations);

  return (
    <CcSection
      label="Recommendations"
      bodyClassName={top.length ? "cc-body cc-body--flush" : "cc-body"}
    >
      {top.length === 0 ? (
        <EmptyState
          icon={<SparkIcon />}
          title="No recommendations yet"
          description="Northstar surfaces suggestions here as it learns your goals and connects your accounts. Nothing is invented — this stays empty until there's something real to act on."
        />
      ) : (
        <ul className="cc-recs">
          {top.map((rec) => (
            <li key={rec.id} className="cc-rec">
              <div className="cc-rec-main">
                <span className="cc-rec-title">{rec.title}</span>
                <span className="cc-rec-desc">{rec.description}</span>
                <span className={`cc-rec-confidence cc-rec-confidence--${rec.confidence}`}>
                  {confidenceLabel(rec.confidence)}
                </span>
              </div>
              <Link href={rec.reviewHref} className="cc-pending-action">
                {rec.reviewLabel ?? "Review"}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
