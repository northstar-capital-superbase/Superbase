// Production environment validation — fail fast instead of silently running in
// mock / in-memory mode in production.
//
// The lab is intentionally forgiving in local dev: with no API keys it falls
// back to the mock LLM provider (lib/llm/index.ts) and with no Supabase config
// it falls back to the in-process memory store (lib/memory/index.ts). That is
// great for `npm run dev`, but in production those silent fallbacks mean a
// misconfigured deploy *looks* healthy while serving fake AI output and losing
// all memory on restart. This module turns that silent failure into a loud one.
//
// Escape hatches (for intentional demo/preview deploys):
//   ALLOW_MOCK_PROVIDER_IN_PROD=1   — permit the mock provider in production
//   ALLOW_IN_MEMORY_IN_PROD=1       — permit the in-process store in production

type EnvLike = Record<string, string | undefined>;

function truthy(v?: string): boolean {
  if (!v) return false;
  const s = v.toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}

// Mirrors the provider priority in lib/llm/index.ts:getProvider() as a pure
// function so it can be validated without instantiating an SDK client.
export function selectedProviderName(
  env: EnvLike = process.env,
): "anthropic" | "openai" | "mock" {
  const forced = (env.LLM_PROVIDER || "").toLowerCase();
  const anthropicKey = env.ANTHROPIC_API_KEY;
  const openaiKey = env.OPENAI_API_KEY;

  if (forced === "anthropic" && anthropicKey) return "anthropic";
  if (forced === "openai" && openaiKey) return "openai";
  if (forced === "mock") return "mock";
  if (anthropicKey) return "anthropic";
  if (openaiKey) return "openai";
  return "mock";
}

// Mirrors lib/memory/index.ts:memoryBackend().
export function selectedMemoryBackend(
  env: EnvLike = process.env,
): "supabase" | "in-memory" {
  const url = env.SUPABASE_URL || env["NEXT_PUBLIC_SUPABASE_URL"];
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  return url && key ? "supabase" : "in-memory";
}

// Returns the list of production-readiness problems for the given env (empty in
// non-production or when everything is configured / explicitly overridden).
export function productionConfigProblems(env: EnvLike = process.env): string[] {
  if (env.NODE_ENV !== "production") return [];

  const problems: string[] = [];

  if (selectedProviderName(env) === "mock" && !truthy(env.ALLOW_MOCK_PROVIDER_IN_PROD)) {
    problems.push(
      "LLM provider resolved to 'mock' in production. Set ANTHROPIC_API_KEY or " +
        "OPENAI_API_KEY (or ALLOW_MOCK_PROVIDER_IN_PROD=1 to allow mock output intentionally).",
    );
  }

  if (selectedMemoryBackend(env) === "in-memory" && !truthy(env.ALLOW_IN_MEMORY_IN_PROD)) {
    problems.push(
      "Memory store resolved to 'in-memory' in production (state is lost on restart). " +
        "Set SUPABASE_URL and a Supabase key (or ALLOW_IN_MEMORY_IN_PROD=1 to allow it intentionally).",
    );
  }

  return problems;
}

// Throws a single, clear error when a production deploy would silently run in
// mock / in-memory mode. No-op outside production. Cheap (env reads only), so it
// is safe to call on the hot request path.
export function assertProductionReadyConfig(env: EnvLike = process.env): void {
  const problems = productionConfigProblems(env);
  if (problems.length > 0) {
    throw new Error(
      "[config] Refusing to serve in production with an incomplete configuration:\n - " +
        problems.join("\n - "),
    );
  }
}
