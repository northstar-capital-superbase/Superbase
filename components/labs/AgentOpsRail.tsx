"use client";

import clsx from "clsx";
import type { AgentProfile } from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";
import type { AgentActivity } from "./labsIntel";

export function AgentOpsRail({
  agents,
  statuses,
  activity,
  busy,
}: {
  agents: AgentProfile[];
  statuses: Record<string, AgentStatus>;
  activity: Record<string, AgentActivity>;
  busy: boolean;
}) {
  return (
    <section className="ops-panel ops-agents">
      <div className="ops-panel-head">
        <h2 className="ops-panel-title">Agent activity</h2>
        <span className={clsx("ops-pill", busy && "is-live")}>
          {busy ? "Live" : "Monitoring"}
        </span>
      </div>

      <ul className="ops-agent-list">
        {agents.map((agent) => {
          const status = statuses[agent.id] ?? "idle";
          const act = activity[agent.id];
          return (
            <li
              key={agent.id}
              className={clsx(
                "ops-agent-row",
                status === "thinking" && "is-active",
                status === "done" && "is-done",
              )}
            >
              <div className="ops-agent-row-top">
                <span
                  className="ops-agent-dot"
                  style={{
                    backgroundColor: agent.color,
                    boxShadow:
                      status === "thinking"
                        ? `0 0 10px ${agent.color}88`
                        : undefined,
                  }}
                />
                <span className="ops-agent-name">{agent.name}</span>
                <StatusChip status={status} />
              </div>
              <p className="ops-agent-action">
                {status === "thinking"
                  ? "Executing…"
                  : act?.lastAction ?? agent.role}
              </p>
              {act?.lastAt && status !== "thinking" && (
                <span className="ops-agent-time">{act.lastAt}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusChip({ status }: { status: AgentStatus }) {
  if (status === "thinking") {
    return <span className="ops-status-chip is-active">Active</span>;
  }
  if (status === "done") {
    return <span className="ops-status-chip is-done">Done</span>;
  }
  return <span className="ops-status-chip">Standby</span>;
}
