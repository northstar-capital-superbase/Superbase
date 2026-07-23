import { describe, it, expect } from "vitest";
import {
  confidenceLabel,
  topRecommendations,
  type Recommendation,
} from "@/lib/dashboard/recommendations";

function rec(id: string): Recommendation {
  return {
    id,
    title: `Recommendation ${id}`,
    description: "Description",
    confidence: "medium",
    reviewHref: "/labs/console",
  };
}

describe("confidenceLabel", () => {
  it("maps every confidence level to a readable label", () => {
    expect(confidenceLabel("high")).toBe("High confidence");
    expect(confidenceLabel("medium")).toBe("Medium confidence");
    expect(confidenceLabel("low")).toBe("Low confidence");
  });
});

describe("topRecommendations", () => {
  it("passes through when there are three or fewer", () => {
    const recs = [rec("a"), rec("b")];
    expect(topRecommendations(recs)).toEqual(recs);
  });

  it("caps the centerpiece at three, preserving order", () => {
    const recs = [rec("a"), rec("b"), rec("c"), rec("d"), rec("e")];
    const top = topRecommendations(recs);
    expect(top).toHaveLength(3);
    expect(top.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for an empty input (no fabrication)", () => {
    expect(topRecommendations([])).toEqual([]);
  });
});
