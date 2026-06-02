import type {
  CompletionRequest,
  CompletionResult,
  LLMProvider,
} from "./types";

// Deterministic offline provider so the lab runs end-to-end with zero API keys.
// It inspects the agent's system prompt to produce role-flavored output, which
// keeps the multi-agent workflow demonstrable in pure local/dev mode.
export class MockProvider implements LLMProvider {
  readonly name = "mock" as const;
  readonly model = "northstar-mock-1";

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const role = detectRole(req.system ?? "");
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const task = (lastUser?.content ?? "").slice(0, 600).trim();
    const text = render(role, task);
    // Small delay to mimic network latency and exercise loading states.
    await new Promise((r) => setTimeout(r, 180));
    // Rough token estimate (~4 chars/token) so metrics render in mock mode.
    const inputChars =
      (req.system?.length ?? 0) +
      req.messages.reduce((a, m) => a + m.content.length, 0);
    return {
      text,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: Math.ceil(inputChars / 4),
        outputTokens: Math.ceil(text.length / 4),
      },
    };
  }
}

type Role = "orchestrator" | "strategist" | "research" | "behavioral" | "generic";

function detectRole(system: string): Role {
  const s = system.toLowerCase();
  if (s.includes("orchestrator")) return "orchestrator";
  if (s.includes("strategist")) return "strategist";
  if (s.includes("research")) return "research";
  if (s.includes("behavioral")) return "behavioral";
  return "generic";
}

function topic(task: string): string {
  const cleaned = task
    .replace(/^task:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 90 ? cleaned.slice(0, 90) + "…" : cleaned || "the request";
}

function render(role: Role, task: string): string {
  const t = topic(task);
  switch (role) {
    case "orchestrator":
      return [
        `Plan for: "${t}"`,
        "",
        "1. research — gather facts, constraints, and prior context.",
        "2. strategist — turn findings into a concrete, sequenced approach.",
        "3. behavioral — pressure-test risks, incentives, and human factors.",
        "",
        "Delegating now and synthesizing the combined result.",
      ].join("\n");
    case "research":
      return [
        `Research notes on "${t}":`,
        "- Key fact A: the problem space has a few well-understood building blocks.",
        "- Key fact B: comparable systems favor small, composable agents over monoliths.",
        "- Open question: which constraints (time, cost, data) dominate here?",
      ].join("\n");
    case "strategist":
      return [
        `Strategy for "${t}":`,
        "- Phase 1: ship the smallest end-to-end slice that proves the loop works.",
        "- Phase 2: harden the weakest link surfaced by Phase 1.",
        "- Phase 3: expand scope only once the core is reliable.",
        "Recommended next action: start Phase 1 today.",
      ].join("\n");
    case "behavioral":
      return [
        `Behavioral read on "${t}":`,
        "- Likely failure mode: over-scoping before the basics are stable.",
        "- Incentive check: optimize for momentum and visible progress.",
        "- Watch-out: silent assumptions — make them explicit early.",
      ].join("\n");
    default:
      return `Acknowledged: "${t}". (mock response — set an API key for live model output.)`;
  }
}
