"use client";

import { Skeleton } from "@/components/ui";
import { buildBriefing, type CommandCenterSignals } from "@/lib/dashboard/briefing";

// One calm, honest briefing sentence derived from real runtime/auth signals.
// While the runtime probe is still loading we show a quiet placeholder rather
// than a misleading "not configured" message.
export function DailyBriefing({
  signals,
  loading,
}: {
  signals: CommandCenterSignals;
  loading: boolean;
}) {
  return (
    <section
      className="lx-card cc-briefing"
      aria-labelledby="daily-briefing-heading"
      aria-busy={loading || undefined}
    >
      <h2 id="daily-briefing-heading" className="lx-eyebrow">Daily briefing</h2>
      {loading ? (
        <>
          <span className="cc-sr-only" role="status">Loading daily briefing</span>
          <div className="cc-briefing-loading" aria-hidden="true">
            <Skeleton width="92%" height={16} />
            <Skeleton width="70%" height={16} style={{ marginTop: 8 }} />
          </div>
        </>
      ) : (
        <p className="cc-briefing-text">{buildBriefing(signals)}</p>
      )}
    </section>
  );
}
