"use client";

import clsx from "clsx";
import Link from "next/link";

// Performance data
const MONTHLY = [
  { month: "Jan", return: 2.1, benchmark: 1.8 },
  { month: "Feb", return: -0.8, benchmark: -1.2 },
  { month: "Mar", return: 3.4, benchmark: 2.9 },
  { month: "Apr", return: 1.2, benchmark: 0.6 },
  { month: "May", return: 4.1, benchmark: 3.2 },
  { month: "Jun", return: 1.5, benchmark: 1.1 },
];

const AGENT_PERFORMANCE = [
  { agent: "Orchestrator", color: "#6d8bff", runs: 24, avgMs: 4_200, successRate: 98, contribution: "Synthesis" },
  { agent: "Research", color: "#34d399", runs: 24, avgMs: 3_100, successRate: 100, contribution: "Data gathering" },
  { agent: "Strategist", color: "#a78bfa", runs: 24, avgMs: 2_800, successRate: 97, contribution: "Planning" },
  { agent: "Behavioral", color: "#fbbf24", runs: 24, avgMs: 1_900, successRate: 100, contribution: "Risk checks" },
];

function Bar({
  value,
  max,
  color,
  height = 48,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
}) {
  const pct = Math.abs(value) / max;
  const isNeg = value < 0;
  return (
    <div
      className="flex items-end justify-center"
      style={{ height }}
    >
      <div
        className="w-full rounded-t-sm"
        style={{
          height: `${pct * 100}%`,
          backgroundColor: isNeg ? "#f87171" : color,
          minHeight: 2,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

export function AnalyticsClient() {
  const maxReturn = Math.max(...MONTHLY.map((m) => Math.abs(m.return)), 1);
  const ytdReturn = MONTHLY.reduce((a, m) => a + m.return, 0).toFixed(1);
  const ytdBenchmark = MONTHLY.reduce((a, m) => a + m.benchmark, 0).toFixed(1);

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="label-mono mb-1.5 md:mb-2">Performance</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
              Analytics
            </h1>
            <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
              Portfolio performance, agent efficiency, and system metrics.
            </p>
          </div>
          <Link href="/portfolio" className="btn btn-secondary btn-sm flex-shrink-0">
            View holdings →
          </Link>
        </div>
      </div>

      {/* Key metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">YTD Return</div>
          <div className={clsx("tabular-nums text-xl font-semibold md:text-2xl", parseFloat(ytdReturn) >= 0 ? "text-status-success" : "text-status-danger")}>
            +{ytdReturn}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">vs. S&P 500</div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">vs. Benchmark</div>
          <div className="tabular-nums text-xl font-semibold text-status-success md:text-2xl">
            +{(parseFloat(ytdReturn) - parseFloat(ytdBenchmark)).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">alpha</div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">Sharpe Ratio</div>
          <div className="tabular-nums text-xl font-semibold text-slate-100 md:text-2xl">
            1.42
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">risk-adjusted</div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">Max Drawdown</div>
          <div className="tabular-nums text-xl font-semibold text-status-danger md:text-2xl">
            -8.2%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">12-month</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly returns */}
        <div className="panel p-4 md:p-5">
          <div className="label-mono mb-4">Monthly Returns vs. S&P 500</div>
          <div className="flex h-[120px] items-end gap-2">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col gap-1">
                <div className="flex flex-1 items-end gap-0.5">
                  <div className="flex-1">
                    <Bar value={m.return} max={maxReturn} color="#6d8bff" height={100} />
                  </div>
                  <div className="flex-1 opacity-50">
                    <Bar value={m.benchmark} max={maxReturn} color="#5a6080" height={100} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-end justify-between gap-1">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 text-center font-mono text-[9px] text-slate-700">
                {m.month}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-3 rounded-full bg-accent" />
              <span className="font-mono text-[10px] text-slate-600">Portfolio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-3 rounded-full bg-slate-600" />
              <span className="font-mono text-[10px] text-slate-600">S&P 500</span>
            </div>
          </div>
        </div>

        {/* Risk metrics */}
        <div className="panel p-4 md:p-5">
          <div className="label-mono mb-4">Risk Metrics</div>
          <div className="space-y-3">
            {[
              { label: "Volatility (annualized)", value: "14.2%", comparison: "Index: 16.8%", good: true },
              { label: "Beta vs. S&P 500", value: "1.08", comparison: "Slightly above market", warn: true },
              { label: "Correlation to QQQ", value: "0.84", comparison: "High tech exposure", warn: true },
              { label: "Value at Risk (95%)", value: "$12,400/day", comparison: "1.5% of portfolio", good: false },
              { label: "Calmar Ratio", value: "1.95", comparison: "Return / Max Drawdown", good: true },
              { label: "Win rate (monthly)", value: "83%", comparison: "5 of 6 months positive", good: true },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-slate-400">{m.label}</div>
                  <div className="text-[10px] text-slate-700">{m.comparison}</div>
                </div>
                <div
                  className={clsx(
                    "flex-shrink-0 text-right font-mono text-[13px] font-semibold",
                    m.good ? "text-status-success" : m.warn ? "text-status-warning" : "text-slate-300",
                  )}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent performance */}
      <div className="panel p-4 md:p-5">
        <div className="label-mono mb-4">Agent System Performance</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_PERFORMANCE.map((a) => (
            <div key={a.agent} className="panel-tight p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-[12px] font-medium text-slate-300">{a.agent}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-mono text-[14px] font-semibold text-slate-100">{a.runs}</div>
                  <div className="label-mono mt-0.5">runs</div>
                </div>
                <div>
                  <div className="font-mono text-[14px] font-semibold text-status-success">{a.successRate}%</div>
                  <div className="label-mono mt-0.5">success</div>
                </div>
                <div className="col-span-2">
                  <div className="font-mono text-[12px] text-slate-500">{a.avgMs.toLocaleString()}ms avg</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
