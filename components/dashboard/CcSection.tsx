"use client";

import { useId, type ReactNode } from "react";

// Shared Command Center section shell: a labelled card (mono eyebrow + optional
// trailing meta) with a padded body. Keeps every home section visually cohesive
// and reuses the existing .lx-card / .lx-eyebrow design tokens instead of
// inventing a new card language per widget.
export function CcSection({
  label,
  meta,
  children,
  bodyClassName,
  busy = false,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  busy?: boolean;
}) {
  const headingId = useId();
  return (
    <section
      className="lx-card cc-section"
      aria-labelledby={headingId}
      aria-busy={busy || undefined}
    >
      <div className="lx-card-head">
        <h2 id={headingId} className="lx-eyebrow">{label}</h2>
        {meta ? <span className="lx-card-head-meta">{meta}</span> : null}
      </div>
      <div className={bodyClassName ?? "cc-body"}>
        {busy ? <span className="cc-sr-only" role="status">Loading {label.toLowerCase()}</span> : null}
        {children}
      </div>
    </section>
  );
}
