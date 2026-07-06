import type { MemoryEntry } from "../memory/types";

export type AgentId =
  | "orchestrator"
  | "strategist"
  | "research"
  | "behavioral"
  | "trader";

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  color: string; // tailwind signal-* token value
  systemPrompt: string;
}

export interface AgentContext {
  sessionId: string;
  task: string;
  memory: MemoryEntry[]; // recent shared memory at time of run
}

export interface AgentResult {
  agent: AgentId;
  output: string;
  provider: string;
  model: string;
  ms: number;
  tokens?: { input: number; output: number };
  // Populated on the orchestrator's synthesis: a calibrated confidence (0-100)
  // and the consequence of inaction ("if you do nothing"). Every recommendation
  // must surface both — see the manifesto's trust section.
  confidence?: number;
  consequenceOfInaction?: string;
}
