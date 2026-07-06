import type { AgentId } from "./types";

export const BASE_SPECIALISTS: AgentId[] = [
  "research",
  "strategist",
  "behavioral",
];

// Specialists used when the client does not pass an explicit list. The Trader
// is deliberately NOT auto-joined: it participates only when the operator
// explicitly includes it in a run (authority is granted, never assumed). The
// client adds "trader" to the requested list when the operator opts in.
export function defaultSpecialists(): AgentId[] {
  return [...BASE_SPECIALISTS];
}

export function resolveSpecialists(requested?: AgentId[]): AgentId[] {
  if (requested?.length) return requested;
  return defaultSpecialists();
}
