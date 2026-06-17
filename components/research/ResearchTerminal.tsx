"use client";

import { PageHeader } from "@/components/os/PageHeader";
import { StatusBadge } from "@/components/os/StatusBadge";
import Link from "next/link";

const REPORTS = [
  {
    title: "Macro regime snapshot",
    source: "Research agent",
    time: "2h ago",
    excerpt: "Rates, liquidity, and cross-asset correlations heading into FOMC week.",
  },
  {
    title: "Portfolio concentration review",
    source: "Strategist",
    time: "Yesterday",
    excerpt: "Top-5 weights vs policy bands; rebalance triggers flagged.",
  },
  {
    title: "Behavioral risk check",
    source: "Behavioral",
    time: "Yesterday",
    excerpt: "Recency bias elevated after momentum run — sizing discipline recommended.",
  },
];

export function ResearchTerminal() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Research"
        title="Intelligence Terminal"
        description="Market reports, agent insights, and saved research — institutional-grade context for decisions."
        actions={
          <Link
            href="/labs"
            className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-slate-200 hover:border-accent/40"
          >
            Generate in Labs
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {["All", "Market", "Portfolio", "Agents", "Saved"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={
              i === 0
                ? "rounded-full bg-accent/15 px-3 py-1 text-[12px] text-accent ring-1 ring-accent/30"
                : "rounded-full border border-white/5 px-3 py-1 text-[12px] text-slate-500"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {REPORTS.map((r) => (
          <article key={r.title} className="os-card p-4 transition hover:border-white/10">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge tone="idle" dot={false}>
                {r.source}
              </StatusBadge>
              <span className="font-mono text-[10px] text-slate-600">{r.time}</span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{r.title}</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{r.excerpt}</p>
          </article>
        ))}
      </div>

      <div className="os-card p-4">
        <h3 className="text-sm font-semibold text-white">Knowledge Library</h3>
        <p className="mt-1 text-[12px] text-slate-500">
          Crew outputs are persisted to shared memory. Browse the full timeline in{" "}
          <Link href="/memory" className="text-accent hover:underline">
            Memory
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
