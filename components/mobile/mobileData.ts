import {
  AGENT_META,
  pipelineAgentIds,
  type AgentProfile,
} from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";

// ── Lab Console crew ───────────────────────────────────────────────────────
// The Agents panel shows the REAL Northstar agents (the same ones in the
// Command Center roster), driven by the live crew run — never invented names.
// Live AgentProfiles are used when available, falling back to the shared
// AGENT_META so the real names/colors always render even before /api/agents
// resolves.

export type MobileAgentState = "thinking" | "queued" | "done" | "idle";

export interface CrewAgent {
  id: AgentProfile["id"];
  name: string;
  role: string;
  color: string;
}

// Real agent roles (mirrors lib/agents/profiles.ts) for the fallback path.
const FALLBACK_ROLE: Record<AgentProfile["id"], string> = {
  orchestrator: "Coordination & synthesis",
  research: "Facts & context",
  strategist: "Planning & sequencing",
  behavioral: "Risk & human factors",
  trader: "Portfolio & execution",
};

// The real crew for a run, in pipeline order.
export function crewAgents(
  agents: AgentProfile[],
  tradingEnabled: boolean,
): CrewAgent[] {
  return pipelineAgentIds(tradingEnabled).map((id) => {
    const live = agents.find((a) => a.id === id);
    return {
      id,
      name: live?.name ?? AGENT_META[id].label,
      role: live?.role ?? FALLBACK_ROLE[id],
      color: live?.color ?? AGENT_META[id].color,
    };
  });
}

const STATE_LABEL: Record<MobileAgentState, string> = {
  thinking: "Thinking",
  queued: "Queued",
  done: "Done",
  idle: "Idle",
};

export function stateLabel(state: MobileAgentState): string {
  return STATE_LABEL[state];
}

// Derive an agent's state from the live crew statuses + busy flag.
export function deriveAgentState(
  id: AgentProfile["id"],
  statuses: Record<string, AgentStatus>,
  busy: boolean,
): MobileAgentState {
  const s = statuses[id];
  if (s === "thinking") return "thinking";
  if (s === "done") return "done";
  return busy ? "queued" : "idle";
}
