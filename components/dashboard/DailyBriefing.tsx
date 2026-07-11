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
    <section className="lx-card cc-briefing" aria-label="Daily briefing">
      <span className="lx-eyebrow">Daily briefing</span>
      {loading ? (
        <div className="cc-briefing-loading" aria-hidden="true">
          <Skeleton width="92%" height={16} />
          <Skeleton width="70%" height={16} style={{ marginTop: 8 }} />
        </div>
      ) : (
        <p className="cc-briefing-text">{buildBriefing(signals)}</p>
      )}
    </section>
  );
}
