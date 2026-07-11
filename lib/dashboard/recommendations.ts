// Pure Recommendations data contract. Northstar has no recommendations engine
// yet, so callers pass [] today and the component shows an honest empty
// state — but the shape is defined now so a future engine (portfolio drift,
// workflow suggestions, etc.) can plug in without a redesign.
export type Confidence = "low" | "medium" | "high";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: Confidence;
  /** Where "Review" sends the user (e.g. a Lab Console session or a detail page). */
  reviewHref: string;
  reviewLabel?: string;
}

export function confidenceLabel(confidence: Confidence): string {
  switch (confidence) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium confidence";
    default:
      return "Low confidence";
  }
}

// The homepage centerpiece never shows more than three — always cap here so
// every caller (and any future data source) gets the same limit for free.
const MAX_RECOMMENDATIONS = 3;

export function topRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.slice(0, MAX_RECOMMENDATIONS);
}
