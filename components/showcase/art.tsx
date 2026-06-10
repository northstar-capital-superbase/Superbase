"use client";

import { useMemo } from "react";
import { mulberry32 } from "./utils";

const FLOW_NODES = [
  { idx: "01", name: "INCOME", sub: "inflow" },
  { idx: "02", name: "EMERGENCY FUND", sub: "6-month buffer" },
  { idx: "03", name: "BROKERAGE", sub: "index core" },
  { idx: "04", name: "ROTH IRA", sub: "tax-advantaged" },
  { idx: "05", name: "FUTURE OPS", sub: "opportunity reserve" },
];

export function CapitalFlow() {
  const W = 1200,
    H = 560,
    nodeW = 176,
    nodeH = 74,
    yTop = 210,
    yc = yTop + nodeH / 2,
    ML = 56;
  const gap =
    (W - ML * 2 - nodeW * FLOW_NODES.length) / (FLOW_NODES.length - 1);
  const nodes = FLOW_NODES.map((n, i) => {
    const x = ML + i * (nodeW + gap);
    return { ...n, x, cx: x + nodeW / 2 };
  });
  const connectors = nodes
    .slice(0, -1)
    .map((n, i) => ({ x1: n.x + nodeW, x2: nodes[i + 1].x }));
  const labels = ["ALLOCATOR", "", "RISK", "", "REBALANCE"];
  const agents = nodes.map((n, i) => ({
    x: n.cx,
    y: 432 + (i % 2) * 14 - 7,
    label: labels[i],
  }));
  const dots = useMemo(() => {
    const rng = mulberry32(91);
    return Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      x: rng() * W,
      y: rng() * H,
      r: 0.5 + rng() * 1.1,
      o: 0.12 + rng() * 0.25,
    }));
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="ns-flow-svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ns-cool" cx="80%" cy="8%" r="70%">
          <stop offset="0%" stopColor="#6E8BFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#6E8BFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ns-warm" cx="42%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#E2B17C" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#E2B17C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ns-stream" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E2B17C" stopOpacity="0" />
          <stop offset="50%" stopColor="#E2B17C" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#E2B17C" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ns-cool)" />
      <rect width={W} height={H} fill="url(#ns-warm)" />
      {dots.map((d) => (
        <circle
          key={d.id}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="#9aa6c4"
          opacity={d.o}
        />
      ))}
      <line
        x1={agents[0].x}
        y1="432"
        x2={agents[agents.length - 1].x}
        y2="432"
        stroke="rgba(255,255,255,0.06)"
      />
      {agents.map((a, i) => (
        <g key={i}>
          <line
            x1={a.x}
            y1={yTop + nodeH}
            x2={a.x}
            y2={a.y - 12}
            stroke="rgba(110,139,255,0.12)"
            strokeDasharray="2 5"
          />
          <circle
            cx={a.x}
            cy={a.y}
            r="11"
            fill="none"
            stroke="rgba(110,139,255,0.28)"
            className="ns-pulse"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
          <circle cx={a.x} cy={a.y} r="2.6" fill="#aeb9e8" />
          {a.label && (
            <text
              x={a.x}
              y={a.y + 26}
              textAnchor="middle"
              className="ns-flow-micro"
            >
              {a.label}
            </text>
          )}
        </g>
      ))}
      {connectors.map((c, i) => (
        <g key={i}>
          <line
            x1={c.x1}
            y1={yc}
            x2={c.x2}
            y2={yc}
            stroke="rgba(255,255,255,0.10)"
          />
          <line
            x1={c.x1}
            y1={yc}
            x2={c.x2}
            y2={yc}
            stroke="url(#ns-stream)"
            strokeWidth="2"
            className="ns-stream"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          <circle
            r="3"
            fill="#F0CF9E"
            className="ns-packet"
            style={{
              offsetPath: `path("M${c.x1} ${yc} L${c.x2} ${yc}")`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        </g>
      ))}
      {nodes.map((n) => (
        <g key={n.idx}>
          <rect
            x={n.x}
            y={yTop}
            width={nodeW}
            height={nodeH}
            rx="13"
            fill="#0C0E13"
            stroke="rgba(255,255,255,0.11)"
          />
          <text x={n.x + 16} y={yTop + 24} className="ns-flow-idx">
            {n.idx}
          </text>
          <circle
            cx={n.x + nodeW - 16}
            cy={yTop + 20}
            r="2.4"
            fill="#E2B17C"
          />
          <text x={n.x + 16} y={yTop + 45} className="ns-flow-name">
            {n.name}
          </text>
          <text x={n.x + 16} y={yTop + 61} className="ns-flow-sub">
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function StudyCapitalFlow() {
  const stages = ["INCOME", "BUFFER", "CORE", "OBJECTIVE"];
  const x = 160;
  const ys = [50, 122, 194, 266];
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      {ys.slice(0, -1).map((y, i) => (
        <g key={i}>
          <line
            x1={x}
            y1={y + 16}
            x2={x}
            y2={ys[i + 1] - 16}
            stroke="rgba(255,255,255,0.12)"
          />
          <circle
            r="2.6"
            fill="#F0CF9E"
            className="ns-packet"
            style={{
              offsetPath: `path("M${x} ${y + 16} L${x} ${ys[i + 1] - 16}")`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        </g>
      ))}
      {ys.map((y, i) => (
        <g key={i}>
          <rect
            x={x - 64}
            y={y - 16}
            width="128"
            height="32"
            rx="8"
            fill="#0C0E13"
            stroke="rgba(110,139,255,0.22)"
          />
          <circle cx={x - 50} cy={y} r="2" fill="#E2B17C" />
          <text
            x={x - 38}
            y={y + 4}
            className="ns-flow-name"
            style={{ fontSize: 11 }}
          >
            {stages[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function StudyAgentMesh() {
  const rng = mulberry32(41);
  const core = { x: 160, y: 160 };
  const agents = Array.from({ length: 7 }).map((_, i) => {
    const ang = (i / 7) * Math.PI * 2 + 0.3;
    const rad = 88 + rng() * 26;
    return { x: 160 + Math.cos(ang) * rad, y: 160 + Math.sin(ang) * rad };
  });
  const edges: [{ x: number; y: number }, { x: number; y: number }][] = [];
  agents.forEach((a, i) => {
    edges.push([a, core]);
    edges.push([a, agents[(i + 2) % agents.length]]);
  });
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="rgba(150,168,230,0.2)"
          className="ns-signal"
          style={{ animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}
      {agents.map((a, i) => (
        <g key={i}>
          <circle
            cx={a.x}
            cy={a.y}
            r="8"
            fill="none"
            stroke="rgba(110,139,255,0.3)"
            className="ns-pulse"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <circle cx={a.x} cy={a.y} r="2.4" fill="#cdd9ff" />
        </g>
      ))}
      <circle
        cx={core.x}
        cy={core.y}
        r="16"
        fill="#0C0E13"
        stroke="rgba(226,177,124,0.45)"
      />
      <circle cx={core.x} cy={core.y} r="3" fill="#F0CF9E" />
    </svg>
  );
}

export function StudyPortfolioOS() {
  const seg = [
    { w: 55, label: "CORE", c: "rgba(110,139,255,0.55)" },
    { w: 25, label: "GROWTH", c: "rgba(226,177,124,0.55)" },
    { w: 20, label: "INTL", c: "rgba(150,168,230,0.4)" },
  ];
  let acc = 60;
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      {seg.map((s, i) => {
        const h = (s.w / 100) * 200;
        const y = acc;
        acc += h + 6;
        return (
          <g key={i}>
            <rect
              x="80"
              y={y}
              width="160"
              height={h}
              rx="6"
              fill="none"
              stroke={s.c}
            />
            <rect
              x="80"
              y={y}
              width={(s.w / 100) * 160}
              height={h}
              rx="6"
              fill={s.c}
              opacity="0.16"
            />
            <text
              x="92"
              y={y + 18}
              className="ns-flow-name"
              style={{ fontSize: 11 }}
            >
              {s.label}
            </text>
            <text
              x="228"
              y={y + 18}
              textAnchor="end"
              className="ns-flow-idx"
            >
              {s.w}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function StudyRouting() {
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      <g stroke="rgba(110,139,255,0.32)" fill="none" strokeWidth="1">
        <path d="M40 60 H140 V120 H230" className="ns-signal" />
        <path
          d="M40 130 H100 V200 H180 V150 H280"
          className="ns-signal"
          style={{ animationDelay: "0.8s" }}
        />
        <path
          d="M40 250 H150 V190 H210 V260 H280"
          className="ns-signal"
          style={{ animationDelay: "1.4s" }}
        />
      </g>
      {(
        [
          [40, 60],
          [230, 120],
          [40, 130],
          [280, 150],
          [40, 250],
          [280, 260],
          [180, 200],
        ] as const
      ).map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - 4}
            y={y - 4}
            width="8"
            height="8"
            rx="1.5"
            fill="#0C0E13"
            stroke="rgba(226,177,124,0.5)"
          />
          <circle cx={x} cy={y} r="1.4" fill="#F0CF9E" />
        </g>
      ))}
    </svg>
  );
}

export function StudyCommand() {
  const lines = [
    ["route", "surplus → brokerage"],
    ["fund", "roth_ira 20%"],
    ["hold", "emergency_buffer"],
  ] as const;
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      <rect
        x="36"
        y="48"
        width="248"
        height="224"
        rx="12"
        fill="#0A0C11"
        stroke="rgba(255,255,255,0.1)"
      />
      <line
        x1="36"
        y1="80"
        x2="284"
        y2="80"
        stroke="rgba(255,255,255,0.08)"
      />
      <circle cx="52" cy="64" r="2.4" fill="#E2B17C" />
      <text
        x="64"
        y="68"
        className="ns-flow-micro"
        style={{ textAnchor: "start" }}
      >
        OPERATOR
      </text>
      {lines.map(([cmd, arg], i) => {
        const y = 112 + i * 36;
        return (
          <g key={i}>
            <text x="56" y={y} className="ns-cmd-key">
              {cmd}
            </text>
            <text x="104" y={y} className="ns-cmd-arg">
              {arg}
            </text>
            <rect
              x="56"
              y={y + 8}
              width="172"
              height="1"
              fill="rgba(255,255,255,0.05)"
            />
          </g>
        );
      })}
      <rect
        x="56"
        y="222"
        width="8"
        height="14"
        fill="#F0CF9E"
        className="ns-pulse"
      />
    </svg>
  );
}

export function StudyNorthStar() {
  const stars = useMemo(() => {
    const rng = mulberry32(7);
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: rng() * 320,
      y: rng() * 320,
      r: 0.5 + rng() * 1.4,
      o: 0.25 + rng() * 0.5,
    }));
  }, []);
  return (
    <svg viewBox="0 0 320 320" className="ns-art-svg" aria-hidden="true">
      <defs>
        <radialGradient id="nsHaloS" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cdd9ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6E8BFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#dfe6f5"
          opacity={s.o}
        />
      ))}
      <circle cx="190" cy="120" r="40" fill="url(#nsHaloS)" />
      <path
        d="M40 270 Q120 200 190 120"
        fill="none"
        stroke="rgba(226,177,124,0.4)"
        strokeDasharray="3 6"
        className="ns-signal"
      />
      <line
        x1="170"
        y1="120"
        x2="210"
        y2="120"
        stroke="rgba(205,217,255,0.5)"
        strokeWidth="0.75"
      />
      <line
        x1="190"
        y1="100"
        x2="190"
        y2="140"
        stroke="rgba(205,217,255,0.5)"
        strokeWidth="0.75"
      />
      <circle cx="190" cy="120" r="2.6" fill="#fff" />
      <circle cx="40" cy="270" r="2.4" fill="#F0CF9E" />
    </svg>
  );
}
