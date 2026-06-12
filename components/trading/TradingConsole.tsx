"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/os/PageHeader";
import { MetricCard } from "@/components/os/MetricCard";
import { StatusBadge } from "@/components/os/StatusBadge";
import { Skeleton } from "@/components/os/Skeleton";
import type { TradingInfo } from "@/components/shared";

export function TradingConsole() {
  const [trading, setTrading] = useState<TradingInfo | null>(null);
  const [probe, setProbe] = useState<{ ok: boolean; toolCount?: number; error?: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [status, probeRes] = await Promise.all([
          fetch("/api/trading").then((r) => r.json()),
          fetch("/api/trading?probe=1").then((r) => r.json()),
        ]);
        setTrading(status);
        setProbe(probeRes);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Trading"
        title="Agentic Execution"
        description="Institutional-grade portfolio view powered by the Trader agent and Robinhood MCP."
        actions={
          !trading?.enabled ? (
            <Link
              href="/integrations"
              className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-[13px] font-medium text-accent"
            >
              Connect
            </Link>
          ) : (
            <StatusBadge tone="live">MCP connected</StatusBadge>
          )
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Mode" value={trading?.mode ?? "—"} sub="TRADING_MODE" />
            <MetricCard
              label="Order cap"
              value={`$${trading?.maxOrderUsd ?? 100}`}
              sub="per order"
            />
            <MetricCard
              label="Run cap"
              value={String(trading?.maxOrdersPerRun ?? 3)}
              sub="orders / run"
            />
            <MetricCard
              label="MCP tools"
              value={probe?.ok ? String(probe.toolCount ?? 0) : "—"}
              sub={probe?.ok ? "available" : "not connected"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {["Portfolio", "Positions", "Orders", "Risk"].map((section) => (
              <div key={section} className="os-card p-4">
                <h3 className="text-sm font-semibold text-white">{section}</h3>
                <p className="mt-2 text-[12px] text-slate-500">
                  {trading?.enabled
                    ? `Live ${section.toLowerCase()} data via Robinhood MCP read tools.`
                    : "Connect Robinhood MCP to load live data."}
                </p>
                {!trading?.enabled && probe?.error && (
                  <p className="mt-2 text-[11px] text-amber-200/80">{probe.error}</p>
                )}
              </div>
            ))}
          </div>

          <div className="os-card border-accent/20 bg-accent/5 p-4">
            <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
            <p className="mt-1 text-[12px] text-slate-400">
              Run the Trader in{" "}
              <Link href="/labs" className="text-accent hover:underline">
                Labs
              </Link>{" "}
              with <code className="text-[11px]">TRADING_MODE=advisory</code> for
              read-only portfolio analysis.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
