import { describe, it, expect, vi, afterEach } from "vitest";
import {
  authenticate,
  getPrincipal,
  principalFromHeaders,
  scopeSession,
  unscopeSession,
  rateLimitKey,
  AUTH_HEADERS,
  DEV_USER_ID,
  SERVICE_USER_ID,
  type Principal,
} from "@/lib/auth";

const reqWith = (headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/chat", { method: "POST", headers });

const SUPABASE_ENV = { SUPABASE_URL: "https://proj.supabase.co", SUPABASE_ANON_KEY: "anon" };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("authenticate — dev fallback", () => {
  it("returns an explicit dev-user outside production (zero-config dev)", async () => {
    const p = await authenticate(reqWith(), { NODE_ENV: "development" });
    expect(p).toEqual({ userId: DEV_USER_ID, email: null, kind: "dev" });
  });

  it("is IMPOSSIBLE to activate in production", async () => {
    // No credentials + production => rejected, never dev-user.
    const p = await authenticate(reqWith(), { NODE_ENV: "production" });
    expect(p).toBeNull();
  });

  it("never yields dev-user in production even with junk auth", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("no", { status: 401 }),
    );
    const p = await authenticate(reqWith({ authorization: "Bearer nope" }), {
      NODE_ENV: "production",
      ...SUPABASE_ENV,
    });
    expect(p).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("authenticate — service token", () => {
  it("accepts the service token in production", async () => {
    const p = await authenticate(reqWith({ authorization: "Bearer s3cret" }), {
      NODE_ENV: "production",
      API_SERVICE_TOKEN: "s3cret",
    });
    expect(p).toEqual({ userId: SERVICE_USER_ID, email: null, kind: "service" });
  });

  it("rejects a wrong service token in production", async () => {
    const p = await authenticate(reqWith({ authorization: "Bearer wrong" }), {
      NODE_ENV: "production",
      API_SERVICE_TOKEN: "s3cret",
    });
    expect(p).toBeNull();
  });
});

describe("authenticate — Supabase user token", () => {
  it("returns a user principal for a valid token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "u-123", email: "a@b.co" }), { status: 200 }),
    );
    const p = await authenticate(reqWith({ authorization: "Bearer good" }), {
      NODE_ENV: "production",
      ...SUPABASE_ENV,
    });
    expect(p).toEqual({ userId: "u-123", email: "a@b.co", kind: "user" });
  });

  it("reads the token from the sb-access-token cookie too", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "u-9" }), { status: 200 }),
    );
    const p = await authenticate(reqWith({ cookie: "sb-access-token=cookiejwt" }), {
      NODE_ENV: "production",
      ...SUPABASE_ENV,
    });
    expect(p?.userId).toBe("u-9");
    const calledWith = fetchMock.mock.calls[0][1] as RequestInit;
    expect((calledWith.headers as Record<string, string>).Authorization).toBe("Bearer cookiejwt");
  });
});

describe("principalFromHeaders / getPrincipal", () => {
  it("reads identity forwarded by middleware", () => {
    const req = reqWith({
      [AUTH_HEADERS.userId]: "u-1",
      [AUTH_HEADERS.email]: "x@y.z",
      [AUTH_HEADERS.kind]: "user",
    });
    expect(principalFromHeaders(req)).toEqual({ userId: "u-1", email: "x@y.z", kind: "user" });
  });

  it("getPrincipal trusts middleware headers without re-validating", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const req = reqWith({ [AUTH_HEADERS.userId]: "u-1", [AUTH_HEADERS.kind]: "user" });
    const p = await getPrincipal(req, { NODE_ENV: "production" });
    expect(p?.userId).toBe("u-1");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("session scoping (per-user authorization)", () => {
  const alice: Principal = { userId: "alice", email: null, kind: "user" };
  const bob: Principal = { userId: "bob", email: null, kind: "user" };

  it("namespaces a session by user and round-trips", () => {
    const scoped = scopeSession(alice, "default");
    expect(scoped).toBe("alice::default");
    expect(unscopeSession(alice, scoped)).toBe("default");
  });

  it("isolates the same client sessionId across users", () => {
    expect(scopeSession(alice, "default")).not.toBe(scopeSession(bob, "default"));
  });

  it("rate-limit key follows identity", () => {
    expect(rateLimitKey(alice)).toBe("user:alice");
  });
});
