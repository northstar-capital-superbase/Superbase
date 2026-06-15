"use client";

import { useId, useMemo } from "react";

// Reusable area sparkline with a soft gradient fill.
export function Sparkline({
  data,
  color = "#6e8bff",
  height = 84,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const { line, area } = useMemo(() => {
    const w = 320,
      h = 84,
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
      viewBox="0 0 320 84"
      preserveAspectRatio="none"
      className="nx-spark"
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// Half-circle confidence gauge with an aurora arc.
export function ConfidenceGauge({ pct }: { pct: number }) {
  const gid = useId().replace(/:/g, "");
  // Semicircle from 180° → 360°, radius r, stroke 12.
  const w = 200,
    r = 86,
    cx = w / 2,
    cy = 100,
    sw = 13;
  const semi = Math.PI * r; // arc length of a half circle
  const off = semi * (1 - pct / 100);
  const arc = (cxv: number, cyv: number, rv: number) =>
    `M ${cxv - rv} ${cyv} A ${rv} ${rv} 0 0 1 ${cxv + rv} ${cyv}`;

  return (
    <svg
      viewBox="0 0 200 116"
      className="nx-gauge-svg"
      width="200"
      height="116"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4d6bff" />
          <stop offset="55%" stopColor="#6e8bff" />
          <stop offset="100%" stopColor="#9db4ff" />
        </linearGradient>
      </defs>
      <path
        d={arc(cx, cy, r)}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <path
        d={arc(cx, cy, r)}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={semi}
        strokeDashoffset={off}
        style={{
          transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)",
          filter: "drop-shadow(0 0 7px rgba(110,139,255,0.55))",
        }}
      />
    </svg>
  );
}
