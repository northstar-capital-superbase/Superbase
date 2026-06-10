import { mcpEnabled } from "@/lib/mcp";
import type { AgentId } from "./types";

export const BASE_SPECIALISTS: AgentId[] = [
  "research",
  "strategist",
  "behavioral",
];

/** Specialists used when the client does not pass an explicit list. */
export function defaultSpecialists(): AgentId[] {
  return mcpEnabled() ? [...BASE_SPECIALISTS, "trader"] : [...BASE_SPECIALISTS];
}

export function resolveSpecialists(requested?: AgentId[]): AgentId[] {
  if (requested?.length) return requested;
  return defaultSpecialists();
}
