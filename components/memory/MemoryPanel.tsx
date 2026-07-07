"use client";

import { AGENT_META, type MemoryEntry } from "@/components/shared";
import { Button } from "@/components/ui";

// Right rail: a live tail of the shared memory the agents read and write.
export function MemoryPanel({
  entries,
  onClear,
  onExplore,
  onExport,
}: {
  entries: MemoryEntry[];
  onClear: () => void;
  onExplore: () => void;
  onExport: () => void;
}) {
  return (
    <div className="lx-card lx-pane">
      <div className="lx-card-head">
        <div className="lx-card-title">
          Shared Memory
          <span className="lx-card-sub">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div className="lx-btn-row">
          <Button size="sm" onClick={onExplore} aria-label="Open the memory explorer">
            Explore
          </Button>
          <Button
            size="sm"
            onClick={onExport}
            title="Download this lab's memory as Markdown"
            aria-label="Export this lab's memory as Markdown"
          >
            Export
          </Button>
          <Button size="sm" onClick={onClear} aria-label="Clear this lab's memory">
            Clear
          </Button>
        </div>
      </div>

      <div className="lx-scroll">
        {entries.length === 0 && (
          <div className="lx-mem-empty">
            No shared memory yet. Agents write here as they work — run the crew
            and every contribution lands in this tail.
          </div>
        )}
        <div className="lx-mem">
          {entries.map((e) => {
            const meta = AGENT_META[e.author as keyof typeof AGENT_META];
            const color = meta?.color ?? "#64748b";
            return (
              <div key={e.id} className="lx-mem-item lx-fadeup">
                <div className="lx-mem-head">
                  <span
                    className="lx-dot"
                    style={{ backgroundColor: color }}
                  />
                  <span className="lx-mem-author" style={{ color }}>
                    {meta?.label ?? e.author}
                  </span>
                  <span className="lx-mem-kind">{e.kind}</span>
                </div>
                <p className="lx-mem-body">{e.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
