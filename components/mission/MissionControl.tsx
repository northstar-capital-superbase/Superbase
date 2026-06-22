"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/os/PageHeader";
import { MetricCard } from "@/components/os/MetricCard";
import { StatusBadge } from "@/components/os/StatusBadge";
import { AgentCard } from "@/components/os/AgentCard";
import { ActivityFeed, type ActivityItem } from "@/components/os/ActivityFeed";
import { Timeline, type TimelineEvent } from "@/components/os/Timeline";
import { Skeleton } from "@/components/os/Skeleton";
import { useSessions } from "@/components/session/useSessions";
import type { AgentProfile, MemoryEntry, TradingInfo } from "@/components/shared";

interface Health {
  ok: boolean;
  provider: string;
  model: string;
  memory: string;
  mock: boolean;
}

export function MissionControl() {
  const { activeId } = useSessions();
  const [health, setHealth] = useState<Health | null>(null);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [trading, setTrading] = useState<TradingInfo | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, a, m] = await Promise.all([
          fetch("/api/health").then((r) => r.json()),
          fetch("/api/agents").then((r) => r.json()),
          fetch(`/api/memory?sessionId=${activeId}&limit=20`).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setHealth(h);
        setAgents(a.agents ?? []);
        setTrading(a.trading ?? null);

        const entries: MemoryEntry[] = m.entries ?? [];
        setActivity(
          entries.slice(-12).reverse().map((e) => ({
            id: e.id,
            title: `${e.author} · ${e.kind}`,
            detail: e.content.slice(0, 120),
            time: new Date(e.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            author: e.author,
            kind: e.kind,
          })),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const timeline: TimelineEvent[] = activity.slice(0, 6).map((a) => ({
    id: a.id,
    label: a.title,
    detail: a.detail,
    time: a.time,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Mission Control"
        title="System Overview"
        description="Capital, agents, research, and execution — understand the entire Northstar OS at a glance."
        actions={
          <Link
            href="/labs"
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-base-900 transition hover:bg-accent-soft"
          >
            Run crew
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard
            label="LLM"
            value={health?.provider ?? "—"}
            sub={health?.model}
            delta={{
              text: health?.mock ? "mock mode" : "live",
              positive: health?.mock ? false : true,
            }}
          />
          <MetricCard
            label="Memory"
            value={health?.memory === "supabase" ? "Supabase" : "Local"}
            sub={health?.memory === "supabase" ? "persisted" : "in-process"}
          />
          <MetricCard
            label="Trading"
            value={trading?.enabled ? "Live" : "Offline"}
            sub={trading?.mode ?? "advisory"}
            delta={{
              text: trading?.traderInCrew ? "Trader active" : "no token",
              positive: trading?.enabled,
            }}
          />
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">System Status</h2>
          <StatusBadge tone={health?.mock ? "warn" : "ok"}>
            {agents.length} agents
          </StatusBadge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-36" />
              ))
            : agents.map((a) => (
                <AgentCard
                  key={a.id}
                  agent={a}
                  status={
                    a.id === "trader" && !trading?.enabled ? "offline" : "idle"
                  }
                  compact
                />
              ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed items={activity} empty="Run a task in Labs to populate activity." />
        <Timeline events={timeline} />
      </div>

      <section className="os-card p-4">
        <h2 className="text-sm font-semibold text-white">Knowledge Base</h2>
        <p className="mt-1 text-[12px] text-slate-500">
          Agent outputs are written to shared memory after every crew run. Browse
          the full timeline in{" "}
          <Link href="/memory" className="text-accent hover:underline">
            Memory
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
