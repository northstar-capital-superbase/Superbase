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
  enabled?: boolean;
  toolCount?: number;
}

type Probe = CheckResult | "loading" | null;

interface TradingStatus {
  ok: boolean;
  enabled: boolean;
  endpoint: string;
  mode?: string;
  maxOrderUsd?: number;
  maxOrdersPerRun?: number;
  error?: string;
}

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
    } catch { /* ignore */ }
  }, []);

  const loadTradingStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/trading");
      if (res.ok) setTradingStatus(await res.json());
    } catch { /* ignore */ }
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
    setLlm(llmRes.status === "fulfilled" ? llmRes.value : { ok: false, error: "request failed" });
    setMem(memRes.status === "fulfilled" ? memRes.value : { ok: false, error: "request failed" });
    setTrading(tradingRes.status === "fulfilled" ? tradingRes.value : { ok: false, error: "request failed" });
    loadHealth();
    loadTradingStatus();
  }, [loadHealth, loadTradingStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("rh_connected") !== "1") return;
    params.delete("rh_connected");
    const qs = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    void runDiagnostics();
  }, [runDiagnostics]);

  const llmHealthy = health && !health.mock;
  const memHealthy = health?.memory === "supabase";
  const tradingEnabled = tradingStatus?.enabled ?? false;

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="label-mono">Connections</div>
          <div className="flex items-center gap-1.5">
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full",
                llmHealthy ? "bg-status-success" : "bg-slate-700",
              )}
            />
            <span className="text-[11px] text-slate-600">
              {health ? (llmHealthy ? `${health.provider} · ${health.model}` : "mock mode") : "loading…"}
            </span>
          </div>
        </div>
        <button
          onClick={runDiagnostics}
          className="btn btn-secondary btn-xs min-h-[36px]"
        >
          Run diagnostics
        </button>
      </div>

      {!tradingEnabled && (
        <div className="mb-3 space-y-2 rounded-lg border border-status-warning/15 bg-status-warning/5 px-3 py-2.5 text-[11px] sm:flex sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
          <span className="block flex-1 text-slate-500">
            Connect Robinhood Agentic for autonomous trading — OAuth stores a local MCP token.
          </span>
          <a
            href="/api/trading/oauth/start"
            className="mt-2 inline-flex min-h-[36px] items-center rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 font-medium text-accent transition hover:bg-accent/15 sm:mt-0 sm:flex-shrink-0"
          >
            Connect Robinhood
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile
          label="LLM"
          value={health ? health.provider : "—"}
          sub={health?.model}
          state={health ? (llmHealthy ? "ok" : "warn") : "idle"}
          note={health?.mock ? "add API key for live" : "live model"}
          probe={llm}
          okLabel={(r) => (r.live ? "reachable" : "ok")}
        />
        <Tile
          label="Memory"
          value={health ? prettyMemory(health.memory) : "—"}
          sub={health?.memory === "supabase" ? "persistent" : "ephemeral"}
          state={health ? (memHealthy ? "ok" : "warn") : "idle"}
          note={memHealthy ? "Supabase" : "in-process"}
          probe={mem}
          okLabel={(r) => (r.persisted ? "persisted" : "ok")}
        />
        <Tile
          label="Robinhood"
          value={tradingStatus ? (tradingEnabled ? "Connected" : "Not configured") : "—"}
          sub={tradingEnabled ? `${tradingStatus?.mode} · $${tradingStatus?.maxOrderUsd} cap` : undefined}
          state={tradingStatus ? (tradingEnabled ? "ok" : "warn") : "idle"}
          note={tradingEnabled ? "MCP live" : "OAuth required"}
          probe={trading}
          okLabel={(r) =>
            typeof r.toolCount === "number"
              ? `${r.toolCount} tools`
              : "reachable"
          }
        />
        <Tile
          label="GitHub"
          value="Connected"
          sub="main"
          state="ok"
          note="commits synced"
          probe={null}
          okLabel={() => "ok"}
        />
      </div>
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
  const dotClass =
    state === "ok"
      ? "bg-status-success"
      : state === "warn"
        ? "bg-status-warning"
        : "bg-slate-700";

  return (
    <div className="panel-tight p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="label-mono">{label}</span>
        <span className={clsx("h-1.5 w-1.5 rounded-full", dotClass)} />
      </div>
      <div className="mt-1.5 truncate text-[13px] font-semibold text-slate-100" title={value}>
        {value}
      </div>
      {sub && <div className="truncate text-[10px] text-slate-600">{sub}</div>}
      {note && !probe && <div className="mt-1 text-[10px] text-slate-700">{note}</div>}

      {probe === "loading" && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
          <span className="h-1 w-1 animate-pulseSoft rounded-full bg-accent" />
          testing…
        </div>
      )}
      {probe && probe !== "loading" && (
        <div
          className={clsx(
            "mt-1.5 rounded px-1.5 py-0.5 text-[10px]",
            probe.ok
              ? "bg-status-success/10 text-status-success"
              : "bg-status-danger/10 text-status-danger",
          )}
        >
          {probe.ok ? (
            <span>✓ {okLabel(probe)}{typeof probe.ms === "number" ? ` · ${probe.ms}ms` : ""}</span>
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
  return s.length > 48 ? s.slice(0, 48) + "…" : s;
}
