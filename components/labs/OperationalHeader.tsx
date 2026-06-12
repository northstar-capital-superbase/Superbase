"use client";

import type { TradingInfo } from "@/components/shared";
import { LabsSessionSwitcher } from "./LabsSessionSwitcher";
import type { LabSession } from "@/components/session/useSessions";

export function OperationalHeader({
  sessions,
  activeId,
  onSwitch,
  onCreate,
  onRemove,
  busy,
  activeAgents,
  insightCount,
  directiveCount,
  trading,
}: {
  sessions: LabSession[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: (name?: string) => void;
  onRemove: (id: string) => void;
  busy: boolean;
  activeAgents: number;
  insightCount: number;
  directiveCount: number;
  trading: TradingInfo | null;
}) {
  const portfolioLabel = trading?.traderInCrew
    ? "Portfolio linked"
    : "Advisory mode";
  const portfolioValue = trading?.traderInCrew
    ? `Execution · ${trading.mode}`
    : "No live execution";

  return (
    <header className="ops-header">
      <div className="ops-header-primary">
        <h1 className="ops-title">Northstar Labs</h1>
        <p className="ops-subtitle">
          {busy
            ? "Crew executing directive"
            : directiveCount > 0
              ? `${directiveCount} directive${directiveCount !== 1 ? "s" : ""} in workspace`
              : "Operational intelligence · awaiting directive"}
        </p>
      </div>

      <div className="ops-kpi-strip">
        <Kpi
          label="Status"
          value={busy ? "Running" : "Ready"}
          live={busy}
        />
        <Kpi
          label="Agents active"
          value={busy ? String(activeAgents) : "0"}
          live={activeAgents > 0}
        />
        <Kpi label="Intelligence" value={String(insightCount)} />
        <Kpi label="Portfolio" value={portfolioLabel} sub={portfolioValue} />
      </div>

      <LabsSessionSwitcher
        sessions={sessions}
        activeId={activeId}
        onSwitch={onSwitch}
        onCreate={onCreate}
        onRemove={onRemove}
      />
    </header>
  );
}

function Kpi({
  label,
  value,
  sub,
  live,
}: {
  label: string;
  value: string;
  sub?: string;
  live?: boolean;
}) {
  return (
    <div className={`ops-kpi ${live ? "is-live" : ""}`}>
      <span className="ops-kpi-label">{label}</span>
      <span className="ops-kpi-value">{value}</span>
      {sub && <span className="ops-kpi-sub">{sub}</span>}
    </div>
  );
}
