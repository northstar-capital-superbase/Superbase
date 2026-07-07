"use client";

import "./mobile-console.css";

// Small chip surfaced in the composer area. Tapping it opens the Shared Memory
// sheet. Shared memory is otherwise not a permanent section on mobile.
export function MemoryContextChip({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="mchip" onClick={onOpen} aria-haspopup="dialog">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16M9 5v14" />
      </svg>
      Context loaded <span className="mchip-dot">·</span> {count}{" "}
      {count === 1 ? "memory" : "memories"}
    </button>
  );
}
