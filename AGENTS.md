# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Product

Northstar Labs is a single Next.js 14 app (TypeScript, App Router). The multi-agent lab dashboard is at **`http://localhost:3000/labs`** (marketing showcase at `/`). No Docker is required for local development.

**Authentication is required.** `/labs`, `/settings`, `/connections` (and every future private route) are gated behind real Supabase Auth (email + password) via `middleware.ts` — unauthenticated visitors are redirected to `/login`. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` and apply `supabase/schema.sql` before those routes will work. LLM provider and shared-memory persistence remain optional (mock/in-process by default).

### Standard commands

See `package.json` scripts and `README.md` / `CONTRIBUTING.md`:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port 3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm test` | Vitest (`tests/*.test.ts`) |
| `npm run build` | Production build |

CI runs: `npm ci` → typecheck → lint → test → build (`.github/workflows/ci.yml`).

### Environment

- Copy `.env.example` → `.env.local` if missing.
- **Required:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase Auth — accounts, profiles, per-user memory isolation). Apply `supabase/schema.sql` to that project first (SQL editor or `supabase db push`).
- Without an LLM key: crew runs return a clear "not configured" error; memory backend falls back to in-process if Supabase isn't set.
- Optional: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` for live models; `SUPABASE_SERVICE_ROLE_KEY` only matters for the admin `/api/health?memory=1` diagnostic probe — per-user chat memory authenticates as the signed-in user instead.
- **Password reset:** leave `NEXT_PUBLIC_PASSWORD_RESET_ENABLED=false` until SMTP and the recovery/update-password flow are configured; the UI hides the control while disabled.
- **Robinhood Agentic:** set `ROBINHOOD_MCP_TOKEN` and explicitly authorize owner emails with `TRADING_ALLOWED_USER_EMAILS` — see `docs/TRADING.md`. Local OAuth is owner-only and writes `.robinhood-mcp-token`; production OAuth is disabled until encrypted per-user token storage exists. Trader joins only authorized crew runs.

Verify runtime: `curl http://localhost:3000/api/health` → `{"ok":true,"provider":"mock",...}`.
Verify Robinhood MCP: `curl http://localhost:3000/api/trading?probe=1` (requires token).

### Running the dev server

Start with `npm run dev` from the repo root (Node 22+). Use a tmux session for long-running servers in Cloud Agent VMs.

### Hello-world / E2E smoke test

`/api/chat` requires an authenticated session cookie, so a bare `curl` without one now gets `401 {"error":"Sign in required."}` — that response itself confirms route protection is working. To exercise the full crew:

1. Open `http://localhost:3000/login`, create an account (or sign in).
2. You land on `/labs` (Command Center). Open **Lab Console** and send a task, or from a shell with the browser's session cookie:
   ```bash
   curl -s -X POST http://localhost:3000/api/chat \
     -b 'sb-<project-ref>-auth-token=<cookie value from devtools>' \
     -H 'Content-Type: application/json' \
     -d '{"task":"Say hello in one sentence.","sessionId":"smoke"}'
   ```

Expect JSON with `specialistResults` (research, strategist, behavioral) and `synthesis`.

### Optional components (out of main E2E path)

- **`agents-py/`** — standalone CrewAI mirror; needs Python venv + `pip install -r requirements.txt` + `ANTHROPIC_API_KEY`. Not wired to the web app.
- **Docker** — production image only (`Dockerfile`); not used for local dev.

### Gotchas

- First `npm run dev` may trigger Next.js telemetry notice; harmless.
- Streaming UI (`/api/chat/stream`) can take longer to show the final synthesis than the non-streaming `/api/chat` endpoint; use `/api/chat` for quick API smoke tests.
