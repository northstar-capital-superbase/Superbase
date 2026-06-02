import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { MockProvider } from "./mock";
import type { LLMProvider, ProviderName } from "./types";

export * from "./types";

let cached: LLMProvider | null = null;

// Resolves the active LLM provider from env. Priority:
//   1. explicit LLM_PROVIDER
//   2. whichever API key is present
//   3. mock (so the lab always runs locally)
export function getProvider(): LLMProvider {
  if (cached) return cached;

  const forced = (process.env.LLM_PROVIDER || "").toLowerCase() as ProviderName | "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const anthropicModel = process.env.ANTHROPIC_MODEL || undefined;
  const openaiModel = process.env.OPENAI_MODEL || undefined;

  if (forced === "anthropic" && anthropicKey) {
    cached = new AnthropicProvider(anthropicKey, anthropicModel);
  } else if (forced === "openai" && openaiKey) {
    cached = new OpenAIProvider(openaiKey, openaiModel);
  } else if (forced === "mock") {
    cached = new MockProvider();
  } else if (anthropicKey) {
    cached = new AnthropicProvider(anthropicKey, anthropicModel);
  } else if (openaiKey) {
    cached = new OpenAIProvider(openaiKey, openaiModel);
  } else {
    cached = new MockProvider();
  }

  return cached;
}

// Test/runtime override hook.
export function setProvider(p: LLMProvider | null) {
  cached = p;
}
