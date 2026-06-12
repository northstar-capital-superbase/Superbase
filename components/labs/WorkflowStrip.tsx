"use client";

import clsx from "clsx";
import { AGENT_META, type AgentProfile } from "@/components/shared";
import type { AgentStatus } from "@/components/dashboard/AgentRoster";

const STEP_LABELS: Record<AgentProfile["id"], string> = {
  orchestrator: "Plan",
  research: "Research",
  strategist: "Strategy",
  behavioral: "Risk",
  trader: "Execute",
};

export function WorkflowStrip({
  pipeline,
  statuses,
  busy,
}: {
  pipeline: AgentProfile["id"][];
  statuses: Record<string, AgentStatus>;
  busy: boolean;
}) {
  const activeId = pipeline.find((id) => statuses[id] === "thinking");

  return (
    <div className="labs-workflow">
      <div className="labs-section-head" style={{ marginBottom: 16 }}>
        <div>
          <span className="ns-eyebrow">Running workflow</span>
          <h3 className="labs-section-title" style={{ fontSize: "20px" }}>
            {busy ? "Crew in motion" : "Pipeline ready"}
          </h3>
        </div>
        <span className="ns-mono-tag">
          {busy ? "autonomous" : "awaiting task"}
        </span>
      </div>

      <div className="labs-workflow-track">
        {pipeline.map((id, idx) => {
          const status = statuses[id] ?? "idle";
          const meta = AGENT_META[id];
          return (
            <div
              key={id}
              className={clsx(
                "labs-workflow-step",
                status === "thinking" && "is-active",
                status === "done" && "is-done",
              )}
            >
              <div
                className="labs-workflow-node"
                style={
                  status === "thinking"
                    ? { borderColor: `${meta.color}88`, color: meta.color }
                    : undefined
                }
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <span className="labs-workflow-label">
                {STEP_LABELS[id] ?? meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {activeId && (
        <p
          className="ns-mono-idx"
          style={{ marginTop: 14, color: AGENT_META[activeId].color }}
        >
          {AGENT_META[activeId].label} is working now
        </p>
      )}
    </div>
  );
}
