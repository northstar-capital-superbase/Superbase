import type {
  CompletionRequest,
  CompletionResult,
  LLMProvider,
} from "@/lib/llm";

// Deterministic, network-free provider for tests. Produces role-flavored text
// (based on the agent's system prompt) and non-zero token usage so crew/trading
// assertions hold without hitting a real model.
export class FakeProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  readonly model = "test-fake-1";

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const system = (req.system ?? "").toLowerCase();
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const task = (lastUser?.content ?? "").slice(0, 120).trim() || "the request";

    let text: string;
    if (system.includes("orchestrator")) {
      text = `Plan for "${task}": research → strategist → behavioral, then synthesize.`;
    } else if (system.includes("research")) {
      text = `Research notes on "${task}": key facts and open questions.`;
    } else if (system.includes("strategist")) {
      text = `Strategy for "${task}": ship the smallest end-to-end slice first.`;
    } else if (system.includes("behavioral")) {
      text = `Behavioral read on "${task}": watch for over-scoping and silent assumptions.`;
    } else if (system.includes("trader")) {
      text = `Trader review of "${task}": advisory analysis within policy caps.`;
    } else {
      text = `Acknowledged: "${task}".`;
    }

    const inputChars =
      (req.system?.length ?? 0) +
      req.messages.reduce((a, m) => a + m.content.length, 0);

    return {
      text,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: Math.max(1, Math.ceil(inputChars / 4)),
        outputTokens: Math.max(1, Math.ceil(text.length / 4)),
      },
    };
  }
}
