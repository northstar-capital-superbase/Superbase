"use client";

// Small reusable disclosure indicator for expand/collapse controls (trace
// toggles, collapsible panels, nav groups). Two glyph variants cover the
// shapes already in use — "chevron" (rotates from pointing right to pointing
// down) and "caret" (rotates from pointing down to pointing up) — so existing
// call sites keep their exact appearance while sharing one component and the
// shared motion tokens instead of a hardcoded transition duration.

type ChevronVariant = "chevron" | "caret";

const GLYPH: Record<
  ChevronVariant,
  { viewBox: string; path: string; strokeWidth: number; defaultRotation: number }
> = {
  chevron: { viewBox: "0 0 24 24", path: "M9 6l6 6-6 6", strokeWidth: 2, defaultRotation: 90 },
  caret: { viewBox: "0 0 10 10", path: "M2 3.5 5 6.5 8 3.5", strokeWidth: 1.6, defaultRotation: 180 },
};

export function DisclosureChevron({
  open,
  variant = "chevron",
  size = 12,
  openRotation,
  className,
}: {
  open: boolean;
  variant?: ChevronVariant;
  size?: number;
  /** Degrees to rotate when open. Defaults per variant (90 for chevron, 180 for caret). */
  openRotation?: number;
  className?: string;
}) {
  const glyph = GLYPH[variant];
  const rotation = openRotation ?? glyph.defaultRotation;
  return (
    <svg
      width={size}
      height={size}
      viewBox={glyph.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={glyph.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{
        transform: open ? `rotate(${rotation}deg)` : undefined,
        transition: "transform var(--os-dur) var(--os-ease)",
      }}
    >
      <path d={glyph.path} />
    </svg>
  );
}
