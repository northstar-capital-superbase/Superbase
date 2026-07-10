// Client-side mirrors of the API response shapes.

export interface AgentProfile {
  id: "orchestrator" | "strategist" | "research" | "behavioral" | "trader";
  name: string;
  role: string;
  description: string;
  color: string;
}

export interface RuntimeInfo {
  provider: string;
  model: string;
  memory: "supabase" | "in-memory";
  configured?: boolean;
}

export interface TradingInfo {
  enabled: boolean;
  endpoint: string;
  mode: "advisory" | "confirm" | "auto";
  maxOrderUsd: number;
  maxOrdersPerRun: number;
  traderInCrew: boolean;
}

/** Agent ids lit up during a crew run (orchestrator leads the pipeline). */
export function pipelineAgentIds(tradingEnabled: boolean): AgentProfile["id"][] {
  const mids: AgentProfile["id"][] = tradingEnabled
    ? ["research", "strategist", "behavioral", "trader"]
    : ["research", "strategist", "behavioral"];
  return ["orchestrator", ...mids];
}

export interface AgentResult {
  agent: AgentProfile["id"];
  output: string;
  provider: string;
  model: string;
  ms: number;
  tokens?: { input: number; output: number };
}

export interface CrewRun {
  sessionId: string;
  task: string;
  plan: string;
  planMs?: number;
  planTokens?: { input: number; output: number };
  specialistResults: AgentResult[];
  synthesis: AgentResult;
  backend: "supabase" | "in-memory";
}

// Streamed workflow events from /api/chat/stream (mirrors lib/orchestration).
export type CrewEvent =
  | { type: "plan"; content: string }
  | { type: "agent_start"; agent: AgentProfile["id"] }
  | { type: "agent_result"; result: AgentResult }
  | { type: "synthesis_start" }
  | { type: "synthesis"; result: AgentResult }
  | { type: "done"; run: CrewRun }
  | { type: "error"; error: string };

export interface MemoryEntry {
  id: string;
  sessionId: string;
  kind: "message" | "agent_output" | "fact" | "plan";
  author: string;
  content: string;
  createdAt: string;
}

export const AGENT_META: Record<
  AgentProfile["id"],
  { label: string; color: string }
> = {
  orchestrator: { label: "Orchestrator", color: "#6d8bff" },
  strategist: { label: "Strategist", color: "#c084fc" },
  research: { label: "Research", color: "#34d399" },
  behavioral: { label: "Behavioral", color: "#fbbf24" },
  trader: { label: "Trader", color: "#22d3ee" },
};

// Approximate public pricing in USD per 1M tokens [input, output], matched by
// model-id prefix. Used only for a rough cost estimate in the run metrics.
const PRICING: Array<[string, number, number]> = [
  ["claude-opus", 5, 25],
  ["claude-sonnet", 3, 15],
  ["claude-haiku", 1, 5],
  ["gpt-4o-mini", 0.15, 0.6],
  ["gpt-4o", 2.5, 10],
];

// Returns the estimated USD cost for a run, or null if the model isn't priced
// so the UI can omit it.
export function estimateCostUSD(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const row = PRICING.find(([prefix]) => model.startsWith(prefix));
  if (!row) return null;
  const [, inRate, outRate] = row;
  return (inputTokens * inRate + outputTokens * outRate) / 1_000_000;
}
