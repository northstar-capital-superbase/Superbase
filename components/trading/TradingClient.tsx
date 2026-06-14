"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";

interface TradingStatus {
  ok: boolean;
  enabled: boolean;
  endpoint: string;
  mode?: string;
  maxOrderUsd?: number;
  maxOrdersPerRun?: number;
  error?: string;
}

interface CheckResult {
  ok: boolean;
  ms?: number;
  toolCount?: number;
  error?: string;
}

const DECISIONS = [
  {
    id: "d1",
    type: "analysis",
    title: "Pre-market sector scan complete",
    detail:
      "Semiconductor sector showing relative strength vs S&P 500. NVDA and AMD leading. Research agent flagged supply chain normalization as catalyst.",
    agent: "Research",
    agentColor: "#34d399",
    time: "6:45 AM",
    status: "complete",
  },
  {
    id: "d2",
    type: "strategy",
    title: "Rebalancing strategy generated",
    detail:
      "Portfolio Energy underweight by 3.2% relative to target allocation. Strategist recommends gradual entry into XLE over 3 sessions.",
    agent: "Strategist",
    agentColor: "#a78bfa",
    time: "7:02 AM",
    status: "complete",
  },
  {
    id: "d3",
    type: "risk",
    title: "Concentration limit flagged",
    detail:
      "NVDA position at 8.4% of portfolio exceeds 7% soft limit. Behavioral agent flagged momentum bias — recommending hold, not add.",
    agent: "Behavioral",
    agentColor: "#fbbf24",
    time: "7:18 AM",
    status: "warning",
  },
];

const HOLDINGS = [
  { symbol: "NVDA", name: "NVIDIA Corporation", pct: 8.4, price: 875.4, change: 2.3, color: "#6d8bff" },
  { symbol: "AAPL", name: "Apple Inc.", pct: 7.1, price: 189.3, change: 0.4, color: "#a78bfa" },
  { symbol: "MSFT", name: "Microsoft Corporation", pct: 6.9, price: 415.2, change: 1.1, color: "#34d399" },
  { symbol: "AMZN", name: "Amazon.com Inc.", pct: 5.5, price: 182.7, change: -0.8, color: "#fbbf24" },
  { symbol: "GOOGL", name: "Alphabet Inc.", pct: 4.9, price: 156.8, change: 0.6, color: "#22d3ee" },
];

type ProbeState = CheckResult | "loading" | null;

export function TradingClient() {
  const [status, setStatus] = useState<TradingStatus | null>(null);
  const [probe, setProbe] = useState<ProbeState>(null);
  const [probing, setProbing] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/trading");
      if (res.ok) setStatus(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("rh_connected") !== "1") return;
    params.delete("rh_connected");
    const qs = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    loadStatus();
  }, [loadStatus]);

  const runProbe = useCallback(async () => {
    setProbing(true);
    setProbe("loading");
    try {
      const res = await fetch("/api/trading?probe=1");
      setProbe(await res.json());
    } catch {
      setProbe({ ok: false, error: "Connection failed" });
    } finally {
      setProbing(false);
      await loadStatus();
    }
  }, [loadStatus]);

  const tradingEnabled = status?.enabled ?? false;
  const mode = status?.mode ?? "advisory";
  const maxOrderUsd = status?.maxOrderUsd ?? 100;

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* ── Header ── */}
      <div className="mb-6 md:mb-8">
        <div className="label-mono mb-1.5 md:mb-2">Robinhood Agentic</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
              Trading
            </h1>
            <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
              Autonomous account management — what your AI is doing with your capital.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tradingEnabled ? (
              <>
                <span className="status-live animate-pulseSoft" />
                <span className="font-mono text-[11px] text-status-success">
                  {mode}
                </span>
              </>
            ) : (
              <>
                <span className="status-warn" />
                <span className="font-mono text-[11px] text-status-warning">
                  Not connected
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Connect Banner ── */}
      {!tradingEnabled && (
        <div className="mb-5 space-y-3 rounded-xl border border-status-warning/15 bg-status-warning/5 p-4 md:mb-6">
          <div>
            <div className="text-[13px] font-medium text-status-warning">
              Connect Robinhood Agentic
            </div>
            <div className="mt-1 text-[12px] text-slate-500">
              OAuth connects your Robinhood account to the AI Trader agent. Orders stay in advisory mode until you configure auto execution.
            </div>
          </div>
          <a
            href="/api/trading/oauth/start"
            className="inline-flex min-h-[40px] items-center rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/15 active:bg-accent/20"
          >
            Connect Robinhood →
          </a>
        </div>
      )}

      {/* ── Key Stats ── */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard label="Account Value" value="$847,293" delta="+$12,841" deltaPositive sub="today" />
        <StatCard label="Cash Available" value="$23,418" sub="2.8% of portfolio" />
        <StatCard
          label="Agent Mode"
          value={tradingEnabled ? mode.charAt(0).toUpperCase() + mode.slice(1) : "Not Connected"}
          sub={tradingEnabled ? `$${maxOrderUsd} max / order` : "OAuth required"}
          valueColor={tradingEnabled ? "#34d399" : "#5a6080"}
        />
        <StatCard label="Today's Decisions" value="3" sub="0 orders placed" />
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        {/* Decision Log */}
        <div className="panel p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="label-mono">AI Decision Log</div>
              <div className="mt-0.5 text-[12px] text-slate-600">What Northstar did and why</div>
            </div>
            <button
              onClick={runProbe}
              disabled={probing}
              className="btn btn-secondary btn-sm flex-shrink-0"
            >
              {probing ? "Testing…" : "Test connection"}
            </button>
          </div>

          {probe && probe !== "loading" && (
            <div
              className={clsx(
                "mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]",
                probe.ok
                  ? "border border-status-success/15 bg-status-success/5 text-status-success"
                  : "border border-status-danger/15 bg-status-danger/5 text-status-danger",
              )}
            >
              {probe.ok ? (
                <>
                  <span>✓</span>
                  <span className="min-w-0 break-words">
                    MCP connected
                    {typeof probe.toolCount === "number" ? ` · ${probe.toolCount} tools` : ""}
                    {typeof probe.ms === "number" ? ` · ${probe.ms}ms` : ""}
                  </span>
                </>
              ) : (
                <>
                  <span className="flex-shrink-0">✗</span>
                  <span className="min-w-0 break-words">{probe.error ?? "Connection failed"}</span>
                </>
              )}
            </div>
          )}

          {/* Decision cards */}
          <div className="space-y-3">
            {DECISIONS.map((d) => (
              <DecisionCard key={d.id} decision={d} />
            ))}
          </div>

          {!tradingEnabled && (
            <div className="mt-4 rounded-lg border border-dashed border-white/[0.06] px-4 py-5 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-700">
                No live decisions
              </div>
              <div className="mt-1 text-[12px] text-slate-700">
                Connect Robinhood to see real agent decisions
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Agent config */}
          <div className="panel p-4">
            <div className="label-mono mb-3">Agent Configuration</div>
            <div className="space-y-2.5">
              <ConfigRow label="Mode" value={tradingEnabled ? mode : "Not connected"} />
              <ConfigRow label="Max order" value={tradingEnabled ? `$${maxOrderUsd}` : "—"} />
              <ConfigRow
                label="Max / run"
                value={tradingEnabled ? String(status?.maxOrdersPerRun ?? 3) : "—"}
              />
              <ConfigRow
                label="MCP endpoint"
                value={tradingEnabled ? "agent.robinhood.com" : "—"}
                mono
              />
            </div>
          </div>

          {/* Holdings */}
          <div className="panel p-4">
            <div className="label-mono mb-3">Top Holdings</div>
            <div className="space-y-2.5">
              {HOLDINGS.map((h) => (
                <HoldingRow key={h.symbol} holding={h} />
              ))}
            </div>
            <div className="mt-3 border-t border-white/[0.04] pt-2.5 text-[11px] text-slate-700">
              Demo data — connect Robinhood to see live holdings
            </div>
          </div>

          {/* Risk */}
          <div className="panel p-4">
            <div className="label-mono mb-3">Risk Profile</div>
            <div className="space-y-2.5">
              {[
                { label: "Concentration", value: "Moderate", color: "#fbbf24" },
                { label: "Volatility", value: "Low", color: "#34d399" },
                { label: "Drawdown", value: "12.4%", color: "#34d399" },
                { label: "Beta (S&P)", value: "1.08", color: "#fbbf24" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-slate-500">{r.label}</span>
                  <span className="text-[12px] font-medium" style={{ color: r.color }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="panel p-3 md:p-4">
      <div className="label-mono mb-1.5 md:mb-2">{label}</div>
      <div
        className="tabular-nums text-lg font-semibold tracking-tight md:text-xl"
        style={{ color: valueColor ?? "#eef0f8" }}
      >
        {value}
      </div>
      {delta && (
        <div
          className={clsx(
            "mt-1 text-[11px] font-medium md:text-[12px]",
            deltaPositive ? "text-status-success" : "text-status-danger",
          )}
        >
          {deltaPositive ? "↑" : "↓"} {delta}
        </div>
      )}
      {sub && <div className="mt-0.5 text-[10px] text-slate-600 md:text-[11px]">{sub}</div>}
    </div>
  );
}

function DecisionCard({ decision }: { decision: (typeof DECISIONS)[number] }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.03]">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-md text-[10px] font-bold"
          style={{ backgroundColor: `${decision.agentColor}18`, color: decision.agentColor }}
        >
          {decision.agent[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.12em]"
              style={{ color: decision.agentColor }}
            >
              {decision.agent}
            </span>
            <span
              className={clsx(
                "rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em]",
                decision.status === "warning"
                  ? "border border-status-warning/20 bg-status-warning/8 text-status-warning"
                  : "border border-white/10 bg-white/5 text-slate-600",
              )}
            >
              {decision.status}
            </span>
            <span className="ml-auto font-mono text-[10px] text-slate-700">{decision.time}</span>
          </div>
          <div className="mt-1 text-[13px] font-medium text-slate-300">{decision.title}</div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{decision.detail}</p>
        </div>
      </div>
    </div>
  );
}

function HoldingRow({ holding }: { holding: (typeof HOLDINGS)[number] }) {
  const positive = holding.change >= 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-[11px] font-bold"
        style={{ backgroundColor: `${holding.color}18`, color: holding.color }}
      >
        {holding.symbol[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="truncate text-[12px] font-medium text-slate-300">{holding.symbol}</span>
          <span
            className={clsx("flex-shrink-0 font-mono text-[11px]", positive ? "text-status-success" : "text-status-danger")}
          >
            {positive ? "+" : ""}{holding.change}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-slate-600">{holding.pct}% of portfolio</span>
          <span className="font-mono text-[10px] text-slate-600">${holding.price}</span>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-slate-600">{label}</span>
      <span className={clsx("min-w-0 truncate text-right text-[12px] text-slate-400", mono && "font-mono text-[11px]")}>
        {value}
      </span>
    </div>
  );
}
