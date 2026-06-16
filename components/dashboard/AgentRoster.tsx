"use client";

import clsx from "clsx";
import type { AgentProfile } from "@/components/shared";

export type AgentStatus = "idle" | "thinking" | "done";

// Grid of agent cards that animate as the workflow progresses.
export function AgentRoster({
  agents,
  statuses,
}: {
  agents: AgentProfile[];
  statuses: Record<string, AgentStatus>;
}) {
  return (
    <div className="lx-roster">
      {agents.map((a) => (
        <AgentCard key={a.id} agent={a} status={statuses[a.id] ?? "idle"} />
      ))}
    </div>
  );
}

function AgentCard({
  agent,
  status,
}: {
  agent: AgentProfile;
  status: AgentStatus;
}) {
  return (
    <div
      className={clsx("lx-agent", status === "thinking" && "busy")}
      style={{ ["--agent" as any]: agent.color } as React.CSSProperties}
    >
      <div className="lx-agent-top">
        <span
          className="lx-agent-badge"
          style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
        >
          {agent.name[0]}
        </span>
        <StatusPill status={status} color={agent.color} />
      </div>
      <div className="lx-agent-name">{agent.name}</div>
      <div className="lx-agent-role">{agent.role}</div>
      <p className="lx-agent-desc">{agent.description}</p>
    </div>
  );
}

function StatusPill({
  status,
  color,
}: {
  status: AgentStatus;
  color: string;
}) {
  if (status === "thinking") {
    return (
      <span className="lx-agent-pill" style={{ color }}>
        <span
          className="lx-dot lx-pulse"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        working
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="lx-agent-pill" style={{ color: "var(--text-3)" }}>
        done
      </span>
    );
  }
  return (
    <span className="lx-agent-pill" style={{ color: "var(--text-4)" }}>
      idle
    </span>
  );
}
