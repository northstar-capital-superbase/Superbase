import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import type { LLMProvider, ProviderName } from "./types";

export * from "./types";

let cached: LLMProvider | null = null;

// Resolves the active LLM provider from env. Priority:
//   1. explicit LLM_PROVIDER (if its key is present)
//   2. whichever API key is present (Anthropic, then OpenAI)
// Returns null when nothing is configured — a real key is required.
function resolveProvider(): LLMProvider | null {
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
  } else if (anthropicKey) {
    cached = new AnthropicProvider(anthropicKey, anthropicModel);
  } else if (openaiKey) {
    cached = new OpenAIProvider(openaiKey, openaiModel);
  } else {
    return null;
  }

  return cached;
}

// Throws if no provider is configured — use at the point a completion is needed.
export function getProvider(): LLMProvider {
  const provider = resolveProvider();
  if (!provider) {
    throw new Error(
      "No LLM provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.",
    );
  }
  return provider;
}

// Non-throwing variant for status/diagnostics surfaces (health, roster).
export function getProviderSafe(): LLMProvider | null {
  return resolveProvider();
}

export function providerConfigured(): boolean {
  return resolveProvider() !== null;
}

// Test/runtime override hook.
export function setProvider(p: LLMProvider | null) {
  cached = p;
}
