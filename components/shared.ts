// Client-side mirrors of the API response shapes.

export interface AgentProfile {
  id: "orchestrator" | "strategist" | "research" | "behavioral";
  name: string;
  role: string;
  description: string;
  color: string;
}

export interface RuntimeInfo {
  provider: string;
  model: string;
  memory: "supabase" | "in-memory";
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
};
