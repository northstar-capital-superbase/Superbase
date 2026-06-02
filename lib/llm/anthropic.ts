import Anthropic from "@anthropic-ai/sdk";
import type {
  CompletionRequest,
  CompletionResult,
  LLMProvider,
} from "./types";

// Thin Claude adapter. Caches the SDK client so repeated agent turns reuse it.
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  readonly model: string;
  private client: Anthropic;

  constructor(apiKey: string, model = "claude-sonnet-4-6") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.6,
      system: req.system,
      messages: req.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return { text, provider: this.name, model: this.model };
  }
}
