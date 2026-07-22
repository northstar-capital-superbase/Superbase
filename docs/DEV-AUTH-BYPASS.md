# Development authentication bypass (temporary)

> **Status:** Temporary, development-only. Real Supabase Auth, middleware
> protection, and Row Level Security are all fully preserved and unmodified —
> this feature only adds one more way to skip them, and only in non-production
> environments, only when explicitly configured.
>
> Part of the Northstar OS transition plan
> ([`docs/NORTHSTAR-OS-TRANSITION.md`](./NORTHSTAR-OS-TRANSITION.md), PR-B).

## What this is

While Northstar's login/signup/SMTP flow is still unfinished, requiring a real
sign-in on every local dev reload and every preview deployment blocks product
work that has nothing to do with authentication. This bypass lets **local
development** and **explicitly-configured Vercel Preview deployments** open
directly into `/labs`, `/settings`, and `/connections` without a Supabase
session — while leaving the real Auth/RLS foundation completely intact so it
can be re-enabled at any time.

It is not a fake login page, not a synthetic Supabase account, and not a
weakening of Row Level Security. When the bypass is active, the app simply
resolves a **fixed, non-persisted development operator** for the duration of
that request, instead of asking Supabase who's signed in.

## The one environment variable

| Variable | Where | Required value |
| --- | --- | --- |
| `NORTHSTAR_DEV_NO_AUTH` | Server-only (never exposed to the browser) | exactly `1` |

There is no second/public variable. The banner (see below) asks the server
whether the bypass is active via `GET /api/auth/dev-status`, so there is only
ever one place — [`lib/auth/devBypass.ts`](../lib/auth/devBypass.ts) — that
decides.

**Any other value fails closed.** Unset, `0`, `true`, `yes`, or a typo all
mean "authentication is required," never "authentication is disabled by
default." The bypass is opt-in, exact-match only.

## Local setup

```bash
# .env.local
NORTHSTAR_DEV_NO_AUTH=1
```

Restart `npm run dev`. `/labs`, `/settings`, and `/connections` now open
directly — no `/login` redirect, no session needed. The banner
"Development preview — authentication disabled — data may not persist."
appears on every page while this is set.

Remove the line (or set any other value) and restart to go back to requiring
a real sign-in locally.

## Vercel Preview setup

1. Vercel dashboard → your project → **Settings → Environment Variables**.
2. Add `NORTHSTAR_DEV_NO_AUTH` = `1`, scoped to **Preview** only — do **not**
   check "Production."
3. Redeploy (or push a new commit) so a Preview build picks it up.

Preview deployments built with that variable set now open directly into
Northstar. Preview deployments **without** it still require real sign-in,
identically to Production.

## Production safety behavior

The bypass is refused, unconditionally, whenever Vercel reports
`VERCEL_ENV=production` — Vercel sets this automatically on every Production
deployment; it is not something this project's code sets. Concretely:

- If `NORTHSTAR_DEV_NO_AUTH=1` is somehow set on Production (e.g. accidentally
  scoped to "All Environments" instead of Preview-only), the app **still
  requires real authentication** there. `isAuthBypassEnabled()` checks
  `VERCEL_ENV` on every call and returns `false` whenever it equals
  `"production"`, before anything else.
- This rejection is logged loudly (`console.error`) on the server so a
  misconfigured variable is visible in Vercel's function logs, not silent.
- This behavior is covered by automated tests
  ([`tests/dev-auth-bypass.test.ts`](../tests/dev-auth-bypass.test.ts)) that
  simulate a real Production deployment with the flag set and assert
  authentication is still required.

**Recommendation:** never add `NORTHSTAR_DEV_NO_AUTH` to the Production scope
at all, even though the code refuses to honor it there — the code-level guard
is defense in depth, not a substitute for correct environment scoping.

## Ephemeral data warning

While the bypass is active, `lib/memory/index.ts` **forces** the ephemeral,
in-process memory store — regardless of whether this environment also has
Supabase configured (including a service-role key) for other purposes. This
is a hard rule, not a best-effort default:

- Nothing written during a bypassed session (chat/agent memory) is ever sent
  to Supabase, so it can never land in a real user's `lab_memory` rows and
  never bypasses Row Level Security via the service-role key.
- Data does **not** survive a server restart, a new deployment, or (on
  serverless) even a cold start in some cases. Treat everything you see while
  the banner is showing as **disposable**.
- The development operator (`dev-bypass@northstar.local`, a fixed non-UUID
  placeholder id) is never written to `auth.users` or `public.profiles` — it
  only ever exists as an in-memory value for the duration of a request.

## What this does *not* do

- Does **not** add, modify, or relax any Supabase Auth, middleware redirect,
  or Row Level Security logic — those code paths are simply skipped while the
  bypass is active, byte-for-byte unchanged otherwise.
- Does **not** add a fake login screen, a username/password shortcut, public
  signup, SMTP, password recovery, OAuth, or invitations.
- Does **not** create any Supabase user, session, or database row.
- Does **not** enable the Robinhood Trader agent or any other owner-only
  feature — `TRADING_ALLOWED_USER_EMAILS` still only matches a real signed-in
  email, and the bypass operator's email never matches it.

## How to re-enable normal authentication

Remove (or clear) `NORTHSTAR_DEV_NO_AUTH` — locally in `.env.local`, and in
Vercel's Preview environment scope if it was added there. There is nothing
else to undo: real Supabase Auth, `middleware.ts`'s redirect logic, and
`supabase/schema.sql`'s Row Level Security policies were never touched by this
feature and resume exactly as before.
