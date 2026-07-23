import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  DEV_BYPASS_ENV_VAR,
  getDevOperator,
  isAuthBypassEnabled,
} from "@/lib/auth/devBypass";
import { getAuthedUser } from "@/lib/auth/getUser";
import { middleware } from "@/middleware";
import { getMemory, memoryBackend } from "@/lib/memory";
import { InMemoryStore } from "@/lib/memory/in-memory-store";

// Every env var touched anywhere in this file, snapshotted once and restored
// after every test — mirrors the pattern in tests/auth-security.test.ts so a
// mutation here can never leak into another test file.
const ENV_KEYS = [
  DEV_BYPASS_ENV_VAR,
  "VERCEL_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
type EnvKey = (typeof ENV_KEYS)[number];

const originalEnv: Partial<Record<EnvKey, string>> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function clearAll() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function protectedRequest(path = "/labs"): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("isAuthBypassEnabled — the single source of truth", () => {
  it("defaults to authentication required when unset (local, no Vercel env)", () => {
    clearAll();
    expect(isAuthBypassEnabled()).toBe(false);
  });

  it("defaults to authentication required on a normal Production deployment", () => {
    clearAll();
    process.env.VERCEL_ENV = "production";
    expect(isAuthBypassEnabled()).toBe(false);
  });

  it("rejects an explicit bypass attempt on a real Production deployment", () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.VERCEL_ENV = "production";
    expect(isAuthBypassEnabled()).toBe(false);
  });

  it("enables the bypass for local development (no VERCEL_ENV set)", () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    expect(isAuthBypassEnabled()).toBe(true);
  });

  it("enables the bypass for an explicitly-configured Vercel Preview deployment", () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.VERCEL_ENV = "preview";
    expect(isAuthBypassEnabled()).toBe(true);
  });

  it("still requires authentication on Preview when the flag is not set", () => {
    clearAll();
    process.env.VERCEL_ENV = "preview";
    expect(isAuthBypassEnabled()).toBe(false);
  });

  it.each(["0", "true", "TRUE", "yes", " 1", "01", ""])(
    "treats an invalid/near-miss value %j as not configured (fails closed)",
    (value) => {
      clearAll();
      process.env[DEV_BYPASS_ENV_VAR] = value;
      expect(isAuthBypassEnabled()).toBe(false);
    },
  );
});

describe("getAuthedUser — API identity resolution", () => {
  it("resolves the fixed development operator when the bypass is active", async () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    const user = await getAuthedUser();
    const dev = getDevOperator();
    expect(user).toEqual({ id: dev.id, email: dev.email, accessToken: undefined });
  });

  it("resolves to null (sign-in required) when the bypass is off and Supabase isn't configured", async () => {
    clearAll();
    const user = await getAuthedUser();
    expect(user).toBeNull();
  });

  it("never resolves the dev operator on a real Production deployment, even with the flag set", async () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.VERCEL_ENV = "production";
    const user = await getAuthedUser();
    expect(user).toBeNull();
  });
});

describe("middleware — matches isAuthBypassEnabled exactly", () => {
  it("redirects an unauthenticated visitor to /login by default", async () => {
    clearAll();
    const res = await middleware(protectedRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("still redirects on a real Production deployment even if the bypass flag is set", async () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.VERCEL_ENV = "production";
    const res = await middleware(protectedRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("lets a protected route through untouched for local development", async () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    const res = await middleware(protectedRequest());
    expect(res.headers.get("location")).toBeNull();
  });

  it("lets a protected route through untouched on an explicitly-configured Preview deployment", async () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.VERCEL_ENV = "preview";
    const res = await middleware(protectedRequest());
    expect(res.headers.get("location")).toBeNull();
  });

  it("still redirects on Preview when the flag is not set", async () => {
    clearAll();
    process.env.VERCEL_ENV = "preview";
    const res = await middleware(protectedRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});

describe("dev-mode memory stays ephemeral", () => {
  it("forces the in-process store while the bypass is active, even with Supabase admin config present", () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";

    const store = getMemory({ accessToken: undefined });
    expect(store).toBeInstanceOf(InMemoryStore);
    expect(memoryBackend()).toBe("in-memory");
  });

  it("never reaches the Supabase admin-key fallback path while bypassed, even with a truthy accessToken shape", () => {
    clearAll();
    process.env[DEV_BYPASS_ENV_VAR] = "1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-test-key";

    // Even a defensively-wrong caller passing a truthy token must not reach
    // SupabaseStore while the bypass is active — the check happens first.
    const store = getMemory({ accessToken: "not-a-real-session-token" });
    expect(store).toBeInstanceOf(InMemoryStore);
  });

  it("keeps normal (non-bypass) in-process behavior unchanged when Supabase isn't configured", () => {
    clearAll();
    const store = getMemory();
    expect(store).toBeInstanceOf(InMemoryStore);
    expect(memoryBackend()).toBe("in-memory");
  });
});

describe("Supabase schema + RLS are untouched by the dev bypass", () => {
  const schema = readFileSync(
    fileURLToPath(new URL("../supabase/schema.sql", import.meta.url)),
    "utf8",
  );

  it("still enables Row Level Security on every user-owned table", () => {
    expect(schema).toMatch(/alter table public\.lab_memory enable row level security;/);
    expect(schema).toMatch(/alter table public\.profiles enable row level security;/);
  });

  it("still enforces per-user ownership (auth.uid() = user_id) on lab_memory policies", () => {
    const policyBlock = schema.slice(schema.indexOf("public.lab_memory enable row level security"));
    expect(policyBlock).toMatch(/auth\.uid\(\) = user_id/);
  });

  it("does not introduce any development-bypass concept into the schema itself", () => {
    expect(schema.toLowerCase()).not.toMatch(/dev.?bypass|dev_operator|no_auth/);
  });
});
