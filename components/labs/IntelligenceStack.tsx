"use client";

import type { InsightItem } from "./labsIntel";
import type { TradingInfo } from "@/components/shared";

export function IntelligenceStack({
  insights,
  trading,
  onExplore,
  recentActions,
}: {
  insights: InsightItem[];
  trading: TradingInfo | null;
  onExplore: () => void;
  recentActions: { id: string; label: string; time: string }[];
}) {
  const linked = trading?.traderInCrew ?? false;

  return (
    <div className="ops-intel-stack">
      <section className="ops-panel ops-portfolio">
        <div className="ops-panel-head">
          <h2 className="ops-panel-title">Portfolio intelligence</h2>
          <span className={`ops-pill ${linked ? "is-live" : ""}`}>
            {linked ? "Linked" : "Advisory"}
          </span>
        </div>
        <div className="ops-portfolio-body">
          {linked ? (
            <>
              <div className="ops-portfolio-stat">
                <span className="ops-portfolio-num">Live</span>
                <span className="ops-portfolio-cap">
                  Agentic execution · {trading?.mode} mode
                </span>
              </div>
              <p className="ops-portfolio-note">
                Trader agent participates in crew runs. Order cap $
                {trading?.maxOrderUsd ?? "—"} per instruction.
              </p>
            </>
          ) : (
            <>
              <div className="ops-portfolio-stat">
                <span className="ops-portfolio-num">—</span>
                <span className="ops-portfolio-cap">Research & strategy only</span>
              </div>
              <p className="ops-portfolio-note">
                Portfolio execution is available when trading is connected in
                Settings.
              </p>
            </>
          )}
        </div>
      </section>

      <section className="ops-panel ops-insights">
        <div className="ops-panel-head">
          <h2 className="ops-panel-title">Recent insights</h2>
          <button type="button" className="ops-text-btn" onClick={onExplore}>
            View all
          </button>
        </div>
        <ul className="ops-insight-list">
          {insights.length === 0 ? (
            <li className="ops-insight-placeholder">
              Generated research, plans, and synthesis will appear here as the
              crew works.
            </li>
          ) : (
            insights.slice(0, 5).map((ins) => (
              <li key={ins.id} className="ops-insight-row">
                <div className="ops-insight-top">
                  <span className="ops-insight-source" style={{ color: ins.color }}>
                    {ins.source}
                  </span>
                  <time className="ops-insight-time">{ins.time}</time>
                </div>
                <p className="ops-insight-headline">{ins.headline}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="ops-panel ops-actions">
        <div className="ops-panel-head">
          <h2 className="ops-panel-title">Autonomous actions</h2>
        </div>
        <ul className="ops-action-list">
          {recentActions.length === 0 ? (
            <li className="ops-action-row is-idle">
              <span className="ops-action-label">Monitoring</span>
              <span className="ops-action-detail">
                Crew on standby — no autonomous actions queued
              </span>
            </li>
          ) : (
            recentActions.map((a) => (
              <li key={a.id} className="ops-action-row">
                <span className="ops-action-label">{a.label}</span>
                <time className="ops-action-time">{a.time}</time>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
