"use client";

import clsx from "clsx";
import type { AgentProfile } from "./shared";

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
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
      className={clsx(
        "panel relative overflow-hidden p-4 transition-all duration-300",
        status === "thinking" && "ring-1 ring-inset",
      )}
      style={
        status === "thinking"
          ? ({ ["--tw-ring-color" as any]: agent.color } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: agent.color, opacity: status === "idle" ? 0.25 : 1 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold"
          style={{ backgroundColor: `${agent.color}22`, color: agent.color }}
        >
          {agent.name[0]}
        </span>
        <StatusPill status={status} color={agent.color} />
      </div>
      <div className="mt-3 text-sm font-semibold text-white">{agent.name}</div>
      <div className="text-[11px] text-slate-500">{agent.role}</div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        {agent.description}
      </p>
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
      <span
        className="flex items-center gap-1.5 text-[10px] font-medium"
        style={{ color }}
      >
        <span
          className="h-1.5 w-1.5 animate-pulseSoft rounded-full"
          style={{ backgroundColor: color }}
        />
        working
      </span>
    );
  }
  if (status === "done") {
    return <span className="text-[10px] text-slate-500">done</span>;
  }
  return <span className="text-[10px] text-slate-600">idle</span>;
}
