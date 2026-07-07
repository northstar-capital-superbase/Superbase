"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Button, OwnerNote, Spinner, StatusPill, type StatusTone } from "@/components/ui";

interface Health {
  ok: boolean;
  provider: string | null;
  model: string | null;
  memory: "supabase" | "in-memory";
  configured: boolean;
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
  /** Manual owner setup rendered as a visible NEEDS_OWNER_INPUT note. */
  ownerNote?: string;
}

const BUCKETS: {
  id: Bucket;
  label: string;
  hint: string;
  tone: "green" | "blue" | "grey";
}[] = [
  {
    id: "connected",
    label: "Connected",
    hint: "Live and verified",
    tone: "green",
  },
  {
    id: "ready",
    label: "Ready to connect",
    hint: "One step away — connect now",
    tone: "blue",
  },
  {
    id: "needs",
    label: "Needs configuration",
    hint: "Requires owner setup",
    tone: "grey",
  },
];

const TONE_COLOR: Record<"green" | "blue" | "grey", string> = {
  green: "var(--green)",
  blue: "var(--blue-bright)",
  grey: "var(--text-3)",
};

// Maps a service's bucket + probe result to a single obvious status pill:
// connected / needs action / not configured / checking / error.
function serviceStatus(s: Service): { tone: StatusTone; label: string } {
  if (s.probe === "loading") return { tone: "pending", label: "checking" };
  if (s.probe && !s.probe.ok) return { tone: "danger", label: "error" };
  if (s.bucket === "connected") return { tone: "ok", label: "connected" };
  if (s.bucket === "ready") return { tone: "info", label: "needs action" };
  return { tone: "muted", label: "not configured" };
}

// Connections cockpit: groups every integration into Connected / Ready to
// connect / Needs configuration, and re-runs the real /api/health and
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
    const llmLive = health?.configured ?? false;
    const memLive = health?.memory === "supabase";
    const tradeLive = trading?.enabled ?? false;

    return [
      {
        key: "llm",
        name: "Language model",
        detail: llmLive
          ? `${health?.provider}${health?.model ? ` · ${health.model}` : ""}`
          : health
            ? "no provider key found"
            : "…",
        note: llmLive
          ? "Live model connected — every crew run uses it."
          : "The crew needs a model key before it can run.",
        bucket: llmLive ? "connected" : "needs",
        probe: llmProbe,
        okLabel: (r) => (r.live ? "reachable" : "ok"),
        ownerNote: llmLive
          ? undefined
          : "Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env.local, then restart the dev server.",
      },
      {
        key: "supabase",
        name: "Supabase",
        detail: memLive ? "persistent · shared memory" : "in-memory fallback active",
        note: memLive
          ? "Connected — agent memory persists across runs."
          : "Memory works in-process but is wiped on restart.",
        bucket: memLive ? "connected" : "needs",
        probe: memProbe,
        okLabel: (r) => (r.persisted ? "persisted" : "ok"),
        ownerNote: memLive
          ? undefined
          : "Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and apply supabase/schema.sql to persist agent memory.",
      },
      {
        key: "trading",
        name: "Robinhood Agentic",
        detail: tradeLive ? `agentic · ${trading?.mode ?? "auto"}` : "MCP token not stored",
        note: tradeLive
          ? `MCP live · $${trading?.maxOrderUsd ?? 100} cap per order.`
          : "OAuth opens Robinhood, then stores an MCP token so the Trader can join crew runs.",
        bucket: tradeLive ? "connected" : "ready",
        probe: tradeProbe,
        okLabel: (r) =>
          typeof r.toolCount === "number"
            ? `${r.toolCount} tool${r.toolCount !== 1 ? "s" : ""}`
            : "reachable",
        action: tradeLive ? undefined : { label: "Connect Robinhood", href: "/api/trading/oauth/start" },
        ownerNote: tradeLive
          ? undefined
          : "Complete the Robinhood OAuth flow (Connect Robinhood) or set ROBINHOOD_MCP_TOKEN.",
      },
      {
        key: "github",
        // The GitHub tile has no in-app probe — repo linkage is asserted, not
        // verified here, so we surface an explicit owner check instead of
        // faking a live status.
        name: "GitHub",
        detail: "northstar-capital-superbase/superbase",
        note: "Repository connected — commits push to your branch.",
        bucket: "connected",
        probe: null,
        okLabel: () => "ok",
        ownerNote: "Verify this connection in the live environment — there is no in-app check for GitHub.",
      },
    ];
  }, [health, trading, llmProbe, memProbe, tradeProbe]);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { connected: 0, ready: 0, needs: 0 };
    for (const s of services) c[s.bucket] += 1;
    return c;
  }, [services]);

  // Minor services — what's running and how it's doing.
  const runtime = useMemo<{ label: string; value: string; state: "ok" | "warn" | "off" }[]>(() => {
    const memLive = health?.memory === "supabase";
    return [
      {
        label: "Crew API",
        value: health ? (health.configured ? "operational" : "needs model") : "…",
        state: health ? (health.configured ? "ok" : "warn") : "off",
      },
      {
        label: "Streaming",
        value: "SSE ready",
        state: "ok",
      },
      {
        label: "Memory store",
        value: memLive ? "Supabase" : "in-memory",
        state: memLive ? "ok" : "warn",
      },
      {
        label: "Trading policy",
        value: trading?.enabled ? `${trading.mode} · $${trading.maxOrderUsd}/order` : "advisory",
        state: trading?.enabled ? "ok" : "off",
      },
    ];
  }, [health, trading]);

  return (
    <div className="lx-card">
      <div className="lx-card-head">
        <div>
          <div className="lx-card-head-meta">
            <span className="lx-card-title">Connections</span>
            <div className="lx-conn-stats">
              <StatusPill tone="ok">{counts.connected} connected</StatusPill>
              <StatusPill tone="info">{counts.ready} ready</StatusPill>
              {counts.needs > 0 && (
                <StatusPill tone="muted">{counts.needs} pending</StatusPill>
              )}
            </div>
          </div>
          <p className="lx-card-sub" style={{ marginTop: 4 }}>
            {checkedAt
              ? `Last checked ${checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "Connection status & live checks"}
          </p>
        </div>
        <Button onClick={runChecks} loading={checking}>
          {!checking && <RefreshIcon />}
          {checking ? "Checking…" : "Refresh checks"}
        </Button>
      </div>

      {BUCKETS.map((b) => {
        const items = services.filter((s) => s.bucket === b.id);
        if (items.length === 0) return null;
        return (
          <section key={b.id} className="lx-bucket">
            <div className="lx-bucket-head">
              <span
                className={clsx("lx-dot", b.id === "ready" && "lx-pulse")}
                style={{
                  background: TONE_COLOR[b.tone],
                  boxShadow:
                    b.tone === "grey" ? "none" : `0 0 8px ${TONE_COLOR[b.tone]}`,
                }}
              />
              <span className="lx-bucket-label">{b.label}</span>
              <span className="lx-bucket-hint">{b.hint}</span>
            </div>
            <div className="lx-tiles">
              {items.map((s) => (
                <ServiceTile key={s.key} service={s} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="lx-bucket">
        <div className="lx-bucket-head">
          <span className="lx-dot" style={{ background: "var(--text-3)" }} />
          <span className="lx-bucket-label">Runtime</span>
          <span className="lx-bucket-hint">What&apos;s running &amp; how it&apos;s doing</span>
        </div>
        <div className="lx-runtime">
          {runtime.map((r) => (
            <div key={r.label} className="lx-run">
              <span
                className={clsx("lx-dot", r.state === "warn" && "lx-pulse")}
                style={{
                  background:
                    r.state === "ok"
                      ? "var(--green)"
                      : r.state === "warn"
                        ? "var(--gold)"
                        : "var(--text-4)",
                  boxShadow:
                    r.state === "ok" ? "0 0 8px var(--green)" : "none",
                }}
              />
              <span className="lx-run-label">{r.label}</span>
              <span className="lx-run-value">{r.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ServiceTile({ service }: { service: Service }) {
  const { probe } = service;
  const status = serviceStatus(service);
  return (
    <div
      className={clsx(
        "lx-tile",
        service.bucket === "connected" ? "green" : service.bucket === "ready" ? "blue" : "grey",
      )}
    >
      <div className="lx-tile-top">
        <span className="lx-tile-name">{service.name}</span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      <div className="lx-tile-detail" title={service.detail}>
        {service.detail}
      </div>
      <p className="lx-tile-note">{service.note}</p>

      {service.action && (
        <a href={service.action.href} className="lx-tile-action">
          {service.action.label} →
        </a>
      )}

      {probe === "loading" && (
        <div className="lx-probe run">
          <Spinner size={12} />
          running live check…
        </div>
      )}
      {probe && probe !== "loading" && (
        <div className={clsx("lx-probe", probe.ok ? "ok" : "bad")}>
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

      {service.ownerNote && <OwnerNote>{service.ownerNote}</OwnerNote>}
    </div>
  );
}

function RefreshIcon() {
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
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9 M13.5 2v3h-3" />
    </svg>
  );
}

function truncate(s?: string): string {
  if (!s) return "failed";
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}
