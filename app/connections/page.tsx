import type { Metadata } from "next";
import Link from "next/link";
import { Connections } from "@/components/dashboard/Connections";
import "@/components/dashboard/labs.css";

export const metadata: Metadata = {
  title: "Connections — Northstar OS",
  description:
    "Connection status and live checks for the language model, Supabase memory, and Robinhood Agentic trading.",
};

// Thin page around the existing Connections cockpit so the sidebar's
// Connections / MCP Integrations entries resolve to a real route.
export default function ConnectionsPage() {
  return (
    <div className="lx">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />

      <main className="lx-main">
        <div className="lx-head">
          <div>
            <h1 className="lx-title">Connections</h1>
            <p className="lx-sub">
              Every service the crew depends on — verified with live probes, not
              assumptions.
            </p>
          </div>
          <Link href="/labs" className="lx-tour">
            ← Command Center
          </Link>
        </div>

        <Connections />
      </main>
    </div>
  );
}
