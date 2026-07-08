"use client";

import { BottomSheet } from "./BottomSheet";
import {
  type CrewAgent,
  deriveAgentState,
  stateLabel,
  stateStatus,
  type MobileAgentState,
} from "./mobileData";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import "./mobile-console.css";

export function SystemActivitySheet({
  open,
  onClose,
  agents,
  statuses,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  agents: CrewAgent[];
  statuses: Record<string, AgentStatus>;
  busy: boolean;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="System Activity"
      subtitle={`${agents.length} agents in this crew`}
    >
      <div className="mrows">
        {agents.map((a) => {
          const state = deriveAgentState(a.id, statuses, busy);
          return (
            <div className="mrow" key={a.id}>
              <span
                className="mrow-badge"
                style={{ backgroundColor: `${a.color}22`, color: a.color }}
                aria-hidden="true"
              >
                {a.name[0]}
              </span>
              <span className="mrow-main">
                <span className="mrow-title">{a.name}</span>
                <span className="mrow-detail">{stateStatus(state)}</span>
              </span>
              <StatePill state={state} accent={a.color} />
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function StatePill({ state, accent }: { state: MobileAgentState; accent: string }) {
  return (
    <span className={`mstate mstate--${state}`} style={state === "thinking" ? { color: accent } : undefined}>
      {state === "thinking" && (
        <span className="mstate-dot" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
      )}
      {stateLabel(state)}
    </span>
  );
}
