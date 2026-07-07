"use client";

import { BottomSheet } from "./BottomSheet";
import {
  MOBILE_AGENTS,
  agentAccent,
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
  statuses,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  statuses: Record<string, AgentStatus>;
  busy: boolean;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="System Activity"
      subtitle={`${MOBILE_AGENTS.length} agents in this crew`}
    >
      <div className="mrows">
        {MOBILE_AGENTS.map((a) => {
          const state = deriveAgentState(a, statuses, busy);
          const accent = agentAccent(a);
          return (
            <div className="mrow" key={a.key}>
              <span
                className="mrow-badge"
                style={{ backgroundColor: `${accent}22`, color: accent }}
                aria-hidden="true"
              >
                {a.name[0]}
              </span>
              <span className="mrow-main">
                <span className="mrow-title">{a.name}</span>
                <span className="mrow-detail">{stateStatus(state)}</span>
              </span>
              <StatePill state={state} accent={accent} />
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
