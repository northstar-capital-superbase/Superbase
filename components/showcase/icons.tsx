import type { GlyphKind } from "./types";

export function StarGlyph({
  color = "#cdd9ff",
  size = 18,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 1.5 L10.4 7.6 L16.5 9 L10.4 10.4 L9 16.5 L7.6 10.4 L1.5 9 L7.6 7.6 Z"
        fill={color}
      />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 7h9 M7.5 3l4 4-4 4" />
    </svg>
  );
}

export function Glyph({ kind }: { kind: GlyphKind }) {
  const c = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const m: Record<GlyphKind, JSX.Element> = {
    agents: (
      <svg viewBox="0 0 32 32" {...c}>
        <circle cx="16" cy="16" r="3" />
        <circle cx="8" cy="8" r="2.4" />
        <circle cx="24" cy="8" r="2.4" />
        <circle cx="8" cy="24" r="2.4" />
        <circle cx="24" cy="24" r="2.4" />
        <path d="M9.7 9.7 L14 14 M22.3 9.7 L18 14 M9.7 22.3 L14 18 M22.3 22.3 L18 18" />
      </svg>
    ),
    portfolio: (
      <svg viewBox="0 0 32 32" {...c}>
        <rect x="6" y="6" width="20" height="6" rx="1.4" />
        <rect x="6" y="14" width="12" height="5" rx="1.4" />
        <rect x="6" y="21" width="16" height="5" rx="1.4" />
      </svg>
    ),
    workflows: (
      <svg viewBox="0 0 32 32" {...c}>
        <circle cx="8" cy="9" r="2.4" />
        <circle cx="24" cy="9" r="2.4" />
        <circle cx="16" cy="23" r="2.4" />
        <path d="M10.4 9H24 M8 11.4 V18 a3 3 0 0 0 3 3h2.6 M24 11.4 V18 a3 3 0 0 1-3 3h-2.6" />
      </svg>
    ),
    infra: (
      <svg viewBox="0 0 32 32" {...c}>
        <path d="M16 4 L26 9 L16 14 L6 9 Z" />
        <path
          d="M6 16 L16 21 L26 16 M6 22 L16 27 L26 22"
          opacity="0.6"
        />
      </svg>
    ),
    memory: (
      <svg viewBox="0 0 32 32" {...c}>
        <rect x="7" y="7" width="18" height="18" rx="2.5" />
        <path d="M3 12h4 M3 20h4 M25 12h4 M25 20h4 M12 3v4 M20 3v4 M12 25v4 M20 25v4" />
        <rect x="13" y="13" width="6" height="6" rx="1" />
      </svg>
    ),
    orchestration: (
      <svg viewBox="0 0 32 32" {...c}>
        <circle cx="16" cy="16" r="3" />
        <circle cx="16" cy="16" r="9" strokeDasharray="2 4" />
        <path d="M16 7v-3 M16 28v-3 M7 16H4 M28 16h-3" />
      </svg>
    ),
  };
  return m[kind];
}
