import { Agent } from "./base-agent";
import { TradingAgent } from "./trading-agent";
import {
  ALL_PROFILES,
  BEHAVIORAL,
  ORCHESTRATOR,
  RESEARCH,
  STRATEGIST,
} from "./profiles";
import type { AgentId, AgentProfile } from "./types";

export * from "./types";
export { ALL_PROFILES } from "./profiles";

// The TradingAgent has its own run() implementation (MCP tool loop) so it
// can't share the base Agent class directly. We wrap it in an interface-
// compatible adapter so the registry stays uniform.
const tradingAgent = new TradingAgent();

// Singleton registry so the orchestration layer can look agents up by id.
const registry: Record<AgentId, Agent | TradingAgent> = {
  orchestrator: new Agent(ORCHESTRATOR),
  research: new Agent(RESEARCH),
  strategist: new Agent(STRATEGIST),
  behavioral: new Agent(BEHAVIORAL),
  trader: tradingAgent,
};

export function getAgent(id: AgentId): Agent | TradingAgent {
  return registry[id];
}

// Default specialists the orchestrator delegates to. "trader" is intentionally
// excluded so existing crews and tests are unaffected; callers opt in by
// passing specialists: ["research", "strategist", "behavioral", "trader"].
export const SPECIALIST_ORDER: AgentId[] = [
  "research",
  "strategist",
  "behavioral",
];

export function listProfiles(): AgentProfile[] {
  return ALL_PROFILES;
}
