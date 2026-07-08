"use client";

import "./mobile-console.css";

// Floating compact status pill shown while the crew is working. Tapping it
// opens the System Activity sheet.
export function AgentActivityPill({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="mpill" onClick={onOpen} aria-haspopup="dialog">
      <span className="mpill-spinner" aria-hidden="true" />
      <span className="mpill-text">
        Northstar working <span className="mpill-dot">·</span> {count} agents
      </span>
    </button>
  );
}
