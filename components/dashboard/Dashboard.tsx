"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgentRoster } from "./AgentRoster";
import { Connections } from "./Connections";
import { Skeleton } from "@/components/ui";
import "./labs.css";
import {
  type AgentProfile,
  type RuntimeInfo,
  type TradingInfo,
} from "@/components/shared";

// Command Center — the main dashboard / landing area. It shows runtime status,
// connections, and the agent roster overview. The AI chat and shared memory
// live in the nested Lab Console (/labs/console), not here.
export function Dashboard() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [trading, setTrading] = useState<TradingInfo | null>(null);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d.agents ?? []);
        setRuntime(d.runtime ?? null);
        setTrading(d.trading ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      <header className="lx-topbar">
        <div className="lx-topbar-inner lx-topbar-inner--slim">
          <RuntimePills runtime={runtime} trading={trading} />
        </div>
      </header>

      <main className="lx-main">
        <div className="lx-head">
          <div>
            <h1 className="lx-title">Agent Operating System</h1>
            <p className="lx-sub">Command Center · multi-agent overview</p>
          </div>
          <Link href="/" className="lx-tour">
            ← Home
          </Link>
        </div>

        <Connections />

        {agents.length === 0 ? (
          <RosterSkeleton />
        ) : (
          <AgentRoster agents={agents} statuses={{}} />
        )}

        {/* Entry point to the AI chat (which owns shared memory + agents live) */}
        <Link href="/labs/console" className="lx-console-cta">
          <span className="lx-console-cta-icon" aria-hidden="true">
            <ChatGlyph />
          </span>
          <span className="lx-console-cta-main">
            <span className="lx-console-cta-title">Open Lab Console</span>
            <span className="lx-console-cta-sub">
              Orchestrated multi-agent chat — shared memory and live agent
              activity live here.
            </span>
          </span>
          <span className="lx-console-cta-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </main>
    </div>
  );
}

function RuntimePills({
  runtime,
  trading,
}: {
  runtime: RuntimeInfo | null;
  trading: TradingInfo | null;
}) {
  // Waking up: show quiet placeholders instead of misleading "off" states.
  if (!runtime) {
    return (
      <div className="lx-pills" aria-label="Checking runtime status">
        <Skeleton width={92} height={27} style={{ borderRadius: 999 }} />
        <Skeleton width={98} height={27} style={{ borderRadius: 999 }} className="opt" />
        <Skeleton width={88} height={27} style={{ borderRadius: 999 }} className="opt" />
      </div>
    );
  }
  const llmLive = runtime.configured;
  const memLive = runtime.memory === "supabase";
  const traderLive = trading?.traderInCrew ?? false;
  return (
    <div className="lx-pills">
      <span className="lx-pill" title={runtime.model ?? "model"}>
        <span className={`lx-dot ${llmLive ? "on" : "off"}`} />
        <b>{runtime.provider ?? "no model"}</b>
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${memLive ? "on" : "off"}`} />
        {memLive ? "Supabase" : "In-memory"}
      </span>
      <span className="lx-pill opt">
        <span className={`lx-dot ${traderLive ? "on" : "off"}`} />
        Trader {traderLive ? "live" : "off"}
      </span>
    </div>
  );
}

// Placeholder cards while /api/agents wakes the roster.
function RosterSkeleton() {
  return (
    <div className="lx-roster" aria-label="Waking the roster…" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lx-agent" aria-hidden="true">
          <div className="lx-agent-top">
            <Skeleton width={28} height={28} style={{ borderRadius: 9 }} />
            <Skeleton width={40} height={10} />
          </div>
          <Skeleton width="60%" height={13} style={{ marginTop: 14 }} />
          <Skeleton width="45%" height={10} style={{ marginTop: 6 }} />
          <Skeleton width="90%" height={10} style={{ marginTop: 10 }} />
          <Skeleton width="75%" height={10} style={{ marginTop: 5 }} />
        </div>
      ))}
    </div>
  );
}

function ChatGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
