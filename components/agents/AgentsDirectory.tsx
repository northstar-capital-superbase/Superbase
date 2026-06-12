"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/os/PageHeader";
import { AgentCard } from "@/components/os/AgentCard";
import { Skeleton } from "@/components/os/Skeleton";
import type { AgentProfile, TradingInfo } from "@/components/shared";

const CAPABILITIES: Record<string, string[]> = {
  orchestrator: ["Planning", "Delegation", "Synthesis", "Memory writes"],
  research: ["Fact gathering", "Constraints", "Unknowns", "Context"],
  strategist: ["Sequencing", "Roadmaps", "Trade-offs", "Priorities"],
  behavioral: ["Bias checks", "Risk framing", "Decision quality"],
  trader: ["Portfolio read", "Order review", "MCP execution", "Policy caps"],
};

export function AgentsDirectory() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [trading, setTrading] = useState<TradingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setTrading(d.trading ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Agents"
        title="Agent Roster"
        description="Specialized autonomous agents — each with a distinct role in the Northstar crew."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))
          : agents.map((agent) => (
              <div key={agent.id} className="flex flex-col gap-3">
                <AgentCard
                  agent={agent}
                  status={
                    agent.id === "trader" && !trading?.enabled
                      ? "offline"
                      : "idle"
                  }
                />
                <ul className="os-card flex flex-wrap gap-2 p-3">
                  {(CAPABILITIES[agent.id] ?? []).map((cap) => (
                    <li
                      key={cap}
                      className="rounded-full border border-white/5 px-2.5 py-0.5 text-[10px] text-slate-400"
                    >
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
      </div>
    </div>
  );
}
