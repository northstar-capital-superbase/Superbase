"use client";

import Link from "next/link";
import { PageHeader } from "@/components/os/PageHeader";

export function ResearchTerminal() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Research"
        title="Intelligence Terminal"
        description="Agent-generated research synthesis will appear here after crew runs. This surface is not yet active."
      />

      <div className="os-card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-base-800">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          >
            <path d="M9 12h6M9 16h6M9 8h3" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No research yet</p>
          <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-slate-500">
            Run a crew task in Labs. Research outputs are automatically written
            to shared memory and will surface here when this terminal is wired
            to live data.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/labs"
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-base-900 transition hover:bg-accent-soft"
          >
            Open Labs
          </Link>
          <Link
            href="/memory"
            className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-slate-200 transition hover:border-white/20"
          >
            Browse Memory
          </Link>
        </div>
      </div>
    </div>
  );
}
