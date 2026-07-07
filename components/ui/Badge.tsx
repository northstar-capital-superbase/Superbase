"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import "./ui.css";

export type StatusTone = "ok" | "info" | "warn" | "danger" | "muted" | "pending";

// Status pill used for connection / integration / runtime states.
// Tones map to app states: ok=connected, info=ready/needs action,
// pending=checking, warn=degraded, danger=error, muted=off/not configured.
export function StatusPill({
  tone,
  children,
  className,
  title,
}: {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span className={clsx("ui-pill", `ui-pill--${tone}`, className)} title={title}>
      <span className="ui-pill-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
