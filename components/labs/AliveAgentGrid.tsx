"use client";

import clsx from "clsx";
import type { AgentProfile } from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";

export function AliveAgentGrid({
  agents,
  statuses,
}: {
  agents: AgentProfile[];
  statuses: Record<string, AgentStatus>;
}) {
  return (
    <div className="labs-agent-grid">
      {agents.map((agent) => {
        const status = statuses[agent.id] ?? "idle";
        return (
          <article
            key={agent.id}
            className={clsx(
              "labs-agent-card",
              status === "thinking" && "is-thinking",
              status === "done" && "is-done",
            )}
          >
            <div
              className="labs-agent-accent"
              style={{
                backgroundColor: agent.color,
                opacity: status === "idle" ? 0.35 : 1,
              }}
            />
            <AgentStatusLabel status={status} color={agent.color} />
            <span
              className="labs-agent-glyph"
              style={{
                backgroundColor: `${agent.color}18`,
                color: agent.color,
                borderColor: `${agent.color}33`,
              }}
            >
              {agent.name[0]}
            </span>
            <div className="labs-agent-name">{agent.name}</div>
            <div className="labs-agent-role">{agent.role}</div>
            <p className="labs-agent-desc">{agent.description}</p>
          </article>
        );
      })}
    </div>
  );
}

function AgentStatusLabel({
  status,
  color,
}: {
  status: AgentStatus;
  color: string;
}) {
  if (status === "thinking") {
    return (
      <span
        className="labs-agent-status is-thinking"
        style={{ color }}
      >
        <span
          className="labs-agent-status-dot"
          style={{ backgroundColor: color }}
        />
        Active
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="labs-agent-status" style={{ color: "var(--ns-good)" }}>
        <span
          className="labs-agent-status-dot"
          style={{ backgroundColor: "var(--ns-good)" }}
        />
        Complete
      </span>
    );
  }
  return (
    <span className="labs-agent-status" style={{ color: "var(--ns-text-3)" }}>
      <span
        className="labs-agent-status-dot"
        style={{ backgroundColor: "var(--ns-text-3)", opacity: 0.5 }}
      />
      Standby
    </span>
  );
}
