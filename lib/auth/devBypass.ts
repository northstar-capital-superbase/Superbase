// Development authentication bypass — a single, explicit, server-authoritative
// switch that lets local development and (opt-in) Vercel Preview deployments
// open directly into Northstar while the login/signup flow is unfinished.
//
// Every place that needs to know "is auth bypassed right now?" — middleware.ts,
// lib/auth/getUser.ts, lib/memory/index.ts, and the /api/auth/dev-status
// route that drives the banner — MUST call `isAuthBypassEnabled()` from here.
// There is exactly one decision, made in exactly one place, so it can never
// drift between call sites.
//
// Safety properties (see docs/DEV-AUTH-BYPASS.md for the full writeup):
//   - Off unless NORTHSTAR_DEV_NO_AUTH is set to the *exact* string "1".
//     Any other value — unset, "0", "true", "yes", a typo — fails closed.
//   - Refuses to activate whenever VERCEL_ENV === "production", even if the
//     flag is (mistakenly) set there. This is checked on every call, not
//     just at boot, and cannot be overridden by any other variable.
//   - Never touches Supabase Auth, middleware's real session logic, or RLS —
//     those code paths are simply skipped while this returns true, and behave
//     exactly as before the moment it returns false again.

export const DEV_BYPASS_ENV_VAR = "NORTHSTAR_DEV_NO_AUTH";
const DEV_BYPASS_ENABLE_VALUE = "1";

// A fixed, obviously-synthetic identity — never a real Supabase auth.users
// row. It is only ever used as an in-memory stand-in for "who is asking",
// and is never sent to Supabase (see lib/memory/index.ts, which forces the
// ephemeral in-process store whenever the bypass is active).
export const DEV_OPERATOR_ID = "00000000-0000-0000-0000-000000000000";
export const DEV_OPERATOR_EMAIL = "dev-bypass@northstar.local";

export interface DevOperator {
  id: string;
  email: string;
}

export function getDevOperator(): DevOperator {
  return { id: DEV_OPERATOR_ID, email: DEV_OPERATOR_EMAIL };
}

// Exact-match only. A truthy-but-wrong value ("true", "yes", " 1") is treated
// as not-configured rather than guessed at — explicit configuration means
// exactly one accepted spelling.
function bypassFlagSet(): boolean {
  return process.env[DEV_BYPASS_ENV_VAR] === DEV_BYPASS_ENABLE_VALUE;
}

// Vercel sets VERCEL_ENV to "production" | "preview" | "development" on every
// deployment it builds, and leaves it unset for a plain local `next dev` /
// `next build`. Only the literal string "production" counts as real
// Production — unset (local dev) and "preview" are both allowed to bypass.
function isRealVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

// Warn (not just silently allow/deny) so the bypass is never mistaken for
// normal operation in server logs. Each message fires once per process.
const globalForDevBypass = globalThis as unknown as {
  __northstarDevBypassWarned?: boolean;
  __northstarDevBypassRejectedWarned?: boolean;
};

function warnActive(): void {
  if (globalForDevBypass.__northstarDevBypassWarned) return;
  globalForDevBypass.__northstarDevBypassWarned = true;
  console.warn(
    `[northstar] Development auth bypass is ACTIVE (${DEV_BYPASS_ENV_VAR}=1). ` +
      "Every request resolves the fixed development operator; no Supabase " +
      "session is required and dev-mode memory is ephemeral (in-process). " +
      "Never set this variable in a real Production environment.",
  );
}

function warnRejected(): void {
  if (globalForDevBypass.__northstarDevBypassRejectedWarned) return;
  globalForDevBypass.__northstarDevBypassRejectedWarned = true;
  console.error(
    `[northstar] ${DEV_BYPASS_ENV_VAR}=1 is set but VERCEL_ENV=production — ` +
      "refusing to bypass authentication. Remove this variable from the " +
      "Production environment in the Vercel dashboard.",
  );
}

// The single source of truth. Returns true only when the flag is set to
// exactly "1" AND this is not a real Vercel Production deployment.
export function isAuthBypassEnabled(): boolean {
  if (!bypassFlagSet()) return false;

  if (isRealVercelProduction()) {
    warnRejected();
    return false;
  }

  warnActive();
  return true;
}
