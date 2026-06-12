"use client";

import { AGENT_META, type MemoryEntry } from "@/components/shared";

const INSIGHT_AUTHORS = new Set([
  "research",
  "strategist",
  "behavioral",
  "trader",
  "orchestrator",
]);

const INSIGHT_KINDS = new Set(["agent_output", "fact", "plan"]);

function toInsights(entries: MemoryEntry[]): MemoryEntry[] {
  return [...entries]
    .filter(
      (e) =>
        INSIGHT_KINDS.has(e.kind) &&
        (INSIGHT_AUTHORS.has(e.author) || e.kind === "plan"),
    )
    .reverse()
    .slice(0, 6);
}

export function InsightsPanel({
  entries,
  onExplore,
  onExport,
  onClear,
}: {
  entries: MemoryEntry[];
  onExplore: () => void;
  onExport: () => void;
  onClear: () => void;
}) {
  const insights = toInsights(entries);

  return (
    <div className="labs-insights">
      <div className="labs-insights-head">
        <div>
          <span className="ns-eyebrow">Research & insights</span>
          <h3 className="labs-section-title" style={{ fontSize: "20px" }}>
            Generated intelligence
          </h3>
        </div>
        <div className="labs-insights-actions">
          <button type="button" onClick={onExplore}>
            Explore
          </button>
          <button type="button" onClick={onExport}>
            Export
          </button>
          <button type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <div className="labs-insights-list">
        {insights.length === 0 && (
          <p className="ns-mono-idx" style={{ padding: "8px 4px" }}>
            Insights appear here as agents research, plan, and synthesize.
          </p>
        )}
        {insights.map((e) => {
          const meta = AGENT_META[e.author as keyof typeof AGENT_META];
          const color = meta?.color ?? "var(--ns-accent)";
          const label =
            e.kind === "plan"
              ? "Workflow plan"
              : e.kind === "fact"
                ? "Research fact"
                : `${meta?.label ?? e.author} output`;

          return (
            <article key={e.id} className="labs-insight-card">
              <div className="labs-insight-tag" style={{ color }}>
                {label}
              </div>
              <div className="labs-insight-title">
                {e.content.split("\n")[0].slice(0, 72)}
                {e.content.length > 72 ? "…" : ""}
              </div>
              <p className="labs-insight-body">{e.content}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
