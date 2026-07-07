"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import "./ui.css";

const ICONS: Record<"info" | "warning" | "danger", ReactNode> = {
  info: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.5v3.5M8 5.2v.1" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2.2 14.6 13.4H1.4L8 2.2zM8 6.8v3M8 12v.1" />
    </svg>
  ),
  danger: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" />
    </svg>
  ),
};

export function Alert({
  tone = "info",
  children,
  className,
  role,
}: {
  tone?: "info" | "warning" | "danger";
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  return (
    <div
      className={clsx("ui-alert", `ui-alert--${tone}`, className)}
      role={role ?? (tone === "info" ? "status" : "alert")}
    >
      <span className="ui-alert-icon">{ICONS[tone]}</span>
      <div>{children}</div>
    </div>
  );
}

// Visible NEEDS_OWNER_INPUT marker: renders an owner-action note in the UI so
// manual setup steps (API keys, OAuth, dashboard config) are impossible to miss.
export function OwnerNote({ children }: { children: ReactNode }) {
  return (
    <div className="ui-owner-note">
      <div>
        <code>NEEDS_OWNER_INPUT</code> — {children}
      </div>
    </div>
  );
}
