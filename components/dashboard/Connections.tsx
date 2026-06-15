"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  error?: string;
}

type Bucket = "connected" | "ready" | "needs";

interface Service {
  key: string;
  name: string;
  detail: string;
  note: string;
  bucket: Bucket;
  probe: Probe;
  okLabel: (r: CheckResult) => string;
  action?: { label: string; href: string };
}

const BUCKETS: { id: Bucket; label: string; hint: string; dot: string }[] = [
  {
    id: "connected",
    label: "Connected",
    hint: "Live and verified",
    dot: "bg-emerald-400",
  },
  {
    id: "ready",
    label: "Ready to connect",
    hint: "One step away — connect now",
    dot: "bg-accent",
  },
  {
    id: "needs",
    label: "Needs to be connected",
    hint: "Requires configuration",
    dot: "bg-slate-500",
  },
];

// Connections cockpit: groups every integration into Connected / Ready to
// connect / Needs to be connected, and re-runs the real /api/health and
// /api/trading probes on demand so the whole stack is verifiable from here.
export function Connections() {
  const [health, setHealth] = useState<Health | null>(null);
  const [trading, setTrading] = useState<TradingStatus | null>(null);
  const [llmProbe, setLlmProbe] = useState<Probe>(null);
  const [memProbe, setMemProbe] = useState<Probe>(null);
  const [tradeProbe, setTradeProbe] = useState<Probe>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const loadStatus = useCallback(async () => {
    const [h, t] = await Promise.allSettled([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/trading").then((r) => r.json()),
    ]);
    if (h.status === "fulfilled") setHealth(h.value);
    if (t.status === "fulfilled") setTrading(t.value);
  }, []);

  const runChecks = useCallback(async () => {
    setChecking(true);
    setLlmProbe("loading");
    setMemProbe("loading");
    setTradeProbe("loading");
    const [llm, mem, trade] = await Promise.allSettled([
      fetch("/api/health?ping=1").then((r) => r.json()),
      fetch("/api/health?memory=1").then((r) => r.json()),
      fetch("/api/trading?probe=1").then((r) => r.json()),
    ]);
    setLlmProbe(llm.status === "fulfilled" ? llm.value : { ok: false, error: "request failed" });
    setMemProbe(mem.status === "fulfilled" ? mem.value : { ok: false, error: "request failed" });
    setTradeProbe(trade.status === "fulfilled" ? trade.value : { ok: false, error: "request failed" });
    await loadStatus();
    setCheckedAt(new Date());
    setChecking(false);
  }, [loadStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Return from the Robinhood OAuth flow → auto-run a fresh check.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("rh_connected") !== "1") return;
    params.delete("rh_connected");
    const qs = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    void runChecks();
  }, [runChecks]);

  const services = useMemo<Service[]>(() => {
    const llmLive = health ? !health.mock : false;
    const memLive = health?.memory === "supabase";
    const tradeLive = trading?.enabled ?? false;

    return [
      {
        key: "llm",
        name: "Language model",
        detail: health ? `${health.provider}${health.model ? ` · ${health.model}` : ""}` : "…",
        note: llmLive
          ? "Live model connected."
          : "Running in mock mode — add ANTHROPIC_API_KEY (or OPENAI_API_KEY) to go live.",
        bucket: llmLive ? "connected" : "ready",
        probe: llmProbe,
        okLabel: (r) => (r.live ? "reachable" : "ok"),
      },
      {
        key: "github",
        name: "GitHub",
        detail: "northstar-capital-superbase/superbase",
        note: "Repository connected — commits push to your branch.",
        bucket: "connected",
        probe: null,
        okLabel: () => "ok",
      },
      {
        key: "trading",
        name: "Robinhood Agentic",
        detail: tradeLive ? `agentic · ${trading?.mode ?? "auto"}` : "not configured",
        note: tradeLive
          ? `MCP live · $${trading?.maxOrderUsd ?? 100} cap per order.`
          : "OAuth opens Robinhood, then stores a local MCP token.",
        bucket: tradeLive ? "connected" : "ready",
        probe: tradeProbe,
        okLabel: (r) =>
          typeof r.toolCount === "number"
            ? `${r.toolCount} tool${r.toolCount !== 1 ? "s" : ""}`
            : "reachable",
        action: tradeLive ? undefined : { label: "Connect Robinhood", href: "/api/trading/oauth/start" },
      },
      {
        key: "memory",
        name: "Shared memory · Supabase",
        detail: memLive ? "Supabase · persistent" : "in-memory · process-local",
        note: memLive
          ? "Supabase connected — memory persists across runs."
          : "Set SUPABASE_URL + service-role key and apply schema.sql to persist.",
        bucket: memLive ? "connected" : "needs",
        probe: memProbe,
        okLabel: (r) => (r.persisted ? "persisted" : "ok"),
      },
    ];
  }, [health, trading, llmProbe, memProbe, tradeProbe]);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { connected: 0, ready: 0, needs: 0 };
    for (const s of services) c[s.bucket] += 1;
    return c;
  }, [services]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] via-base-850/50 to-base-900/60 p-5 shadow-glow backdrop-blur-md before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:content-['']">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-sm font-semibold text-transparent">
              Connections
            </span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              {counts.connected} connected
            </span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              {counts.ready} ready
            </span>
            {counts.needs > 0 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {counts.needs} pending
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {checkedAt
              ? `Last checked ${checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Connection status & live checks"}
          </p>
        </div>
        <button
          onClick={runChecks}
          disabled={checking}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-base-750/60 px-3 py-1.5 text-[12px] font-medium text-slate-200 transition hover:border-accent/50 hover:text-white disabled:opacity-60"
        >
          <RefreshIcon spin={checking} />
          {checking ? "Checking…" : "Refresh checks"}
        </button>
      </div>

      <div className="space-y-4">
        {BUCKETS.map((b) => {
          const items = services.filter((s) => s.bucket === b.id);
          if (items.length === 0) return null;
          return (
            <section key={b.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className={clsx("h-2 w-2 rounded-full", b.dot, b.id === "ready" && "animate-pulseSoft")} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  {b.label}
                </span>
                <span className="text-[10px] text-slate-600">{b.hint}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <ServiceTile key={s.key} service={s} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ServiceTile({ service }: { service: Service }) {
  const { bucket, probe } = service;
  const accent =
    bucket === "connected"
      ? "text-emerald-400"
      : bucket === "ready"
        ? "text-accent"
        : "text-slate-500";
  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-transparent p-3.5 transition duration-300",
        bucket === "connected"
          ? "hover:border-emerald-400/30 hover:shadow-[0_0_44px_-22px_rgba(52,211,153,0.7)]"
          : "hover:border-accent/40 hover:shadow-[0_0_44px_-22px_rgba(81,104,255,0.7)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-white">{service.name}</span>
        <span className={clsx("text-[10px] font-medium uppercase tracking-wide", accent)}>
          {bucket === "connected" ? "● live" : bucket === "ready" ? "○ ready" : "○ off"}
        </span>
      </div>
      <div className="mt-0.5 truncate text-[11px] text-slate-400" title={service.detail}>
        {service.detail}
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{service.note}</p>

      {service.action && (
        <a
          href={service.action.href}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent transition hover:bg-accent/20"
        >
          {service.action.label} →
        </a>
      )}

      {probe === "loading" && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-accent" />
          checking…
        </div>
      )}
      {probe && probe !== "loading" && (
        <div
          className={clsx(
            "mt-2 rounded-md px-2 py-1 text-[11px]",
            probe.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-500/10 text-red-300",
          )}
        >
          {probe.ok ? (
            <span>
              ✓ {service.okLabel(probe)}
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

function RefreshIcon({ spin }: { spin?: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spin ? "animate-spin" : undefined}
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9 M13.5 2v3h-3" />
    </svg>
  );
}

function truncate(s?: string): string {
  if (!s) return "failed";
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}
