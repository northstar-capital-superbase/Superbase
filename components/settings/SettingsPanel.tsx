"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/os/PageHeader";
import { StatusBadge } from "@/components/os/StatusBadge";
import Link from "next/link";

export function SettingsPanel() {
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [trading, setTrading] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/trading").then((r) => r.json()),
    ]).then(([h, t]) => {
      setHealth(h);
      setTrading(t);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Environment"
        description="Runtime configuration — set secrets in .env.local or your deploy host."
      />

      <div className="os-card divide-y divide-white/5">
        {[
          { label: "LLM provider", value: String(health?.provider ?? "…") },
          { label: "Model", value: String(health?.model ?? "…") },
          { label: "Mock mode", value: health?.mock ? "yes" : "no" },
          { label: "Memory backend", value: String(health?.memory ?? "…") },
          { label: "Trading mode", value: String(trading?.mode ?? "…") },
          { label: "Robinhood MCP", value: trading?.enabled ? "connected" : "offline" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-[13px] text-slate-400">{row.label}</span>
            <span className="font-mono text-[12px] text-slate-200">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="os-card p-4">
        <h3 className="text-sm font-semibold text-white">Documentation</h3>
        <ul className="mt-2 space-y-2 text-[13px] text-slate-500">
          <li>
            <Link href="/integrations" className="text-accent hover:underline">
              Integrations & diagnostics
            </Link>
          </li>
          <li>See <code className="text-[11px]">docs/TRADING.md</code> for Robinhood setup</li>
          <li>See <code className="text-[11px]">.env.example</code> for all variables</li>
        </ul>
        <div className="mt-3">
          <StatusBadge tone="idle">Secrets are never shown in the UI</StatusBadge>
        </div>
      </div>
    </div>
  );
}
