"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";

interface Health {
  ok: boolean;
  provider: string;
  model: string;
  memory: "supabase" | "in-memory";
  mock: boolean;
}

interface CheckResult {
  ok: boolean;
  ms?: number;
  error?: string;
  reply?: string;
  live?: boolean;
  persisted?: boolean;
  // trading-specific
  enabled?: boolean;
  toolCount?: number;
}

type Probe = CheckResult | "loading" | null;

type TradingModeName = "advisory" | "confirm" | "auto";

interface TradingStatus {
  ok: boolean;
  enabled: boolean;
  endpoint: string;
  mode?: TradingModeName;
  modeSource?: "override" | "env" | "default";
  maxOrderUsd?: number;
  maxOrdersPerRun?: number;
  error?: string;
}

const MODE_COPY: Record<TradingModeName, string> = {
  advisory: "read-only — every order blocked",
  confirm: "reads & advises — orders need explicit approval",
  auto: "may place orders within the caps below",
};

// Live integration cockpit: shows the active LLM + memory backend and runs
// real connectivity diagnostics (the same /api/health probes used in CI) so
// the whole stack — Claude, Supabase, Robinhood — is verifiable from the dashboard.
export function Integrations() {
  const [health, setHealth] = useState<Health | null>(null);
  const [llm, setLlm] = useState<Probe>(null);
  const [mem, setMem] = useState<Probe>(null);
  const [trading, setTrading] = useState<Probe>(null);
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) setHealth(await res.json());
    } catch {
      /* ignore — surfaced by diagnostics */
    }
  }, []);

  const loadTradingStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/trading");
      if (res.ok) setTradingStatus(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadHealth();
    loadTradingStatus();
  }, [loadHealth, loadTradingStatus]);

  const runDiagnostics = useCallback(async () => {
    setLlm("loading");
    setMem("loading");
    setTrading("loading");
    const [llmRes, memRes, tradingRes] = await Promise.allSettled([
      fetch("/api/health?ping=1").then((r) => r.json()),
      fetch("/api/health?memory=1").then((r) => r.json()),
      fetch("/api/trading?probe=1").then((r) => r.json()),
    ]);
    setLlm(
      llmRes.status === "fulfilled"
        ? llmRes.value
        : { ok: false, error: "request failed" },
    );
    setMem(
      memRes.status === "fulfilled"
        ? memRes.value
        : { ok: false, error: "request failed" },
    );
    setTrading(
      tradingRes.status === "fulfilled"
        ? tradingRes.value
        : { ok: false, error: "request failed" },
    );
    loadHealth();
    loadTradingStatus();
  }, [loadHealth, loadTradingStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("rh_connected") !== "1") return;
    params.delete("rh_connected");
    const qs = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
    void runDiagnostics();
  }, [runDiagnostics]);

  const setMode = useCallback(
    async (mode: TradingModeName) => {
      if (mode === "auto") {
        const ok = window.confirm(
          "Enable AUTO mode?\n\nThe Trader will be allowed to place real orders on its own, within your per-order and per-run caps. You can pause this instantly with the kill switch.",
        );
        if (!ok) return;
      }
      try {
        const res = await fetch("/api/trading?action=mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        });
        if (res.ok) await loadTradingStatus();
      } catch {
        /* ignore — status reload will reflect reality */
      }
    },
    [loadTradingStatus],
  );

  const llmHealthy = health && !health.mock;
  const memHealthy = health?.memory === "supabase";
  const tradingEnabled = tradingStatus?.enabled ?? false;
  const mode = tradingStatus?.mode ?? "confirm";

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Integrations</span>
          <span className="text-[11px] text-slate-500">
            live status &amp; diagnostics
          </span>
        </div>
        <button
          onClick={runDiagnostics}
          className="rounded-lg border border-white/5 bg-base-750/60 px-3 py-1.5 text-[12px] font-medium text-slate-200 transition hover:border-accent/40"
        >
          Run diagnostics
        </button>
      </div>

      {!tradingEnabled && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-100/90">
          <span>
            Connect Robinhood Agentic on desktop — OAuth opens Robinhood, then
            stores a local token for MCP.
          </span>
          <a
            href="/api/trading/oauth/start"
            className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 font-medium text-accent transition hover:bg-accent/20"
          >
            Connect Robinhood
          </a>
          <span className="text-slate-500">
            or Cursor → Tools &amp; MCPs →{" "}
            <code className="text-[11px]">agent.robinhood.com/mcp/trading</code>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="LLM provider"
          value={health ? health.provider : "…"}
          sub={health?.model}
          state={health ? (llmHealthy ? "ok" : "warn") : "idle"}
          note={
            health?.mock
              ? "mock mode — add ANTHROPIC_API_KEY"
              : llmHealthy
                ? "live model"
                : undefined
          }
          probe={llm}
          okLabel={(r) => (r.live ? "reachable" : "ok")}
        />
        <Tile
          label="Shared memory"
          value={health ? prettyMemory(health.memory) : "…"}
          sub={health?.memory === "supabase" ? "persistent" : "process-local"}
          state={health ? (memHealthy ? "ok" : "warn") : "idle"}
          note={
            memHealthy
              ? "Supabase connected"
              : "in-memory (set SUPABASE_URL to persist)"
          }
          probe={mem}
          okLabel={(r) => (r.persisted ? "persisted" : "ok")}
        />
        <Tile
          label="Robinhood Trading"
          value={tradingStatus ? (tradingEnabled ? "connected" : "not configured") : "…"}
          sub={
            tradingEnabled
              ? `agentic · ${tradingStatus?.mode ?? "auto"}`
              : undefined
          }
          state={tradingStatus ? (tradingEnabled ? "ok" : "warn") : "idle"}
          note={
            tradingEnabled
              ? `MCP live · $${tradingStatus?.maxOrderUsd ?? 100} cap / order`
              : "Connect Robinhood above or set ROBINHOOD_MCP_TOKEN"
          }
          probe={trading}
          okLabel={(r) =>
            typeof r.toolCount === "number"
              ? `${r.toolCount} tool${r.toolCount !== 1 ? "s" : ""} available`
              : "reachable"
          }
        />
        <Tile
          label="GitHub"
          value="connected"
          sub="northstar-capital-superbase/superbase"
          state="ok"
          note="commits pushed to branch"
          probe={null}
          okLabel={() => "ok"}
        />
      </div>

      {tradingEnabled && (
        <div className="mt-3 rounded-lg border border-white/5 bg-base-750/40 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Operating mode
              </span>
              <span className="text-[11px] text-slate-500">
                {MODE_COPY[mode]}
                {tradingStatus?.modeSource === "override" && (
                  <span className="ml-1 text-slate-600">· set here</span>
                )}
              </span>
            </div>
            <button
              onClick={() => setMode("advisory")}
              disabled={mode === "advisory"}
              className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-200 transition enabled:hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              title="Pause all automation instantly — blocks every order"
            >
              ⏻ Pause automation
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["advisory", "confirm", "auto"] as TradingModeName[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "rounded-full border px-3 py-1 text-[11px] capitalize transition",
                  mode === m
                    ? m === "auto"
                      ? "border-amber-400/50 bg-amber-400/15 text-amber-100"
                      : "border-accent/50 bg-accent/15 text-slate-100"
                    : "border-white/5 text-slate-400 hover:text-slate-200",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  state,
  note,
  probe,
  okLabel,
}: {
  label: string;
  value: string;
  sub?: string;
  state: "ok" | "warn" | "idle";
  note?: string;
  probe: Probe;
  okLabel: (r: CheckResult) => string;
}) {
  const dot =
    state === "ok"
      ? "bg-signal-research"
      : state === "warn"
        ? "bg-signal-behavioral"
        : "bg-slate-600";
  return (
    <div className="panel-tight p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        <span className={clsx("h-2 w-2 rounded-full", dot)} />
      </div>
      <div className="mt-1.5 truncate text-sm font-semibold text-white" title={value}>
        {value}
      </div>
      {sub && <div className="truncate text-[11px] text-slate-500">{sub}</div>}
      {note && <div className="mt-1 text-[11px] text-slate-500">{note}</div>}

      {probe === "loading" && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-accent" />
          testing…
        </div>
      )}
      {probe && probe !== "loading" && (
        <div
          className={clsx(
            "mt-2 rounded-md px-2 py-1 text-[11px]",
            probe.ok
              ? "bg-signal-research/10 text-signal-research"
              : "bg-red-500/10 text-red-300",
          )}
        >
          {probe.ok ? (
            <span>
              ✓ {okLabel(probe)}
              {typeof probe.ms === "number" ? ` · ${probe.ms}ms` : ""}
            </span>
          ) : (
            <span title={probe.error}>✗ {truncate(probe.error)}</span>
          )}
        </div>
      )}
    </div>
  );
}

function prettyMemory(m: string): string {
  return m === "supabase" ? "Supabase" : "In-memory";
}

function truncate(s?: string): string {
  if (!s) return "failed";
  return s.length > 64 ? s.slice(0, 64) + "…" : s;
}
