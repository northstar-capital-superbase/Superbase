"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { AgentProfile, TradingInfo } from "@/components/shared";
import { AGENT_META } from "@/components/shared";

const AGENT_DETAILS: Record<
  string,
  { capabilities: string[]; lastRun?: string; runsToday: number; tokensUsed: number }
> = {
  orchestrator: {
    capabilities: ["Task planning", "Agent coordination", "Synthesis", "Memory routing"],
    lastRun: "1 hr ago",
    runsToday: 4,
    tokensUsed: 12_400,
  },
  research: {
    capabilities: ["Market analysis", "Sector research", "News synthesis", "Data retrieval"],
    lastRun: "1 hr ago",
    runsToday: 4,
    tokensUsed: 28_100,
  },
  strategist: {
    capabilities: ["Portfolio strategy", "Rebalancing", "Opportunity sequencing", "Risk-return optimization"],
    lastRun: "1 hr ago",
    runsToday: 4,
    tokensUsed: 19_800,
  },
  behavioral: {
    capabilities: ["Bias detection", "Emotion analysis", "Concentration limits", "Risk profiling"],
    lastRun: "1 hr ago",
    runsToday: 4,
    tokensUsed: 9_200,
  },
  trader: {
    capabilities: ["Order execution", "Robinhood MCP", "Order sizing", "Confirmation logic"],
    lastRun: "Not deployed",
    runsToday: 0,
    tokensUsed: 0,
  },
};

export function AgentsClient() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [trading, setTrading] = useState<TradingInfo | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setTrading(d.trading ?? null);
      })
      .catch(() => {});
  }, []);

  const traderLive = trading?.traderInCrew ?? false;

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="label-mono mb-2">Workforce</div>
        <h1 className="text-heading-xl font-semibold tracking-tight text-slate-100">
          Agents
        </h1>
        <p className="mt-1 text-body-md text-slate-500">
          Specialized intelligence — each agent owns a domain of expertise.
        </p>
      </div>

      {/* Pipeline diagram */}
      <div className="panel mb-6 p-5">
        <div className="label-mono mb-4">Pipeline Execution Order</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["orchestrator", "research", "strategist", "behavioral", ...(traderLive ? ["trader"] : [])].map(
            (id, i, arr) => {
              const meta = AGENT_META[id as keyof typeof AGENT_META];
              return (
                <div key={id} className="flex flex-shrink-0 items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="grid h-9 w-9 place-items-center rounded-xl text-[13px] font-bold"
                      style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                    >
                      {meta.label[0]}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                      {meta.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <svg width="20" height="12" viewBox="0 0 20 12" className="flex-shrink-0 text-slate-700">
                      <path d="M0 6h16M12 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                </div>
              );
            },
          )}
          <div className="ml-2 flex flex-shrink-0 items-center gap-2">
            <svg width="20" height="12" viewBox="0 0 20 12" className="text-slate-700">
              <path d="M0 6h16M12 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="flex flex-col items-center gap-1.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-[13px] font-bold text-accent">
                S
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                Synthesis
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => {
          const meta = AGENT_META[agent.id];
          const detail = AGENT_DETAILS[agent.id] ?? {
            capabilities: [],
            runsToday: 0,
            tokensUsed: 0,
          };
          const isTraderDeployed = agent.id === "trader" && traderLive;
          const isTrader = agent.id === "trader";

          return (
            <div
              key={agent.id}
              className={clsx(
                "panel relative overflow-hidden p-5 transition-all duration-300",
                isTrader && !traderLive && "opacity-50",
              )}
            >
              {/* Color accent bar */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ backgroundColor: meta.color, opacity: isTrader && !traderLive ? 0.3 : 1 }}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl text-base font-bold"
                    style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                  >
                    {meta.label[0]}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-100">{agent.name}</div>
                    <div className="text-[11px] text-slate-500">{agent.role}</div>
                  </div>
                </div>
                <div>
                  {isTrader ? (
                    <span
                      className={clsx(
                        "badge",
                        traderLive ? "badge-success" : "badge-neutral",
                      )}
                    >
                      {traderLive ? "live" : "offline"}
                    </span>
                  ) : (
                    <span className="badge badge-success">active</span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
                {agent.description}
              </p>

              {/* Capabilities */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {detail.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="rounded-sm border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-500"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-4">
                <div>
                  <div className="font-mono text-[11px] text-slate-400">{detail.runsToday}</div>
                  <div className="label-mono mt-0.5">runs today</div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {detail.tokensUsed > 0 ? `${(detail.tokensUsed / 1000).toFixed(1)}k` : "—"}
                  </div>
                  <div className="label-mono mt-0.5">tokens</div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-slate-400">{detail.lastRun ?? "—"}</div>
                  <div className="label-mono mt-0.5">last run</div>
                </div>
              </div>

              {isTrader && !traderLive && (
                <div className="mt-3 rounded-lg border border-status-warning/15 bg-status-warning/5 px-3 py-2 text-[11px] text-status-warning/80">
                  Connect Robinhood to deploy Trader agent
                </div>
              )}
            </div>
          );
        })}

        {agents.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-white/[0.06] px-6 py-10 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-700">
              Loading agents…
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-6 text-[12px] text-slate-700">
        Open <a href="/labs" className="text-accent hover:underline">Labs</a> to run the agent crew with a custom task.
      </div>
    </div>
  );
}
