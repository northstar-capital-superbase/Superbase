"use client";

import { useCallback, useEffect, useState } from "react";
import { Integrations } from "@/components/dashboard/Integrations";
import type { RuntimeInfo, TradingInfo } from "@/components/shared";

export function DeveloperPanel() {
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [trading, setTrading] = useState<TradingInfo | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) return;
      const d = await res.json();
      setRuntime(d.runtime ?? null);
      setTrading(d.trading ?? null);
    } catch {
      /* surfaced in integrations */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const traderLive = trading?.traderInCrew ?? false;

  return (
    <div className="settings-dev-stack">
      <section className="settings-runtime-card">
        <span className="ns-eyebrow">Runtime configuration</span>
        <h2 className="settings-section-title">Environment</h2>
        <p className="settings-section-lede">
          Model provider, memory backend, and trading policy — for operators and
          developers only.
        </p>

        <dl className="settings-runtime-grid">
          <RuntimeRow label="Model provider" value={runtime?.provider ?? "…"} />
          <RuntimeRow label="Model" value={runtime?.model ?? "…"} />
          <RuntimeRow
            label="Memory"
            value={
              runtime?.memory === "supabase" ? "Supabase (persistent)" : "In-memory"
            }
          />
          <RuntimeRow
            label="Robinhood MCP"
            value={
              trading
                ? trading.enabled
                  ? `Live · ${trading.mode}`
                  : "Not configured"
                : "…"
            }
          />
          {traderLive && trading && (
            <RuntimeRow
              label="Order policy"
              value={`$${trading.maxOrderUsd} cap · ${trading.maxOrdersPerRun} orders / run`}
            />
          )}
        </dl>

        <p className="settings-runtime-note">
          {runtime?.provider === "mock"
            ? "Mock mode — add ANTHROPIC_API_KEY for live models."
            : traderLive
              ? "Trader joins every crew run when ROBINHOOD_MCP_TOKEN is set."
              : "Live model connected. Trading requires ROBINHOOD_MCP_TOKEN."}
        </p>
      </section>

      <section className="settings-integrations-wrap">
        <span className="ns-eyebrow">Developer</span>
        <h2 className="settings-section-title">Integrations & diagnostics</h2>
        <p className="settings-section-lede" style={{ marginBottom: 18 }}>
          LLM reachability, memory persistence, Robinhood MCP, and GitHub status.
        </p>
        <Integrations />
      </section>
    </div>
  );
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="settings-runtime-row">
      <dt>{label}</dt>
      <dd title={value}>{value}</dd>
    </div>
  );
}
