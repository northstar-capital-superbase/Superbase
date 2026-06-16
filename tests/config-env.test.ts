import { describe, it, expect } from "vitest";
import {
  selectedProviderName,
  selectedMemoryBackend,
  productionConfigProblems,
  assertProductionReadyConfig,
} from "@/lib/config/env";

describe("selectedProviderName", () => {
  it("prefers an explicit, key-backed LLM_PROVIDER", () => {
    expect(selectedProviderName({ LLM_PROVIDER: "openai", OPENAI_API_KEY: "k" })).toBe("openai");
    expect(selectedProviderName({ LLM_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k" })).toBe("anthropic");
  });

  it("honors forced mock", () => {
    expect(selectedProviderName({ LLM_PROVIDER: "mock", ANTHROPIC_API_KEY: "k" })).toBe("mock");
  });

  it("auto-detects by key, anthropic first", () => {
    expect(selectedProviderName({ ANTHROPIC_API_KEY: "k", OPENAI_API_KEY: "k2" })).toBe("anthropic");
    expect(selectedProviderName({ OPENAI_API_KEY: "k2" })).toBe("openai");
  });

  it("falls back to mock with no keys", () => {
    expect(selectedProviderName({})).toBe("mock");
  });
});

describe("selectedMemoryBackend", () => {
  it("is supabase when url + any key are present", () => {
    expect(selectedMemoryBackend({ SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "k" })).toBe("supabase");
    expect(selectedMemoryBackend({ SUPABASE_URL: "u", SUPABASE_ANON_KEY: "k" })).toBe("supabase");
  });

  it("is in-memory otherwise", () => {
    expect(selectedMemoryBackend({})).toBe("in-memory");
    expect(selectedMemoryBackend({ SUPABASE_URL: "u" })).toBe("in-memory");
  });
});

describe("productionConfigProblems", () => {
  it("is empty outside production", () => {
    expect(productionConfigProblems({ NODE_ENV: "development" })).toEqual([]);
    expect(productionConfigProblems({})).toEqual([]);
  });

  it("flags mock provider and in-memory store in production", () => {
    const problems = productionConfigProblems({ NODE_ENV: "production" });
    expect(problems).toHaveLength(2);
    expect(problems.join(" ")).toMatch(/mock/i);
    expect(problems.join(" ")).toMatch(/in-memory/i);
  });

  it("passes when provider and store are real in production", () => {
    expect(
      productionConfigProblems({
        NODE_ENV: "production",
        ANTHROPIC_API_KEY: "k",
        SUPABASE_URL: "u",
        SUPABASE_SERVICE_ROLE_KEY: "k",
      }),
    ).toEqual([]);
  });

  it("respects explicit overrides", () => {
    expect(
      productionConfigProblems({
        NODE_ENV: "production",
        ALLOW_MOCK_PROVIDER_IN_PROD: "1",
        ALLOW_IN_MEMORY_IN_PROD: "true",
      }),
    ).toEqual([]);
  });
});

describe("assertProductionReadyConfig", () => {
  it("throws in a misconfigured production env", () => {
    expect(() => assertProductionReadyConfig({ NODE_ENV: "production" })).toThrow(/production/i);
  });

  it("does not throw in development", () => {
    expect(() => assertProductionReadyConfig({ NODE_ENV: "development" })).not.toThrow();
  });
});
