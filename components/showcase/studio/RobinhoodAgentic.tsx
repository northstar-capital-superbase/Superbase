"use client";

import { useState, type ReactNode } from "react";
import { Arrow } from "../icons";
import {
  MOODS,
  ROBINHOOD,
  usd,
  type ActivityState,
  type TradeNote,
} from "../types";
import { ConfidenceGauge, Sparkline } from "./widgets";

function Card({
  title,
  badge,
  cls = "nx-col-4",
  children,
}: {
  title: string;
  badge?: ReactNode;
  cls?: string;
  children: ReactNode;
}) {
  return (
    <section className={`nx-panel ${cls}`}>
      <header className="nx-card-head">
        <span className="nx-eyebrow">{title}</span>
        {badge}
      </header>
      <div className="nx-card-body">{children}</div>
    </section>
  );
}

const ACTIVITY_COLOR: Record<ActivityState, string> = {
  active: "#8aa6ff",
  done: "#6e8bff",
  queued: "#e2b17c",
};

function NoteCard({ note }: { note: TradeNote }) {
  return (
    <article className={`nx-note-card ${note.tone}`}>
      <div className="nx-note-head">
        <span className="nx-note-title">{note.title}</span>
        <span
          className="nx-chip"
          style={{
            color: "var(--text-3)",
            borderColor: "var(--line)",
            background: "transparent",
          }}
        >
          {note.tag}
        </span>
      </div>
      <p className="nx-note-body">{note.body}</p>
      <div className="nx-note-foot">
        <span className="nx-note-time">{note.time}</span>
        <span className="nx-conf">
          conf {note.confidence}%
          <span className="nx-conf-bar">
            <span style={{ width: `${note.confidence}%` }} />
          </span>
        </span>
      </div>
    </article>
  );
}

export function RobinhoodAgentic() {
  const rh = ROBINHOOD;
  const [mode, setMode] = useState<"advisory" | "auto">(rh.mode);
  const mood = MOODS[rh.mood];

  return (
    <div className="nx-stage nx-container">
      {/* Marketing + connect banner */}
      <div className="nx-rh-hero">
        <div className="nx-rh-banner">
          <div>
            <span className="nx-rh-badge">
              <span className="nx-live" /> Robinhood Agentic · Connected
            </span>
            <h2>An agent that trades — and shows its work.</h2>
            <p>
              Connect your Robinhood Agentic account and the Trader joins every
              run. Watch its notes, its live status, and a confidence read on
              every decision before a single order goes out.
            </p>
            <div className="nx-rh-actions">
              <button type="button" className="nx-btn nx-btn-aurora nx-glowpulse">
                Connect Robinhood <Arrow />
              </button>
              <div className="nx-toggle" role="group" aria-label="Trading mode">
                {(["advisory", "auto"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={mode === m ? "is-active" : ""}
                    onClick={() => setMode(m)}
                  >
                    {m === "advisory" ? "Advisory" : "Auto-trade"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <span className="nx-mood">
            <span
              className="ring"
              style={{ background: mood.c, color: mood.c }}
            />
            Agent · {mood.label}
          </span>
        </div>
      </div>

      <div className="nx-dhead" style={{ paddingBottom: 20 }}>
        <div>
          <h1 className="nx-dtitle">Agentic trading desk</h1>
          <p className="nx-dsub">
            {mode === "auto"
              ? "Auto-trade is on — the agent executes within your caps."
              : "Advisory mode — the agent proposes, you approve."}
          </p>
        </div>
      </div>

      <div className="nx-grid">
        {/* Account value */}
        <Card
          title="AGENTIC ACCOUNT"
          cls="nx-col-5"
          badge={
            <span className="nx-sync" style={{ color: "var(--green)" }}>
              <span className="nx-live" /> LIVE
            </span>
          }
        >
          <div className="nx-bignum">{usd(rh.account.value)}</div>
          <div className="nx-delta up">
            ▲ {rh.account.dayPct}% · +{usd(rh.account.dayAbs)}
            <span className="nx-delta-sub">today</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={rh.account.history} color="#6e8bff" />
          </div>
          <div className="nx-foot">
            <span>
              Buying power <b>{usd(rh.account.buyingPower)}</b>
            </span>
            <span className="nx-foot-mono">MODE · {mode.toUpperCase()}</span>
          </div>
        </Card>

        {/* Confidence gauge — the headline read */}
        <Card title="AGENT CONFIDENCE" cls="nx-col-4">
          <div className="nx-gauge">
            <div className="nx-gauge-wrap">
              <ConfidenceGauge pct={rh.confidence.level} />
              <div className="nx-gauge-center">
                <span className="nx-gauge-num">
                  {rh.confidence.level}
                  <small>%</small>
                </span>
              </div>
            </div>
            <span className="nx-gauge-label">{rh.confidence.label}</span>
            <span className="nx-gauge-posture">{rh.confidence.posture}</span>
            <div className="nx-gauge-meta">
              <div>
                <div className="v" style={{ color: "var(--green)" }}>
                  +{rh.confidence.trend}
                </div>
                <div className="l">7-day trend</div>
              </div>
              <div>
                <div className="v">{rh.positions.length - 1}</div>
                <div className="l">Open positions</div>
              </div>
              <div>
                <div className="v">{rh.orders.length}</div>
                <div className="l">Orders today</div>
              </div>
            </div>
          </div>
        </Card>

        {/* How it's doing — live status feed */}
        <Card
          title="HOW IT'S DOING"
          cls="nx-col-3"
          badge={
            <span className="nx-mono" style={{ color: ACTIVITY_COLOR.active }}>
              ● LIVE
            </span>
          }
        >
          <ul className="nx-feed">
            {rh.activity.map((a, i) => (
              <li key={i}>
                <span
                  className="nx-dot"
                  style={{
                    background: ACTIVITY_COLOR[a.state],
                    boxShadow:
                      a.state === "active"
                        ? `0 0 8px ${ACTIVITY_COLOR[a.state]}`
                        : "none",
                  }}
                />
                <div className="nx-feed-main">
                  <div className="nx-feed-top">
                    <span className="nx-feed-label">{a.label}</span>
                    <span className="nx-feed-time">{a.time}</span>
                  </div>
                  <div className="nx-feed-detail">{a.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Positions */}
        <Card title="POSITIONS" cls="nx-col-8">
          <table className="nx-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>Day</th>
                <th>Weight</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rh.positions.map((p) => (
                <tr key={p.ticker}>
                  <td>
                    <span className="nx-tk">
                      <i style={{ background: p.color }} />
                      <span>
                        <b>{p.ticker}</b>
                        <em>{p.name}</em>
                      </span>
                    </span>
                  </td>
                  <td>{p.ticker === "CASH" ? "—" : `$${p.price}`}</td>
                  <td className={p.dayPct >= 0 ? "nx-pos" : "nx-neg"}>
                    {p.ticker === "CASH"
                      ? "—"
                      : `${p.dayPct >= 0 ? "+" : ""}${p.dayPct}%`}
                  </td>
                  <td>{p.weight}%</td>
                  <td style={{ color: "var(--text)" }}>{usd(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Orders */}
        <Card title="AGENT ORDERS" cls="nx-col-4">
          <ul className="nx-orders">
            {rh.orders.map((o, i) => (
              <li key={i}>
                <span className={`nx-side ${o.side.toLowerCase()}`}>
                  {o.side}
                </span>
                <div className="nx-order-main">
                  <b>{o.ticker}</b>
                  <span>
                    {o.qty} @ ${o.price}
                  </span>
                  <div className="nx-feed-detail" style={{ marginTop: 2 }}>
                    {o.status}
                  </div>
                </div>
                <span className="nx-order-time">{o.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* AI notes — viewable reasoning trail */}
        <Card
          title="AGENT NOTES"
          cls="nx-col-12"
          badge={
            <span className="nx-mono">
              {rh.notes.length} notes · reasoning trail
            </span>
          }
        >
          <div
            className="nx-notes"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            {rh.notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
