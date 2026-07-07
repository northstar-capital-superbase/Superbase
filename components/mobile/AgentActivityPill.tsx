"use client";

import { MOBILE_AGENTS } from "./mobileData";
import "./mobile-console.css";

// Floating compact status pill shown while the crew is working. Tapping it
// opens the System Activity sheet.
export function AgentActivityPill({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="mpill" onClick={onOpen} aria-haspopup="dialog">
      <span className="mpill-spinner" aria-hidden="true" />
      <span className="mpill-text">
        Northstar working <span className="mpill-dot">·</span> {MOBILE_AGENTS.length} agents
      </span>
    </button>
  );
}
