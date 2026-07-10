import { mcpEnabled } from "@/lib/mcp";
import type { AgentId } from "./types";

export const BASE_SPECIALISTS: AgentId[] = [
  "research",
  "strategist",
  "behavioral",
];

// Agents a client is allowed to request as specialists. The orchestrator is
// excluded — it drives the run (plan + synthesis) and must never be looped in
// as a specialist.
const ALLOWED_SPECIALISTS: readonly AgentId[] = [
  "research",
  "strategist",
  "behavioral",
  "trader",
];

/** Specialists used when the client does not pass an explicit list. */
export function defaultSpecialists(): AgentId[] {
  return mcpEnabled() ? [...BASE_SPECIALISTS, "trader"] : [...BASE_SPECIALISTS];
}

// Validate + de-duplicate a client-supplied specialist list: drop unknown ids
// and the orchestrator, preserve request order, and fall back to the defaults
// when nothing valid remains.
export function resolveSpecialists(requested?: AgentId[]): AgentId[] {
  if (!requested?.length) return defaultSpecialists();
  const seen = new Set<AgentId>();
  const valid = requested.filter((id) => {
    if (!ALLOWED_SPECIALISTS.includes(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return valid.length ? valid : defaultSpecialists();
}
