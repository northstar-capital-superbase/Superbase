import type { ReactNode } from "react";
import { OsSidebar } from "./OsSidebar";
import "./os-shell.css";

// Shared OS chrome: sidebar rail + content area. Used by /labs, /settings and
// /connections so navigation stays consistent across every OS surface.
export function OsShell({ children }: { children: ReactNode }) {
  return (
    <div className="lx-os-shell">
      <OsSidebar />
      <div className="lx-os-main">{children}</div>
    </div>
  );
}
