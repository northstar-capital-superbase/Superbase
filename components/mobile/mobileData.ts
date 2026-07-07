import { AGENT_META, type AgentProfile, type MemoryEntry } from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";

// ── Mobile "System Activity" agent skin ───────────────────────────────────
// The mobile console presents a fixed, friendly crew of five agents. Each maps
// onto a real pipeline agent id so its state is driven by the live crew run
// (see Dashboard `statuses`). The Memory Agent has no backend id — it reflects
// whether shared memory is actively being written during a run.

export type MobileAgentState = "thinking" | "queued" | "done" | "idle";

export interface MobileAgent {
  key: string;
  name: string;
  blurb: string;
  source: AgentProfile["id"] | "memory";
}

export const MOBILE_AGENTS: MobileAgent[] = [
  { key: "portfolio", name: "Portfolio Agent", blurb: "Coordinates the crew and plans the task", source: "orchestrator" },
  { key: "research", name: "Market Researcher", blurb: "Gathers market data, news and signals", source: "research" },
  { key: "risk", name: "Risk Manager", blurb: "Checks risk, guardrails and exposure", source: "behavioral" },
  { key: "strategy", name: "Strategy Agent", blurb: "Shapes the recommended strategy", source: "strategist" },
  { key: "memory", name: "Memory Agent", blurb: "Captures shared context to memory", source: "memory" },
];

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

// Derive a mobile agent's state from the live crew statuses + busy flag.
export function deriveAgentState(
  agent: MobileAgent,
  statuses: Record<string, AgentStatus>,
  busy: boolean,
): MobileAgentState {
  if (agent.source === "memory") {
    if (busy) return "thinking";
    return Object.values(statuses).some((s) => s === "done") ? "done" : "idle";
  }
  const s = statuses[agent.source];
  if (s === "thinking") return "thinking";
  if (s === "done") return "done";
  return busy ? "queued" : "idle";
}

export function agentAccent(agent: MobileAgent): string {
  if (agent.source === "memory") return "#c084fc";
  return AGENT_META[agent.source].color;
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
