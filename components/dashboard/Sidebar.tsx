"use client";

import type { RuntimeInfo } from "@/components/shared";

// Left rail: brand, runtime status, and a quick legend of the lab's pipeline.
export function Sidebar({ runtime }: { runtime: RuntimeInfo | null }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-6 border-r border-white/5 bg-base-850/60 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent shadow-glow">
          <StarIcon />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-white">
            Northstar Labs
          </div>
          <div className="text-[11px] text-slate-500">Multi-Agent OS</div>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Pipeline</SectionLabel>
        <ol className="space-y-1.5 text-[13px] text-slate-400">
          <li className="flex items-center gap-2">
            <Dot color="#6d8bff" /> Orchestrator plans
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#34d399" /> Research gathers
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#c084fc" /> Strategist sequences
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#fbbf24" /> Behavioral checks
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#6d8bff" /> Orchestrator synthesizes
          </li>
        </ol>
      </div>

      <div className="mt-auto space-y-2">
        <SectionLabel>Runtime</SectionLabel>
        <div className="panel-tight space-y-2 p-3 text-[12px]">
          <Row label="Model provider" value={runtime?.provider ?? "…"} />
          <Row label="Model" value={runtime?.model ?? "…"} />
          <Row
            label="Memory"
            value={runtime?.memory === "supabase" ? "Supabase" : "In-memory"}
          />
        </div>
        <p className="px-1 text-[11px] leading-relaxed text-slate-600">
          {runtime?.provider === "mock"
            ? "Mock mode — add an API key in .env.local for live models."
            : "Live model connected."}
        </p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="truncate font-mono text-slate-300" title={value}>
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
      {children}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}
