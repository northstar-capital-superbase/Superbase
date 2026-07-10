"use client";

import { memo, useState } from "react";
import {
  crewAgents,
  deriveAgentState,
  stateLabel,
  type MobileAgentState,
} from "@/components/mobile/mobileData";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import type { AgentProfile } from "@/components/shared";
import { DisclosureChevron } from "@/components/ui";
import "./agents-panel.css";

// Always-visible roster of the real crew with live status, shown directly on the
// Lab Console (desktop rail + inline on mobile). Statuses are driven by the live
// run (see useLabConsole `statuses`). Memoized so thread updates (new turns,
// streaming text) don't re-render the roster — only status ticks do.
export const AgentsPanel = memo(function AgentsPanel({
  agents,
  statuses,
  busy,
  tradingEnabled = false,
  variant,
  collapsible = false,
}: {
  agents: AgentProfile[];
  statuses: Record<string, AgentStatus>;
  busy: boolean;
  tradingEnabled?: boolean;
  variant: "desktop" | "mobile";
  collapsible?: boolean;
}) {
  const crew = crewAgents(agents, tradingEnabled);
  const [open, setOpen] = useState(true);

  const header = (
    <>
      {collapsible && <DisclosureChevron open={open} size={12} variant="chevron" />}
      <span className="ap-title">Agents</span>
      <span className="ap-count">{crew.length}</span>
      {busy && (
        <span className="ap-working">
          <span className="ap-working-dot" /> working
        </span>
      )}
    </>
  );

  return (
    <section className={`ap ap--${variant}`} aria-label="Agents">
      <header className="ap-head">
        {collapsible ? (
          <button
            type="button"
            className="ap-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {header}
          </button>
        ) : (
          <div className="ap-headrow">{header}</div>
        )}
      </header>

      {open && (
        <div className="ap-list">
          {crew.map((a) => {
            const state = deriveAgentState(a.id, statuses, busy);
            return (
              <div className="ap-row" key={a.id}>
                <span
                  className="ap-badge"
                  style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  aria-hidden="true"
                >
                  {a.name[0]}
                </span>
                <span className="ap-main">
                  <span className="ap-name">{a.name}</span>
                  <span className="ap-role">{a.role}</span>
                </span>
                <StatePill state={state} accent={a.color} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});

function StatePill({
  state,
  accent,
}: {
  state: MobileAgentState;
  accent: string;
}) {
  return (
    <span
      className={`ap-state ap-state--${state}`}
      style={state === "thinking" ? { color: accent } : undefined}
    >
      {state === "thinking" && (
        <span
          className="ap-state-dot"
          style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      )}
      {stateLabel(state)}
    </span>
  );
}
