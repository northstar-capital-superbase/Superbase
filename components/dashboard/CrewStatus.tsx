"use client";

import { useState } from "react";
import { AgentRoster } from "./AgentRoster";
import { DisclosureChevron, Skeleton } from "@/components/ui";
import type { AgentProfile } from "@/components/shared";
import { crewSummary, type CrewLoadState } from "@/lib/dashboard/crew";

export type { CrewLoadState };

// Collapsed-by-default crew summary. Agents support the home, they don't
// dominate it. Readiness requires both a loaded roster and a configured model;
// expanding reveals the roster (idle on the home — live per-agent status only
// appears during a Lab Console run, so we never imply work here).
export function CrewStatus({
  state,
  agents,
  runtimeLoaded,
  configured,
  onRetry,
}: {
  state: CrewLoadState;
  agents: AgentProfile[];
  runtimeLoaded: boolean;
  configured: boolean;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = agents.length;
  const canExpand = state === "ready" && count > 0;
  const operational = canExpand && runtimeLoaded && configured;
  const summary = crewSummary({ state, runtimeLoaded, configured, count });

  const onHeadClick = () => {
    if (state === "error") {
      onRetry();
      return;
    }
    if (canExpand) setOpen((v) => !v);
  };

  return (
    <section className="lx-card cc-crew" aria-label="Crew status">
      <button
        type="button"
        className="cc-crew-head"
        onClick={onHeadClick}
        aria-expanded={canExpand ? open : undefined}
        aria-controls={canExpand ? "cc-crew-body" : undefined}
        disabled={state === "loading" || !runtimeLoaded}
      >
        <span className="cc-crew-head-left">
          <span className="lx-eyebrow">Crew</span>
          <span className="cc-crew-summary">
            <span
              className={`lx-dot ${operational ? "on" : "off"}`}
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

      {open && canExpand ? (
        <div id="cc-crew-body" className="cc-crew-body">
          <AgentRoster agents={agents} statuses={{}} />
        </div>
      ) : null}
    </section>
  );
}
