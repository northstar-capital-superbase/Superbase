"use client";

import { AGENT_META, type MemoryEntry } from "@/components/shared";

export function AutonomousActivity({
  entries,
  busy,
}: {
  entries: MemoryEntry[];
  busy: boolean;
}) {
  const feed = [...entries].reverse().slice(0, 8);

  return (
    <div className="labs-activity">
      <div className="labs-activity-head">
        <span className="ns-eyebrow">Autonomous activity</span>
        <h3 className="labs-section-title" style={{ fontSize: "20px" }}>
          Live memory stream
        </h3>
        <p className="labs-section-lede" style={{ marginTop: 4 }}>
          Every read and write across the crew — as it happens.
        </p>
      </div>

      <div className="labs-activity-feed">
        {feed.length === 0 && !busy && (
          <p className="ns-mono-idx" style={{ padding: "8px 4px" }}>
            No activity yet. Run a task to see agents collaborate.
          </p>
        )}
        {busy && feed.length === 0 && (
          <div className="labs-activity-item">
            <span
              className="labs-activity-dot"
              style={{
                backgroundColor: "var(--ns-accent)",
                boxShadow: "0 0 8px rgba(110,139,255,0.6)",
              }}
            />
            <div className="labs-activity-body">
              <div className="labs-activity-meta">Orchestrator · starting</div>
              <div className="labs-activity-text">
                Delegating to the specialist crew…
              </div>
            </div>
          </div>
        )}
        {feed.map((e) => {
          const meta = AGENT_META[e.author as keyof typeof AGENT_META];
          const color = meta?.color ?? "var(--ns-text-3)";
          return (
            <div key={e.id} className="labs-activity-item">
              <span
                className="labs-activity-dot"
                style={{ backgroundColor: color }}
              />
              <div className="labs-activity-body">
                <div className="labs-activity-meta">
                  {meta?.label ?? e.author} · {e.kind}
                </div>
                <div className="labs-activity-text">{e.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
