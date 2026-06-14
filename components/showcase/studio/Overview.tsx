"use client";

import type { ReactNode } from "react";
import { Arrow } from "../icons";
import { MOCK, STATUS, usd, type StatusKey, type StudioSection } from "../types";
import { Sparkline } from "./widgets";

function Card({
  title,
  live,
  cls = "nx-col-4",
  children,
  foot,
}: {
  title: string;
  live?: boolean;
  cls?: string;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <section className={`nx-panel ${cls}`}>
      <header className="nx-card-head">
        <span className="nx-eyebrow">{title}</span>
        {live && (
          <span className="nx-sync" style={{ color: "var(--green)" }}>
            <span className="nx-live" /> LIVE
          </span>
        )}
      </header>
      <div className="nx-card-body">{children}</div>
      {foot}
    </section>
  );
}

function Chip({ status }: { status: string }) {
  const s = STATUS[status as StatusKey] || STATUS.hold;
  return (
    <span
      className="nx-chip"
      style={{ color: s.c, borderColor: `${s.c}55`, background: `${s.c}14` }}
    >
      {s.l}
    </span>
  );
}

export function Overview({
  onNavigate,
}: {
  onNavigate: (s: StudioSection) => void;
}) {
  const nw = MOCK.netWorth;
  const ef = MOCK.emergency;
  const efPct = Math.round((ef.current / ef.target) * 100);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="nx-stage nx-container">
      <div className="nx-dhead">
        <div>
          <h1 className="nx-dtitle">{greet}, {MOCK.user.name}.</h1>
          <p className="nx-dsub">Your capital is allocated and routing on schedule.</p>
        </div>
        <button
          type="button"
          className="nx-btn nx-btn-green"
          onClick={() => onNavigate("robinhood")}
        >
          Open the trading desk <Arrow />
        </button>
      </div>

      <div className="nx-grid">
        {/* Net worth */}
        <Card
          title="NET WORTH"
          cls="nx-col-8"
          foot={
            <div className="nx-foot">
              <span>Assets <b>{usd(nw.assets)}</b></span>
              <span>Liabilities <b>−{usd(nw.liabilities)}</b></span>
              <span className="nx-foot-mono">UPDATED 2M AGO</span>
            </div>
          }
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div className="nx-bignum">{usd(nw.value)}</div>
              <div className="nx-delta up">
                ▲ {nw.deltaPct}% · +{usd(nw.deltaAbs)}
                <span className="nx-delta-sub">past 30 days</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 380 }}>
              <Sparkline data={nw.history} color="#6e8bff" />
            </div>
          </div>
        </Card>

        {/* Emergency fund */}
        <Card
          title="EMERGENCY FUND"
          foot={
            <div className="nx-foot">
              <span className="nx-foot-mono" style={{ marginLeft: 0 }}>
                {ef.months} OF {ef.targetMonths} MONTHS COVERED
              </span>
            </div>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div className="nx-bignum" style={{ fontSize: 34 }}>{efPct}%</div>
              <div className="nx-delta-sub" style={{ marginLeft: 0 }}>funded</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="nx-bar"><span style={{ width: `${efPct}%` }} /></div>
              <div className="nx-goal-sub">{usd(ef.current)} / {usd(ef.target)}</div>
            </div>
          </div>
        </Card>

        {/* Allocation */}
        <Card title="PORTFOLIO ALLOCATION" cls="nx-col-5"
          foot={<div className="nx-foot"><span className="nx-foot-mono" style={{ marginLeft: 0 }}>ON TARGET · DRIFT &lt; 2%</span></div>}
        >
          <div className="nx-allocbar">
            {MOCK.allocation.map((a) => (
              <span key={a.ticker} style={{ width: `${a.pct}%`, background: a.color }} title={`${a.ticker} ${a.pct}%`} />
            ))}
          </div>
          <ul className="nx-legend">
            {MOCK.allocation.map((a) => (
              <li key={a.ticker}>
                <span className="nx-legend-l">
                  <i style={{ background: a.color }} />
                  <b>{a.ticker}</b>
                  <em>{a.name}</em>
                </span>
                <span className="nx-legend-pct">{a.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Goals */}
        <Card title="GOALS" cls="nx-col-3">
          <ul className="nx-goals">
            {MOCK.goals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <li key={g.name}>
                  <div className="nx-goal-top">
                    <span>{g.name}</span>
                    <span className="nx-goal-pct">{pct}%</span>
                  </div>
                  <div className="nx-bar"><span style={{ width: `${pct}%` }} /></div>
                  <div className="nx-goal-sub">{usd(g.current)} of {usd(g.target)}</div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Agent activity */}
        <Card title="AGENT ACTIVITY" cls="nx-col-4" live>
          <ul className="nx-feed">
            {MOCK.agents.map((a, i) => {
              const s = STATUS[a.status as StatusKey] || STATUS.hold;
              return (
                <li key={i}>
                  <span className="nx-dot" style={{ background: s.c, boxShadow: `0 0 8px ${s.c}88` }} />
                  <div className="nx-feed-main">
                    <div className="nx-feed-top">
                      <span className="nx-feed-time" style={{ color: "var(--blue)" }}>{a.agent}</span>
                      <span className="nx-feed-time">{a.time}</span>
                    </div>
                    <div className="nx-feed-detail" style={{ color: "var(--text)" }}>{a.action}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Decisions */}
        <Card title="RECENT DECISIONS" cls="nx-col-12">
          <ul className="nx-feed">
            {MOCK.decisions.map((d, i) => (
              <li key={i}>
                <span className="nx-dot" style={{ background: "var(--blue)" }} />
                <div className="nx-feed-main">
                  <div className="nx-feed-top">
                    <span className="nx-feed-label">
                      <span className="nx-foot-mono" style={{ marginLeft: 0, marginRight: 10 }}>{d.date}</span>
                      {d.title}
                    </span>
                    <Chip status={d.outcome} />
                  </div>
                  <div className="nx-feed-detail">{d.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
