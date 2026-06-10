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
}
