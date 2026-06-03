import { getProvider } from "../llm";
import type { ChatMessage } from "../llm/types";
import type { AgentContext, AgentProfile, AgentResult } from "./types";

// Base class every specialist extends. It wires an agent profile to the active
// LLM provider and packages recent shared memory into the prompt so each agent
// is aware of what the others have already contributed.
export class Agent {
  constructor(public readonly profile: AgentProfile) {}

  protected buildMessages(ctx: AgentContext): ChatMessage[] {
    const messages: ChatMessage[] = [];

    if (ctx.memory.length) {
      const context = ctx.memory
        .map((m) => `[${m.author}] ${m.content}`)
        .join("\n");
      messages.push({
        role: "user",
        content: `Shared lab memory (most recent first is bottom):\n${context}`,
      });
    }

    messages.push({ role: "user", content: `Task: ${ctx.task}` });
    return messages;
  }

  async run(ctx: AgentContext): Promise<AgentResult> {
    const provider = getProvider();
    const started = Date.now();
    const res = await provider.complete({
      system: this.profile.systemPrompt,
      messages: this.buildMessages(ctx),
      temperature: 0.6,
      maxTokens: 900,
    });
    return {
      agent: this.profile.id,
      output: res.text,
      provider: res.provider,
      model: res.model,
      ms: Date.now() - started,
      tokens: res.usage
        ? { input: res.usage.inputTokens, output: res.usage.outputTokens }
        : undefined,
    };
  }
}
