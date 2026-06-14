"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { RuntimeInfo, TradingInfo } from "@/components/shared";

const NAV = [
  { href: "/dashboard", label: "Dashboard", short: "D" },
  { href: "/trading", label: "Trading", short: "T" },
  { href: "/labs", label: "Labs", short: "L" },
  { href: "/agents", label: "Agents", short: "A" },
  { href: "/memory", label: "Memory", short: "M" },
];

export function Sidebar({
  runtime,
  trading,
}: {
  runtime: RuntimeInfo | null;
  trading: TradingInfo | null;
}) {
  const pathname = usePathname();
  const traderLive = trading?.traderInCrew ?? false;

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.04] bg-base-900/80 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-4 py-4">
        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-accent/15 shadow-glow-accent">
          <StarIcon />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold tracking-tight text-slate-100">
            Northstar
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
            OS · Labs
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2 py-3">
        <div className="label-mono mb-2 px-2">Navigation</div>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
                )}
              >
                <span className="font-mono text-[10px] w-3 text-center opacity-50">{item.short}</span>
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent opacity-75" />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pipeline legend */}
      <div className="border-t border-white/[0.04] px-4 py-3">
        <div className="label-mono mb-2">Pipeline</div>
        <ol className="space-y-1.5 text-[12px] text-slate-500">
          <li className="flex items-center gap-2">
            <Dot color="#6d8bff" /> Orchestrator
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#34d399" /> Research
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#a78bfa" /> Strategist
          </li>
          <li className="flex items-center gap-2">
            <Dot color="#fbbf24" /> Behavioral
          </li>
          {traderLive && (
            <li className="flex items-center gap-2">
              <Dot color="#22d3ee" /> Trader
            </li>
          )}
          <li className="flex items-center gap-2">
            <Dot color="#6d8bff" /> Synthesis
          </li>
        </ol>
      </div>

      {/* Runtime status */}
      <div className="mt-auto border-t border-white/[0.04] px-4 py-3">
        <div className="label-mono mb-2">Runtime</div>
        <div className="panel-tight space-y-1.5 p-2.5 text-[11px]">
          <Row label="Provider" value={runtime?.provider ?? "…"} />
          <Row label="Model" value={runtime?.model ?? "…"} />
          <Row
            label="Memory"
            value={runtime?.memory === "supabase" ? "Supabase" : "In-memory"}
          />
          <Row
            label="Robinhood"
            value={
              trading
                ? trading.enabled
                  ? "live"
                  : "advisory"
                : "…"
            }
          />
        </div>
        {runtime?.provider === "mock" && (
          <p className="mt-2 text-[10px] leading-relaxed text-slate-700">
            Mock mode — add ANTHROPIC_API_KEY for live models.
          </p>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-600">{label}</span>
      <span className="truncate font-mono text-slate-400" title={value}>
        {value}
      </span>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l1.8 5.8 5.8 1.2-4.8 3.8 1.8 5.8-4.6-3.2-4.6 3.2 1.8-5.8L3.4 9l5.8-1.2L12 2z"
        fill="currentColor"
        className="text-accent"
      />
    </svg>
  );
}
