import {
  AGENT_META,
  pipelineAgentIds,
  type AgentProfile,
  type MemoryEntry,
} from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";

// ── System Activity crew ───────────────────────────────────────────────────
// The System Activity sheet shows the REAL Northstar agents (the same ones in
// the Command Center roster), driven by the live crew run — never invented
// names. Live AgentProfiles are used when available, falling back to the shared
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

const STATE_STATUS: Record<MobileAgentState, string> = {
  thinking: "Working on it…",
  queued: "Waiting for upstream",
  done: "Complete",
  idle: "Standing by",
};

export function stateLabel(state: MobileAgentState): string {
  return STATE_LABEL[state];
}

export function stateStatus(state: MobileAgentState): string {
  return STATE_STATUS[state];
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

// ── Shared Memory rows ─────────────────────────────────────────────────────

export interface MemoryRow {
  id: string;
  title: string;
  detail: string;
  accent: string;
}

// Named context categories shown when a fresh lab has no persisted memory yet,
// so the Shared Memory sheet demonstrates the layout during UI testing.
export const MOCK_MEMORY_ROWS: MemoryRow[] = [
  { id: "m-strategy", title: "Investment Strategy", detail: "55/25/20 core-satellite allocation, long horizon", accent: "#6d8bff" },
  { id: "m-risk", title: "Risk Tolerance", detail: "Moderate — tolerates drawdowns up to ~15%", accent: "#fbbf24" },
  { id: "m-income", title: "Income Information", detail: "Stable W-2 income, monthly surplus to invest", accent: "#34d399" },
  { id: "m-focus", title: "Current Focus", detail: "Rebalance toward index funds this quarter", accent: "#22d3ee" },
  { id: "m-tax", title: "Tax Strategy", detail: "Max tax-advantaged accounts before taxable", accent: "#c084fc" },
];

// Map persisted memory entries to compact display rows. Falls back to the named
// mock rows when the lab has no memory yet.
export function toMemoryRows(entries: MemoryEntry[]): MemoryRow[] {
  if (entries.length === 0) return MOCK_MEMORY_ROWS;
  return entries
    .slice()
    .reverse()
    .map((e) => {
      const meta = (AGENT_META as Record<string, { label: string; color: string }>)[e.author];
      return {
        id: e.id,
        title: meta ? meta.label : e.author === "user" ? "You" : e.author,
        detail: e.content.replace(/\s+/g, " ").trim(),
        accent: meta ? meta.color : "#8a90a0",
      };
    });
}
