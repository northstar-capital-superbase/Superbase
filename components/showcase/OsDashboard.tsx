"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StarGlyph } from "./icons";
import { MOCK, STATUS, usd, type MockUser, type StatusKey } from "./types";

function StatusDot({ status }: { status: string }) {
  const s = STATUS[status as StatusKey] || STATUS.hold;
  return (
    <span
      className="ns-d-dot"
      style={{ background: s.c, boxShadow: `0 0 8px ${s.c}66` }}
    />
  );
}

function Chip({ status }: { status: string }) {
  const s = STATUS[status as StatusKey] || STATUS.hold;
  return (
    <span
      className="ns-d-chip"
      style={{
        color: s.c,
        borderColor: `${s.c}44`,
        background: `${s.c}12`,
      }}
    >
      {s.l}
    </span>
  );
}

function DCard({
  title,
  live,
  span = 1,
  children,
  foot,
}: {
  title: string;
  live?: boolean;
  span?: number;
  children: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <section className={`ns-d-card ns-d-span-${span}`}>
      <header className="ns-d-card-head">
        <span className="ns-eyebrow">{title}</span>
        {live && (
          <span className="ns-d-live-tag">
            <span
              className="ns-d-dot"
              style={{ background: "#7FB39B", boxShadow: "0 0 8px #7FB39B88" }}
            />{" "}
            LIVE
          </span>
        )}
      </header>
      <div className="ns-d-card-body">{children}</div>
      {foot && <footer className="ns-d-card-foot">{foot}</footer>}
    </section>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const { line, area } = useMemo(() => {
    const w = 320,
      h = 80,
      p = 4;
    const min = Math.min(...data),
      max = Math.max(...data);
    const xs = (i: number) => p + (i / (data.length - 1)) * (w - p * 2);
    const ys = (v: number) =>
      h - p - ((v - min) / (max - min || 1)) * (h - p * 2);
    const line = data
      .map((v, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`)
      .join(" ");
    return {
      line,
      area: `${line} L${xs(data.length - 1)} ${h} L${xs(0)} ${h} Z`,
    };
  }, [data]);

  return (
    <svg
      viewBox="0 0 320 80"
      preserveAspectRatio="none"
      className="ns-d-spark"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6E8BFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#6E8BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk)" />
      <path d={line} fill="none" stroke="#8AA1FF" strokeWidth="1.6" />
    </svg>
  );
}

function ProgressRing({ pct, size = 132 }: { pct: number; size?: number }) {
  const r = size / 2 - 9,
    c = 2 * Math.PI * r,
    off = c * (1 - pct / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="ns-d-ring"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E2B17C"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function OsDashboard({
  user,
  onLogout,
}: {
  user: MockUser;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState("Overview");
  const nw = MOCK.netWorth;
  const ef = MOCK.emergency;
  const efPct = Math.round((ef.current / ef.target) * 100);
  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="ns-d">
      <header className="ns-d-nav">
        <div className="ns-d-nav-inner">
          <div className="ns-brand">
            <StarGlyph />
            <span className="ns-brand-word">Northstar</span>
            <span className="ns-d-os">OS</span>
          </div>
          <nav className="ns-d-tabs" aria-label="Sections">
            {["Overview", "Portfolio", "Agents", "Decisions"].map((t) => (
              <button
                key={t}
                type="button"
                className={`ns-d-tab ${tab === t ? "is-active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="ns-d-nav-right">
            <span className="ns-d-sync">
              <span
                className="ns-d-dot"
                style={{
                  background: "#7FB39B",
                  boxShadow: "0 0 8px #7FB39B88",
                }}
              />{" "}
              SYNCED
            </span>
            <span className="ns-d-avatar" title={user.email}>
              {user.initials}
            </span>
            <button
              type="button"
              className="ns-d-signout"
              onClick={onLogout}
              aria-label="Sign out"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6 M10.5 11l3-3-3-3 M13.5 8H6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="ns-container ns-d-head">
        <div>
          <h1 className="ns-d-title">
            {greet}, {user.name}.
          </h1>
          <p className="ns-d-subtitle">
            Your capital is allocated and routing on schedule.
          </p>
        </div>
        <span className="ns-d-systag">
          NORTHSTAR OS · BUILD 0.2 · ALL SYSTEMS NOMINAL
        </span>
      </div>

      <div className="ns-container ns-d-grid">
        <DCard
          title="NET WORTH"
          span={2}
          foot={
            <div className="ns-d-foot-row">
              <span>
                Assets <b style={{ color: "#EDEFF4" }}>{usd(nw.assets)}</b>
              </span>
              <span>
                Liabilities{" "}
                <b style={{ color: "#EDEFF4" }}>−{usd(nw.liabilities)}</b>
              </span>
              <span className="ns-d-foot-mono">UPDATED 2M AGO</span>
            </div>
          }
        >
          <div className="ns-d-nw">
            <div>
              <div className="ns-d-bignum">{usd(nw.value)}</div>
              <div className="ns-d-delta" style={{ color: "#7FB39B" }}>
                ▲ {nw.deltaPct}% · +{usd(nw.deltaAbs)}{" "}
                <span className="ns-d-delta-sub">past 30 days</span>
              </div>
            </div>
            <div className="ns-d-spark-wrap">
              <Sparkline data={nw.history} />
            </div>
          </div>
        </DCard>

        <DCard
          title="EMERGENCY FUND"
          foot={
            <span className="ns-d-foot-mono">
              {ef.months} OF {ef.targetMonths} MONTHS COVERED
            </span>
          }
        >
          <div className="ns-d-ef">
            <div className="ns-d-ring-wrap">
              <ProgressRing pct={efPct} />
              <div className="ns-d-ring-center">
                <span className="ns-d-ring-pct">{efPct}%</span>
                <span className="ns-d-ring-lbl">funded</span>
              </div>
            </div>
            <div className="ns-d-ef-detail">
              <div className="ns-d-ef-num">
                {usd(ef.current)} <span>/ {usd(ef.target)}</span>
              </div>
              <Chip status="building" />
            </div>
          </div>
        </DCard>

        <DCard
          title="PORTFOLIO ALLOCATION"
          foot={<span className="ns-d-foot-mono">ON TARGET · DRIFT &lt; 2%</span>}
        >
          <div className="ns-d-allocbar">
            {MOCK.allocation.map((a) => (
              <span
                key={a.ticker}
                style={{ width: `${a.pct}%`, background: a.color }}
                title={`${a.ticker} ${a.pct}%`}
              />
            ))}
          </div>
          <ul className="ns-d-legend">
            {MOCK.allocation.map((a) => (
              <li key={a.ticker}>
                <span className="ns-d-legend-l">
                  <i style={{ background: a.color }} />
                  <b>{a.ticker}</b>
                  <em>{a.name}</em>
                </span>
                <span className="ns-d-legend-pct">{a.pct}%</span>
              </li>
            ))}
          </ul>
        </DCard>

        <DCard title="GOALS">
          <ul className="ns-d-goals">
            {MOCK.goals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <li key={g.name}>
                  <div className="ns-d-goal-top">
                    <span>{g.name}</span>
                    <span className="ns-d-goal-pct">{pct}%</span>
                  </div>
                  <div className="ns-d-bar">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div className="ns-d-goal-sub">
                    {usd(g.current)} of {usd(g.target)}
                  </div>
                </li>
              );
            })}
          </ul>
        </DCard>

        <DCard title="AGENT ACTIVITY" live>
          <ul className="ns-d-feed">
            {MOCK.agents.map((a, i) => (
              <li key={i}>
                <StatusDot status={a.status} />
                <div className="ns-d-feed-main">
                  <div className="ns-d-feed-top">
                    <span className="ns-d-agent">{a.agent}</span>
                    <span className="ns-d-feed-time">{a.time}</span>
                  </div>
                  <div className="ns-d-feed-action">{a.action}</div>
                </div>
              </li>
            ))}
          </ul>
        </DCard>

        <DCard title="RECENT DECISIONS" span={3}>
          <ol className="ns-d-timeline">
            {MOCK.decisions.map((d, i) => (
              <li key={i}>
                <span className="ns-d-tl-node" />
                <div className="ns-d-tl-body">
                  <div className="ns-d-tl-top">
                    <span className="ns-d-tl-date">{d.date}</span>
                    <span className="ns-d-tl-title">{d.title}</span>
                    <Chip status={d.outcome} />
                  </div>
                  <div className="ns-d-tl-detail">{d.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </DCard>
      </div>
    </div>
  );
}
