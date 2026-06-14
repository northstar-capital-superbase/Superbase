"use client";

import clsx from "clsx";
import type { AgentProfile } from "@/components/shared";
import { AGENT_META } from "@/components/shared";

export type AgentStatus = "idle" | "thinking" | "done";

export function AgentRoster({
  agents,
  statuses,
}: {
  agents: AgentProfile[];
  statuses: Record<string, AgentStatus>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-5">
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
  const meta = AGENT_META[agent.id];
  const thinking = status === "thinking";
  const done = status === "done";

  return (
    <div
      className={clsx(
        "panel relative overflow-hidden p-3.5 transition-all duration-300",
        thinking && "ring-1 ring-inset",
        done && "border-white/[0.07]",
      )}
      style={thinking ? ({ ["--tw-ring-color" as string]: `${meta.color}50` } as React.CSSProperties) : undefined}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          backgroundColor: meta.color,
          opacity: thinking ? 1 : done ? 0.6 : 0.2,
        }}
      />

      {/* Thinking glow */}
      {thinking && (
        <div
          className="absolute inset-0 opacity-[0.04] transition-opacity"
          style={{ background: `radial-gradient(circle at 50% 0%, ${meta.color}, transparent 70%)` }}
        />
      )}

      <div className="relative flex items-center justify-between gap-2">
        <div
          className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg text-[11px] font-bold"
          style={{
            backgroundColor: `${meta.color}18`,
            color: meta.color,
          }}
        >
          {agent.name[0]}
        </div>
        <StatusPill status={status} color={meta.color} />
      </div>

      <div className="relative mt-2.5">
        <div className="text-[13px] font-semibold text-slate-100">{agent.name}</div>
        <div className="text-[10px] text-slate-600">{agent.role}</div>
      </div>
    </div>
  );
}

function StatusPill({ status, color }: { status: AgentStatus; color: string }) {
  if (status === "thinking") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color }}>
        <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full" style={{ backgroundColor: color }} />
        active
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 text-[10px] text-slate-500">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        done
      </span>
    );
  }
  return <span className="text-[10px] text-slate-700">idle</span>;
}
