# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Product

Northstar Labs is a single Next.js 14 app (TypeScript, App Router). The main dev surface is the dashboard at `http://localhost:3000`. No Docker, Supabase, or API keys are required for local development — mock LLM and in-memory shared memory are the defaults.

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

- Copy `.env.example` → `.env.local` if missing. All vars are optional.
- Without keys: `LLM_PROVIDER=mock`, memory backend is in-process.
- Optional: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` for live models; `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` after applying `supabase/schema.sql`.

Verify runtime: `curl http://localhost:3000/api/health` → `{"ok":true,"provider":"mock",...}`.

### Running the dev server

Start with `npm run dev` from the repo root (Node 22+). Use a tmux session for long-running servers in Cloud Agent VMs.

### Hello-world / E2E smoke test

Minimum path (no browser):

```bash
curl -s -X POST http://localhost:3000/api/chat \
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
