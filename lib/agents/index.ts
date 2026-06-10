import { Agent } from "./base-agent";
import {
  ALL_PROFILES,
  BEHAVIORAL,
  MARKETS,
  ORCHESTRATOR,
  RESEARCH,
  STRATEGIST,
} from "./profiles";
import type { AgentId, AgentProfile } from "./types";

export * from "./types";
export { ALL_PROFILES } from "./profiles";

// Singleton registry so the orchestration layer can look agents up by id.
const registry: Record<AgentId, Agent> = {
  orchestrator: new Agent(ORCHESTRATOR),
  research: new Agent(RESEARCH),
  strategist: new Agent(STRATEGIST),
  behavioral: new Agent(BEHAVIORAL),
  markets: new Agent(MARKETS),
};

export function getAgent(id: AgentId): Agent {
  return registry[id];
}

// Specialists the orchestrator delegates to, in default run order.
export const SPECIALIST_ORDER: AgentId[] = [
  "research",
  "strategist",
  "behavioral",
];

export function listProfiles(): AgentProfile[] {
  return ALL_PROFILES;
}
