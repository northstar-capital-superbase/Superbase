# Deploying Northstar Labs

A personal/internal deploy. Pick one path. Both need the same env vars.

## Environment variables

| Variable | Required? | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **required** (or `OPENAI_API_KEY`) | powers the crew |
| `ANTHROPIC_MODEL` | optional | default `claude-opus-4-8`; `claude-sonnet-4-6` is cheaper/faster |
| `SUPABASE_URL` | for persistence | else in-memory (lost on restart) |
| `SUPABASE_SERVICE_ROLE_KEY` | for persistence | server-side only; apply `supabase/schema.sql` first |
| `RATE_LIMIT_PER_MIN` | optional | default 20 |
| `MAX_TASK_CHARS` | optional | default 4000 |
| `ROBINHOOD_MCP_TOKEN` | for live trading | OAuth bearer from `/api/trading/oauth/start` or Cursor MCP connect |
| `TRADING_MODE` | optional | `advisory` (read-only) · `confirm` · `auto` (default) |
| `TRADING_MAX_ORDER_USD` | optional | default `100` |
| `TRADING_MAX_ORDERS_PER_RUN` | optional | default `3` |

> Requires an LLM key (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`); memory falls
> back to in-process when Supabase isn't configured.
> Local dev can also read `.robinhood-mcp-token` after in-app OAuth (see `docs/TRADING.md`).

---

## Option A — Vercel (easiest)

1. Merge the project to `main` (PR #2), or point Vercel at the branch.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import
   `northstar-capital-superbase/superbase`. It auto-detects Next.js (`vercel.json` is included).
3. **Settings → Environment Variables** → add the vars above.
4. **Deploy**. Vercel gives you a URL.
5. Verify: open `https://<your-app>/api/health?ping=1` → expect `"live":true`,
   and `?memory=1` → `"backend":"supabase"`.

Every push to the deployed branch auto-redeploys.

---

## Option B — Docker (self-host)

```bash
docker build -t northstar-labs .
docker run -p 3000:3000 --env-file .env.local northstar-labs
# → http://localhost:3000
```

The image uses Next.js standalone output (small, non-root). `.env.local` holds
your keys (it's gitignored).

---

## Post-deploy checklist

- [ ] `GET /api/health` → `provider: anthropic`, `memory: supabase`
- [ ] `GET /api/health?ping=1` → `"live": true` (needs Anthropic credits)
- [ ] `GET /api/health?memory=1` → `"persisted": true` (needs schema applied)
- [ ] Run a task in the UI; confirm rows land in Supabase `lab_memory`
- [ ] Rotate the Supabase `service_role` key if it was ever shared

## Notes for a personal tool

- No auth — don't put it on a public URL you wouldn't want others hitting.
  Use Vercel password protection, an allowlist, or keep it local.
- `RATE_LIMIT_PER_MIN` is your cost backstop; lower it if you're worried.
- Pick `ANTHROPIC_MODEL=claude-sonnet-4-6` for ~5x cheaper runs while iterating.
