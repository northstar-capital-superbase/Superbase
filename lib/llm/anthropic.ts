import Anthropic from "@anthropic-ai/sdk";
import type {
  CompletionRequest,
  CompletionResult,
  LLMProvider,
} from "./types";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

// Claude adapter. Caches the SDK client so repeated agent turns reuse it.
//
// Parameter safety: Opus 4.7+ removed the sampling params (`temperature`,
// `top_p`, `top_k`) — sending them returns a 400. The adapter therefore never
// forwards `temperature` to those models and steers via prompting instead.
// Thinking/effort are opt-in via env so the default request stays fast and
// valid on every current model (including the opus-4-8 default).
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  readonly model: string;
  private client: Anthropic;
  private effort?: Effort;
  private adaptiveThinking: boolean;

  constructor(apiKey: string, model = "claude-opus-4-8") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
    const effort = (process.env.ANTHROPIC_EFFORT || "").toLowerCase();
    this.effort = isEffort(effort) ? effort : undefined;
    this.adaptiveThinking =
      (process.env.ANTHROPIC_THINKING || "").toLowerCase() === "adaptive";
  }

  async complete(req: CompletionRequest): Promise<CompletionResult> {
    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: this.model,
      max_tokens: req.maxTokens ?? 1024,
      system: req.system,
      messages: req.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    };

    // Sampling params are only valid on models that still accept them.
    if (!isStrictModel(this.model) && typeof req.temperature === "number") {
      params.temperature = req.temperature;
    }
    if (this.effort) params.output_config = { effort: this.effort };
    if (this.adaptiveThinking) params.thinking = { type: "adaptive" };

    try {
      const res = await this.client.messages.create(params);
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return {
        text,
        provider: this.name,
        model: this.model,
        usage: {
          inputTokens: res.usage.input_tokens,
          outputTokens: res.usage.output_tokens,
        },
      };
    } catch (err) {
      throw toFriendlyError(err);
    }
  }
}

// Opus 4.7 and 4.8 removed temperature/top_p/top_k and budget_tokens.
function isStrictModel(model: string): boolean {
  return /opus-4-[78]\b/.test(model) || /opus-[5-9]/.test(model);
}

function isEffort(v: string): v is Effort {
  return ["low", "medium", "high", "xhigh", "max"].includes(v);
}

// Turn opaque SDK errors into actionable messages for the dashboard.
function toFriendlyError(err: unknown): Error {
  if (err instanceof Anthropic.AuthenticationError) {
    return new Error(
      "Anthropic auth failed (401): check ANTHROPIC_API_KEY in .env.local.",
    );
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return new Error(
      "Anthropic permission denied (403): your key lacks access to this model.",
    );
  }
  if (err instanceof Anthropic.NotFoundError) {
    return new Error(
      "Anthropic model not found (404): check ANTHROPIC_MODEL is a valid model ID.",
    );
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new Error("Anthropic rate limited (429): retry shortly.");
  }
  if (err instanceof Anthropic.APIError) {
    return new Error(`Anthropic API error (${err.status ?? "?"}): ${err.message}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}
