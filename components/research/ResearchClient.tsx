"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

const TOPICS = [
  {
    id: "t1",
    title: "Semiconductor Supply Chain Normalization",
    agent: "Research",
    agentColor: "#34d399",
    summary: "Taiwan's TSMC reported capacity expansion ahead of schedule. Lead times for advanced nodes dropping from 52 to 38 weeks. Historically correlated with outperformance in semiconductor equipment names.",
    tags: ["Semiconductors", "Tech", "Supply Chain"],
    time: "Today, 6:45 AM",
    confidence: "High",
    status: "complete",
  },
  {
    id: "t2",
    title: "Energy Sector Rotation Signal",
    agent: "Strategist",
    agentColor: "#a78bfa",
    summary: "Cross-sector momentum model signals rotation from Tech (RSI > 72) into Energy (RSI 44, rising). XLE showing accumulation pattern over past 8 sessions. Consistent with late-cycle macro regime.",
    tags: ["Energy", "Macro", "Rotation"],
    time: "Today, 7:02 AM",
    confidence: "Medium",
    status: "complete",
  },
  {
    id: "t3",
    title: "Fed Rate Path — June Meeting Preview",
    agent: "Research",
    agentColor: "#34d399",
    summary: "CME FedWatch implies 82% probability of hold at next meeting. Key data points: PCE trending toward 2.3%, payrolls steady. Markets pricing first cut for Q4 2026. Duration sensitivity elevated for fixed-income holdings.",
    tags: ["Macro", "Fed", "Rates"],
    time: "Yesterday",
    confidence: "High",
    status: "complete",
  },
  {
    id: "t4",
    title: "Q2 Earnings Season — Coverage Preview",
    agent: "Research",
    agentColor: "#34d399",
    summary: "14 portfolio holdings report earnings this week. Watch: NVDA (Tue after close), MSFT (Wed after close). Consensus estimates revised higher for both. Behavioral agent flagged risk of buy-the-rumor-sell-the-news pattern.",
    tags: ["Earnings", "Portfolio"],
    time: "Yesterday",
    confidence: "Medium",
    status: "queued",
  },
];

const FILTERS = ["All", "Macro", "Tech", "Energy", "Earnings", "Portfolio"] as const;
type Filter = (typeof FILTERS)[number];

export function ResearchClient() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    activeFilter === "All"
      ? TOPICS
      : TOPICS.filter((t) => t.tags.includes(activeFilter));

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="label-mono mb-1.5 md:mb-2">Knowledge</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
              Research
            </h1>
            <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
              Intelligence gathered by agents — market signals, analysis, and context.
            </p>
          </div>
          <Link
            href="/labs"
            className="btn btn-secondary btn-sm flex-shrink-0"
          >
            Run research crew →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mb-6 md:gap-4">
        {[
          { label: "Reports", value: "4", color: "#34d399" },
          { label: "High Confidence", value: "2", color: "#6d8bff" },
          { label: "Pending", value: "1", color: "#fbbf24" },
          { label: "Topics Covered", value: "6", color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} className="panel p-3 md:p-4">
            <div className="label-mono mb-1">{s.label}</div>
            <div
              className="tabular-nums text-xl font-semibold md:text-2xl"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              "min-h-[34px] rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
              activeFilter === f
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-white/[0.06] text-slate-500 hover:border-white/10 hover:text-slate-300",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Research items */}
      <div className="space-y-3">
        {filtered.map((topic) => (
          <div
            key={topic.id}
            className="panel overflow-hidden transition-all duration-200"
          >
            <button
              className="w-full p-4 text-left md:p-5"
              onClick={() => setExpanded(expanded === topic.id ? null : topic.id)}
            >
              <div className="flex flex-wrap items-start gap-3">
                {/* Agent badge */}
                <div
                  className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg text-[11px] font-bold"
                  style={{
                    backgroundColor: `${topic.agentColor}18`,
                    color: topic.agentColor,
                  }}
                >
                  {topic.agent[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.12em]"
                      style={{ color: topic.agentColor }}
                    >
                      {topic.agent}
                    </span>
                    <span
                      className={clsx(
                        "badge",
                        topic.confidence === "High" ? "badge-success" : "badge-warning",
                      )}
                    >
                      {topic.confidence}
                    </span>
                    {topic.status === "queued" && (
                      <span className="badge badge-neutral">Queued</span>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-slate-700">
                      {topic.time}
                    </span>
                  </div>

                  <div className="mt-1 text-[14px] font-semibold text-slate-100">
                    {topic.title}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {expanded !== topic.id && (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                      {topic.summary}
                    </p>
                  )}
                </div>

                {/* Expand/collapse arrow */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className={clsx(
                    "mt-1 flex-shrink-0 text-slate-600 transition-transform duration-200",
                    expanded === topic.id && "rotate-180",
                  )}
                >
                  <path
                    d="M2 4.5l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>

            {/* Expanded content */}
            {expanded === topic.id && (
              <div className="border-t border-white/[0.04] px-4 py-4 md:px-5">
                <p className="text-[13px] leading-relaxed text-slate-400">
                  {topic.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/labs"
                    className="btn btn-secondary btn-sm"
                  >
                    Investigate in Labs →
                  </Link>
                  <Link
                    href="/trading"
                    className="btn btn-secondary btn-sm"
                  >
                    View Trading impact →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.06] px-6 py-12 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-700">
              No results for {activeFilter}
            </div>
            <button
              onClick={() => setActiveFilter("All")}
              className="mt-3 text-[12px] text-accent hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Empty state — no real data yet */}
      <div className="mt-6 flex items-start gap-2 rounded-lg border border-accent/10 bg-accent/5 px-3 py-2.5">
        <span className="status-dot mt-1 flex-shrink-0 bg-accent" />
        <span className="text-[11px] leading-relaxed text-slate-500">
          Research is populated when you run the crew from{" "}
          <Link href="/labs" className="text-accent hover:underline">
            Labs
          </Link>
          . Each Research agent output is stored here automatically.
        </span>
      </div>
    </div>
  );
}
