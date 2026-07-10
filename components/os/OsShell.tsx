import type { ReactNode } from "react";
import { OsSidebar } from "./OsSidebar";
import { RuntimeStatusProvider } from "@/components/useRuntimeStatus";
import "./os-shell.css";

// Shared OS chrome: sidebar rail + content area. Used by /labs, /settings and
// /connections so navigation stays consistent across every OS surface.
// RuntimeStatusProvider is mounted once here so the sidebar footer and any
// nested page (e.g. Connections) share a single /api/health + /api/trading
// read instead of each probing independently.
export function OsShell({ children }: { children: ReactNode }) {
  return (
    <RuntimeStatusProvider>
      <div className="lx-os-shell">
        <OsSidebar />
        <div className="lx-os-main">{children}</div>
      </div>
    </RuntimeStatusProvider>
  );
}
