"use client";

import { useState } from "react";
import { AgentRoster } from "./AgentRoster";
import { DisclosureChevron, Skeleton } from "@/components/ui";
import type { AgentProfile } from "@/components/shared";

export type CrewLoadState = "loading" | "ready" | "error";

// Collapsed-by-default crew summary. Agents support the home, they don't
// dominate it. The header states honest readiness ("Crew ready · N agents
// online"); expanding reveals the roster (idle on the home — live per-agent
// status only appears during a Lab Console run, so we never imply work here).
export function CrewStatus({
  state,
  agents,
  onRetry,
}: {
  state: CrewLoadState;
  agents: AgentProfile[];
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = agents.length;
  const ready = state === "ready" && count > 0;

  const summary =
    state === "loading"
      ? "Checking crew…"
      : state === "error"
        ? "Crew status unavailable — tap to retry"
        : `Crew ready · ${count} ${count === 1 ? "agent" : "agents"} online`;

  const onHeadClick = () => {
    if (state === "error") {
      onRetry();
      return;
    }
    if (ready) setOpen((v) => !v);
  };

  return (
    <section className="lx-card cc-crew" aria-label="Crew status">
      <button
        type="button"
        className="cc-crew-head"
        onClick={onHeadClick}
        aria-expanded={ready ? open : undefined}
        aria-controls={ready ? "cc-crew-body" : undefined}
        disabled={state === "loading"}
      >
        <span className="cc-crew-head-left">
          <span className="lx-eyebrow">Crew</span>
          <span className="cc-crew-summary">
            <span
              className={`lx-dot ${ready ? "on" : "off"}`}
              aria-hidden="true"
            />
            {summary}
          </span>
        </span>
        {state === "loading" ? (
          <Skeleton width={16} height={16} style={{ borderRadius: 4 }} />
        ) : state === "error" ? (
          <span className="cc-crew-retry" aria-hidden="true">
            Retry
          </span>
        ) : (
          <DisclosureChevron open={open} />
        )}
      </button>

      {open && ready ? (
        <div id="cc-crew-body" className="cc-crew-body">
          <AgentRoster agents={agents} statuses={{}} />
        </div>
      ) : null}
    </section>
  );
}
