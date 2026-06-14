"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface Health {
  ok: boolean;
  provider: string;
  model: string;
  memory: "supabase" | "in-memory";
  mock: boolean;
}

interface TradingStatus {
  ok: boolean;
  enabled: boolean;
  mode?: string;
  maxOrderUsd?: number;
}

const SPARK_DATA = [82, 79, 85, 81, 88, 86, 91, 89, 94, 92, 97, 96, 99, 101, 98, 103, 102, 107];

function sparkPath(data: number[], width = 200, height = 48): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return `M${pts.join(" L")}`;
}

const ALLOCATION = [
  { label: "Tech", pct: 34, color: "#6d8bff" },
  { label: "Finance", pct: 22, color: "#a78bfa" },
  { label: "Energy", pct: 18, color: "#34d399" },
  { label: "Healthcare", pct: 14, color: "#fbbf24" },
  { label: "Other", pct: 12, color: "#5a6080" },
];

const AGENT_ACTIVITY = [
  {
    agent: "Research",
    color: "#34d399",
    action: "Completed sector analysis on semiconductor supply chains",
    time: "9 min ago",
  },
  {
    agent: "Strategist",
    color: "#a78bfa",
    action: "Identified rebalancing opportunity — Energy underweight by 3.2%",
    time: "22 min ago",
  },
  {
    agent: "Behavioral",
    color: "#fbbf24",
    action: "Flagged momentum bias — 2 positions exceed concentration limit",
    time: "41 min ago",
  },
  {
    agent: "Orchestrator",
    color: "#6d8bff",
    action: "Completed morning crew run · 3 agents · synthesis ready",
    time: "1 hr ago",
  },
];

const SIGNALS = [
  {
    title: "Sector Rotation Signal",
    body: "Tech-to-Energy rotation detected. Historical accuracy 73% in similar macro regimes.",
    tag: "MEDIUM CONVICTION",
    color: "#34d399",
    bg: "bg-status-success/5",
    border: "border-status-success/15",
  },
  {
    title: "Concentration Risk",
    body: "NVDA position at 8.4% of portfolio — above 7% soft limit. Consider trimming.",
    tag: "ACTION NEEDED",
    color: "#f87171",
    bg: "bg-status-danger/5",
    border: "border-status-danger/15",
  },
  {
    title: "Earnings Season",
    body: "14 holdings report this week. Research agent queued for pre-earnings analysis.",
    tag: "INFORMATIONAL",
    color: "#6d8bff",
    bg: "bg-accent/5",
    border: "border-accent/15",
  },
];

export function DashboardClient() {
  const [health, setHealth] = useState<Health | null>(null);
  const [trading, setTrading] = useState<TradingStatus | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
    fetch("/api/trading")
      .then((r) => r.json())
      .then(setTrading)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const provider = health?.provider ?? "…";
  const isLive = health ? !health.mock : false;
  const tradingLive = trading?.enabled ?? false;

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* ── Page Header ── */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="label-mono mb-1.5 md:mb-2">{dateStr}</div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
              {greeting()}
            </h1>
            <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
              Your autonomous finance operating system.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx("status-dot-lg", isLive ? "status-live" : "status-idle")} />
            <span className="font-mono text-[11px] text-slate-500">
              {isLive ? `${provider} · live` : "mock mode"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 1: Key Metrics ── */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
        {/* Portfolio value — main card */}
        <div className="panel p-4 md:p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="label-mono mb-1.5">Portfolio Value</div>
              <div className="tabular-nums text-[2rem] font-semibold leading-none tracking-tight text-slate-100 md:text-[2.5rem]">
                $847,293
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="stat-delta-positive">↑ $12,841 (1.54%)</span>
                <span className="text-[12px] text-slate-600">today</span>
              </div>
            </div>
            <div className="text-right">
              <div className="label-mono mb-1">All-time</div>
              <div className="text-sm font-semibold text-status-success">+$194,847</div>
              <div className="mt-0.5 text-[11px] text-slate-600">+29.9%</div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="relative mt-2">
            <svg viewBox="0 0 200 48" className="h-10 w-full md:h-12" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d8bff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6d8bff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${sparkPath(SPARK_DATA)} L200,48 L0,48 Z`} fill="url(#spark-fill)" />
              <path
                d={sparkPath(SPARK_DATA)}
                stroke="#6d8bff"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between">
              <span className="font-mono text-[9px] text-slate-700">18d ago</span>
              <span className="font-mono text-[9px] text-slate-700">today</span>
            </div>
          </div>

          {/* Allocation bar */}
          <div className="mt-4 border-t border-white/[0.04] pt-4">
            <div className="label-mono mb-2">Allocation</div>
            <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
              {ALLOCATION.map((a) => (
                <div
                  key={a.label}
                  style={{ width: `${a.pct}%`, backgroundColor: a.color }}
                  className="rounded-full opacity-80"
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 md:gap-x-4">
              {ALLOCATION.map((a) => (
                <div key={a.label} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: a.color }} />
                  <span className="font-mono text-[10px] text-slate-500">{a.label}</span>
                  <span className="font-mono text-[10px] text-slate-400">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Agent system */}
          <div className="panel flex-1 p-4">
            <div className="label-mono mb-3">Agent System</div>
            <div className="space-y-2.5">
              {[
                { id: "orchestrator", label: "Orchestrator", color: "#6d8bff", status: "active" },
                { id: "research", label: "Research", color: "#34d399", status: "idle" },
                { id: "strategist", label: "Strategist", color: "#a78bfa", status: "idle" },
                { id: "behavioral", label: "Behavioral", color: "#fbbf24", status: "idle" },
                ...(tradingLive
                  ? [{ id: "trader", label: "Trader", color: "#22d3ee", status: "standby" }]
                  : []),
              ].map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-[12px] text-slate-400">{a.label}</span>
                  </div>
                  <span
                    className={clsx(
                      "font-mono text-[10px]",
                      a.status === "active"
                        ? "text-status-success"
                        : a.status === "standby"
                          ? "text-signal-trader"
                          : "text-slate-700",
                    )}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-white/[0.04] pt-3">
              <a
                href="/labs"
                className="flex min-h-[36px] items-center gap-1.5 text-[11px] text-slate-600 transition-colors hover:text-accent"
              >
                Open Lab Console
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Connections */}
          <div className="panel p-4">
            <div className="label-mono mb-3">Connections</div>
            <div className="space-y-2">
              <ConnectionRow label="LLM" value={provider} live={isLive} />
              <ConnectionRow
                label="Memory"
                value={health?.memory === "supabase" ? "Supabase" : "In-process"}
                live={health?.memory === "supabase"}
              />
              <ConnectionRow
                label="Robinhood"
                value={tradingLive ? "Agentic" : "Not connected"}
                live={tradingLive}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Activity + Signals ── */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[1fr_340px]">
        {/* Agent activity feed */}
        <div className="panel p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="label-mono">Agent Activity</div>
            <a href="/labs" className="text-[11px] text-slate-600 hover:text-accent transition-colors">
              View all →
            </a>
          </div>
          <div className="space-y-0">
            {AGENT_ACTIVITY.map((item, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-white/[0.04] py-3 last:border-0 last:pb-0 first:pt-0"
              >
                <div
                  className="mt-0.5 h-6 w-6 flex-shrink-0 grid place-items-center rounded-md text-[10px] font-bold"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.agent[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: item.color }}
                    >
                      {item.agent}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-slate-700">{item.time}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence signals */}
        <div className="panel p-4 md:p-5">
          <div className="label-mono mb-4">Intelligence</div>
          <div className="space-y-3">
            {SIGNALS.map((s, i) => (
              <div key={i} className={clsx("rounded-lg border p-3", s.bg, s.border)}>
                <div className="mb-1 flex flex-wrap items-start gap-2">
                  <span className="text-[12px] font-medium" style={{ color: s.color }}>
                    {s.title}
                  </span>
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                    style={{ color: s.color, backgroundColor: `${s.color}15` }}
                  >
                    {s.tag}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Quick Actions ── */}
      <div className="panel p-4 md:p-5">
        <div className="label-mono mb-4">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: "Morning Briefing", desc: "Run the full crew", href: "/labs", color: "#6d8bff" },
            { label: "Portfolio Review", desc: "Analyze holdings", href: "/trading", color: "#34d399" },
            { label: "Market Research", desc: "Scan opportunities", href: "/labs", color: "#a78bfa" },
            { label: "Risk Check", desc: "Behavioral analysis", href: "/labs", color: "#fbbf24" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group min-h-[72px] rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] active:bg-white/[0.06]"
            >
              <div
                className="mb-2 h-1 w-6 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: action.color }}
              />
              <div className="text-[12px] font-medium text-slate-300 md:text-[13px]">
                {action.label}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-600 md:text-[11px]">{action.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Mock mode notice */}
      {!isLive && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-status-warning/10 bg-status-warning/5 px-3 py-2.5">
          <span className="status-warn mt-1 flex-shrink-0" />
          <span className="text-[11px] leading-relaxed text-status-warning/80">
            Running in mock mode — add{" "}
            <code className="font-mono text-[10px]">ANTHROPIC_API_KEY</code> for live agents and real data.
          </span>
        </div>
      )}
    </div>
  );
}

function ConnectionRow({ label, value, live }: { label: string; value: string; live: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[12px] text-slate-600">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={clsx("h-1.5 w-1.5 flex-shrink-0 rounded-full", live ? "bg-status-success" : "bg-slate-700")} />
        <span className="truncate font-mono text-[11px] text-slate-400">{value}</span>
      </div>
    </div>
  );
}
