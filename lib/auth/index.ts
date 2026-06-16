// Authentication & authorization for the API surface (issue #17).
//
// Strategy: a Supabase JWT gate. Callers present either a Supabase Auth access
// token (Authorization: Bearer <jwt>, or an sb-access-token cookie) or a
// server-to-server service token (API_SERVICE_TOKEN). Tokens are validated
// against Supabase's /auth/v1/user endpoint with a plain fetch, so this module
// has no Node-only dependencies and runs in both the Node and Edge (middleware)
// runtimes.
//
// Local-first dev is preserved: when NODE_ENV is not "production" we fall back to
// an explicit, named `dev-user` principal so `npm run dev` still runs with zero
// config. That fallback is impossible to activate in production — there, a
// request without a valid user or service token is rejected (401).
//
// This module is dependency-free and pure except for the Supabase validation
// fetch, which keeps it trivially unit-testable.

export const DEV_USER_ID = "dev-user";
export const SERVICE_USER_ID = "service";

const SESSION_SEP = "::";

// Request headers used to forward a validated identity from middleware to route
// handlers. Middleware strips any inbound copies before setting these, so a
// client cannot spoof them.
export const AUTH_HEADERS = {
  userId: "x-auth-user-id",
  email: "x-auth-user-email",
  kind: "x-auth-kind",
} as const;

export type AuthKind = "user" | "service" | "dev";

export interface Principal {
  userId: string;
  email: string | null;
  kind: AuthKind;
}

type EnvLike = Record<string, string | undefined>;

function isProd(env: EnvLike): boolean {
  return env.NODE_ENV === "production";
}

function authConfigured(env: EnvLike): boolean {
  const url = env.SUPABASE_URL || env["NEXT_PUBLIC_SUPABASE_URL"];
  const anon = env.SUPABASE_ANON_KEY || env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  return Boolean(url && anon);
}

// Constant-time-ish string compare so the service token check doesn't leak
// length/prefix timing. Edge-safe (no node:crypto).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function bearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (h && h.toLowerCase().startsWith("bearer ")) {
    return h.slice(7).trim() || null;
  }
  return null;
}

function cookieToken(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const m = cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Validates a Supabase Auth access token by asking Supabase who it belongs to.
async function validateSupabaseToken(
  token: string,
  env: EnvLike,
): Promise<Principal | null> {
  const url = env.SUPABASE_URL || env["NEXT_PUBLIC_SUPABASE_URL"];
  const anon = env.SUPABASE_ANON_KEY || env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  if (!url || !anon) return null;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anon },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string; email?: string | null };
    if (!user?.id) return null;
    return { userId: user.id, email: user.email ?? null, kind: "user" };
  } catch {
    return null;
  }
}

// Resolves the caller's identity, or null if unauthenticated. Order:
//   1. service token (works everywhere, incl. production)
//   2. Supabase user token (when auth is configured)
//   3. explicit dev-user fallback — non-production only
export async function authenticate(
  req: Request,
  env: EnvLike = process.env,
): Promise<Principal | null> {
  const token = bearerToken(req) ?? cookieToken(req);

  const serviceToken = env.API_SERVICE_TOKEN;
  if (serviceToken && token && safeEqual(token, serviceToken)) {
    return { userId: SERVICE_USER_ID, email: null, kind: "service" };
  }

  if (token && authConfigured(env)) {
    const principal = await validateSupabaseToken(token, env);
    if (principal) return principal;
  }

  // Local-first dev fallback. Explicit named principal; never in production.
  if (!isProd(env)) {
    return { userId: DEV_USER_ID, email: null, kind: "dev" };
  }

  return null;
}

// Reads a validated identity that middleware forwarded via request headers.
export function principalFromHeaders(req: Request): Principal | null {
  const userId = req.headers.get(AUTH_HEADERS.userId);
  if (!userId) return null;
  const kind = (req.headers.get(AUTH_HEADERS.kind) as AuthKind) || "user";
  return { userId, email: req.headers.get(AUTH_HEADERS.email), kind };
}

// Identity for a route handler: trust middleware's forwarded headers on the hot
// path, else validate directly (covers direct invocation / tests).
export async function getPrincipal(
  req: Request,
  env: EnvLike = process.env,
): Promise<Principal | null> {
  return principalFromHeaders(req) ?? (await authenticate(req, env));
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

// --- Per-user authorization scoping for shared memory --------------------
// Shared memory is keyed by sessionId. Namespacing the session with the owner's
// userId means one user can never read or clear another user's session, even
// though the client only ever sees the unscoped id.

export function scopeSession(principal: Principal, sessionId = "default"): string {
  return `${principal.userId}${SESSION_SEP}${sessionId}`;
}

export function unscopeSession(principal: Principal, scoped: string): string {
  const prefix = `${principal.userId}${SESSION_SEP}`;
  return scoped.startsWith(prefix) ? scoped.slice(prefix.length) : scoped;
}

// Rate-limit key: prefer the authenticated user so limits follow identity rather
// than a shared/proxied IP.
export function rateLimitKey(principal: Principal): string {
  return `user:${principal.userId}`;
}
