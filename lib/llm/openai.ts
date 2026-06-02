import OpenAI from "openai";
import type {
  CompletionRequest,
  CompletionResult,
  LLMProvider,
} from "./types";

// OpenAI adapter. System prompt is folded into the message list.
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai" as const;
  readonly model: string;
  private client: OpenAI;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (req.system) messages.push({ role: "system", content: req.system });
    for (const m of req.messages) messages.push({ role: m.role, content: m.content });

    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: req.temperature ?? 0.6,
      max_tokens: req.maxTokens ?? 1024,
      messages,
    });

    const text = res.choices[0]?.message?.content?.trim() ?? "";
    return {
      text,
      provider: this.name,
      model: this.model,
      usage: res.usage
        ? {
            inputTokens: res.usage.prompt_tokens,
            outputTokens: res.usage.completion_tokens,
          }
        : undefined,
    };
  }
}
