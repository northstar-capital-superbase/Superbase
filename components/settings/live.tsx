"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyValue,
  Row,
  SettingsSection,
  StatusBadge,
  type StatusState,
} from "./controls";

interface Health {
  ok: boolean;
  provider: string | null;
  model: string | null;
  memory: "supabase" | "in-memory";
  configured: boolean;
}
interface MemoryProbe {
  ok: boolean;
  persisted?: boolean;
  ms?: number;
  error?: string;
}
interface TradingStatus {
  ok: boolean;
  enabled: boolean;
  mode?: string;
  maxOrderUsd?: number;
}

function activeSessionId(): string {
  try {
    const raw = localStorage.getItem("northstar.sessions.v1");
    if (raw) {
      const p = JSON.parse(raw) as { activeId?: string };
      if (p.activeId) return p.activeId;
    }
  } catch {
    /* ignore */
  }
  return "default";
}

function timeAgo(d: Date | null): string {
  if (!d) return "never";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const RefreshGlyph = ({ spin }: { spin?: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={spin ? "lx-spin" : undefined}
  >
    <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9 M13.5 2v3h-3" />
  </svg>
);

const MemGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 10h16M9 5v14" />
  </svg>
);
const PlugGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5" />
  </svg>
);

// ── Memory ───────────────────────────────────────────────────────────────────
export function MemorySettings() {
  const [health, setHealth] = useState<Health | null>(null);
  const [entries, setEntries] = useState<number | null>(null);
  const [state, setState] = useState<StatusState>("checking");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [testing, setTesting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/memory?sessionId=${activeSessionId()}&limit=500`);
      if (res.ok) setEntries((await res.json()).total ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const test = useCallback(async () => {
    setTesting(true);
    setState("checking");
    try {
      const res = await fetch("/api/health?memory=1");
      const data = (await res.json()) as Health & MemoryProbe;
      setHealth(data);
      setState(data.ok ? "ok" : "warn");
      setLastSync(new Date());
    } catch {
      setState("warn");
    } finally {
      setTesting(false);
      void loadEntries();
    }
  }, [loadEntries]);

  useEffect(() => {
    void test();
    void loadEntries();
  }, [test, loadEntries]);

  const clear = useCallback(async () => {
    if (!window.confirm("Clear all stored memory for the active lab? This cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await fetch(`/api/memory?sessionId=${activeSessionId()}`, { method: "DELETE" });
      await loadEntries();
    } finally {
      setClearing(false);
    }
  }, [loadEntries]);

  const backend = health
    ? health.memory === "supabase"
      ? "Supabase"
      : "Local (in-process)"
    : "…";
  const statusLabel =
    state === "checking"
      ? "Checking"
      : state === "ok"
        ? health?.memory === "supabase"
          ? "Operational · persistent"
          : "Operational · ephemeral"
        : "Degraded";

  return (
    <SettingsSection
      id="memory"
      title="Memory"
      description="Shared agent memory backend and its live status."
      icon={MemGlyph}
      actions={
        <button className="lx-btn" onClick={test} disabled={testing}>
          <RefreshGlyph spin={testing} />
          {testing ? "Testing…" : "Test connection"}
        </button>
      }
    >
      <KeyValue
        items={[
          { label: "Memory status", value: <StatusBadge state={state} label={statusLabel} /> },
          { label: "Backend type", value: backend },
          { label: "Entries stored", value: entries === null ? "…" : entries.toLocaleString() },
          { label: "Last sync", value: timeAgo(lastSync) },
        ]}
      />
      <Row
        title="Maintenance"
        description="Wipe the active lab's stored memory. Other labs are unaffected."
      >
        <div className="lx-btn-row">
          <button className="lx-btn" onClick={test} disabled={testing}>
            <RefreshGlyph spin={testing} /> Test
          </button>
          <button className="lx-btn lx-btn-danger" onClick={clear} disabled={clearing}>
            {clearing ? "Clearing…" : "Clear memory"}
          </button>
        </div>
      </Row>
    </SettingsSection>
  );
}

// ── Integrations ─────────────────────────────────────────────────────────────
type IntKey = "openai" | "anthropic" | "supabase" | "github";
interface ProbeResult {
  state: StatusState;
  msg?: string;
}

const INTEGRATIONS: { key: IntKey; name: string; testable: boolean }[] = [
  { key: "anthropic", name: "Anthropic", testable: true },
  { key: "openai", name: "OpenAI", testable: true },
  { key: "supabase", name: "Supabase", testable: true },
  { key: "github", name: "GitHub", testable: false },
];

export function IntegrationsSettings() {
  const [health, setHealth] = useState<Health | null>(null);
  const [checkedAt, setCheckedAt] = useState<Record<IntKey, Date | null>>({
    openai: null,
    anthropic: null,
    supabase: null,
    github: null,
  });
  const [probes, setProbes] = useState<Record<IntKey, ProbeResult | null>>({
    openai: null,
    anthropic: null,
    supabase: null,
    github: null,
  });
  const [busy, setBusy] = useState<IntKey | "all" | null>("all");

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) setHealth(await res.json());
    } catch {
      /* surfaced by status */
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadStatus();
      const now = new Date();
      setCheckedAt({ openai: now, anthropic: now, supabase: now, github: now });
      setBusy(null);
    })();
  }, [loadStatus]);

  // Derived status — never hardcoded; computed from live /api/health.
  const status = useMemo<Record<IntKey, { state: StatusState; label: string; detail: string }>>(() => {
    const provider = health?.provider ?? null;
    const configured = health?.configured ?? false;
    const memLive = health?.memory === "supabase";

    const providerRow = (key: "openai" | "anthropic") => {
      if (!health) return { state: "checking" as StatusState, label: "Checking", detail: "…" };
      if (provider === key) return { state: "ok" as StatusState, label: "Connected", detail: health.model ?? "active model" };
      if (configured) return { state: "off" as StatusState, label: "Standby", detail: "another provider is active" };
      return { state: "off" as StatusState, label: "Not configured", detail: "set the API key" };
    };

    return {
      anthropic: providerRow("anthropic"),
      openai: providerRow("openai"),
      supabase: !health
        ? { state: "checking", label: "Checking", detail: "…" }
        : memLive
          ? { state: "ok", label: "Connected", detail: "persistent memory" }
          : { state: "off", label: "Not configured", detail: "set SUPABASE_URL + key" },
      github: { state: "unknown", label: "Unverified", detail: "no in-app check" },
    };
  }, [health]);

  const refreshOne = useCallback(
    async (key: IntKey) => {
      setBusy(key);
      await loadStatus();
      setCheckedAt((p) => ({ ...p, [key]: new Date() }));
      setBusy(null);
    },
    [loadStatus],
  );

  const testOne = useCallback(async (key: IntKey) => {
    setBusy(key);
    setProbes((p) => ({ ...p, [key]: { state: "checking", msg: "testing…" } }));
    try {
      if (key === "supabase") {
        const r = (await (await fetch("/api/health?memory=1")).json()) as MemoryProbe;
        setProbes((p) => ({
          ...p,
          [key]: r.ok
            ? { state: "ok", msg: `✓ reachable${r.ms ? ` · ${r.ms}ms` : ""}` }
            : { state: "warn", msg: `✗ ${r.error ?? "failed"}` },
        }));
      } else if (key === "openai" || key === "anthropic") {
        const r = (await (await fetch("/api/health?ping=1")).json()) as Health & { ok: boolean; ms?: number; error?: string };
        const isActive = r.provider === key;
        setProbes((p) => ({
          ...p,
          [key]: isActive
            ? r.ok
              ? { state: "ok", msg: `✓ reachable${r.ms ? ` · ${r.ms}ms` : ""}` }
              : { state: "warn", msg: `✗ ${r.error ?? "failed"}` }
            : { state: "off", msg: "not the active provider" },
        }));
      } else {
        setProbes((p) => ({ ...p, [key]: { state: "unknown", msg: "no in-app check available" } }));
      }
    } catch {
      setProbes((p) => ({ ...p, [key]: { state: "warn", msg: "✗ request failed" } }));
    } finally {
      setCheckedAt((p) => ({ ...p, [key]: new Date() }));
      setBusy(null);
    }
  }, []);

  return (
    <SettingsSection
      id="integrations"
      title="Integrations"
      description="Connection status for the services Northstar relies on."
      icon={PlugGlyph}
      actions={
        <button className="lx-btn" onClick={() => INTEGRATIONS.forEach((i) => refreshOne(i.key))} disabled={busy !== null}>
          <RefreshGlyph spin={busy === "all"} /> Refresh all
        </button>
      }
    >
      <div className="lx-int-list">
        {INTEGRATIONS.map((it) => {
          const s = status[it.key];
          const probe = probes[it.key];
          return (
            <div key={it.key} className="lx-int">
              <div className="lx-int-main">
                <div className="lx-int-name">{it.name}</div>
                <div className="lx-int-meta">
                  <StatusBadge state={s.state} label={s.label} />
                  <span className="lx-int-detail">{s.detail}</span>
                </div>
                {probe?.msg && (
                  <div className={`lx-int-probe ${probe.state}`}>{probe.msg}</div>
                )}
              </div>
              <div className="lx-int-side">
                <span className="lx-int-time">checked {timeAgo(checkedAt[it.key])}</span>
                <div className="lx-btn-row">
                  <button
                    className="lx-btn lx-btn-sm"
                    onClick={() => refreshOne(it.key)}
                    disabled={busy !== null}
                    aria-label={`Refresh ${it.name}`}
                  >
                    <RefreshGlyph spin={busy === it.key} />
                  </button>
                  <button
                    className="lx-btn lx-btn-sm"
                    onClick={() => testOne(it.key)}
                    disabled={busy !== null || !it.testable}
                    title={it.testable ? "Run a live check" : "No in-app check available"}
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
