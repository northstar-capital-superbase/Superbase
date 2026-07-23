"use client";

import Link from "next/link";
import { Skeleton, StatusPill } from "@/components/ui";
import { CcSection } from "./CcSection";

// Compact portfolio snapshot. Northstar never shows placeholder balances: when
// no brokerage is connected we say "Portfolio unavailable" and point to the
// connect flow. When a brokerage IS connected we acknowledge the connection but
// still do not fabricate values — live balances are read inside the Lab Console
// where an authorized session exists. This mirrors the sidebar's honesty.
export function PortfolioSnapshot({
  loading,
  connected,
}: {
  loading: boolean;
  connected: boolean;
}) {
  return (
    <CcSection
      label="Portfolio"
      busy={loading}
      meta={
        loading ? (
          <Skeleton width={70} height={20} style={{ borderRadius: 999 }} />
        ) : (
          <StatusPill tone={connected ? "ok" : "muted"}>
            {connected ? "Connected" : "Not connected"}
          </StatusPill>
        )
      }
    >
      {loading ? (
        <div aria-hidden="true">
          <Skeleton width="55%" height={14} />
          <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
        </div>
      ) : connected ? (
        <div className="cc-snapshot">
          <p className="cc-snapshot-title">Robinhood connected</p>
          <p className="cc-snapshot-note">
            Live balances and positions are available inside the Lab Console, where
            an authorized brokerage session runs.
          </p>
        </div>
      ) : (
        <div className="cc-snapshot">
          <p className="cc-snapshot-title">Portfolio unavailable</p>
          <p className="cc-snapshot-note">
            Connect Robinhood to begin. Northstar never shows placeholder balances.
          </p>
          <Link href="/connections" className="cc-inline-action">
            Connect Robinhood
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </CcSection>
  );
}
