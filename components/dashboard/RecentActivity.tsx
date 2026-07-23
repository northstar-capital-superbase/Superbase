"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui";
import type { ChatSummary } from "@/components/labs/useChatHistory";
import {
  activityFromChatHistory,
  relativeTime,
  ACTIVITY_KIND_LABEL,
} from "@/lib/dashboard/activity";
import { CcSection } from "./CcSection";

// Real, client-side activity: the user's own Lab Console sessions (already
// persisted per-account in localStorage). No fabricated events — if there's no
// history we say so plainly. The timeline is capped so the home stays calm.
// Events carry a `kind` (see lib/dashboard/activity) so agent runs, memory
// updates, portfolio analysis, workflows, research, and auth can join this
// same timeline later without a redesign.
const MAX_VISIBLE = 5;

export function RecentActivity({ history }: { history: ChatSummary[] }) {
  const events = activityFromChatHistory(history).slice(0, MAX_VISIBLE);

  return (
    <CcSection
      label="Recent activity"
      bodyClassName={events.length ? "cc-body cc-body--flush" : "cc-body"}
    >
      {events.length === 0 ? (
        <EmptyState
          icon={<PulseIcon />}
          title="No activity yet"
          description="Your work will appear here — start a Lab Console session to begin."
        />
      ) : (
        <ol className="cc-timeline">
          {events.map((event) => (
            <li key={event.id} className="cc-event">
              <span className={`cc-event-dot cc-event-dot--${event.kind}`} aria-hidden="true" />
              <Link href={event.href ?? "/labs/console"} className="cc-event-main">
                <span className="cc-event-title">{event.title}</span>
                <span className="cc-event-meta">
                  {ACTIVITY_KIND_LABEL[event.kind]} ·{" "}
                  <time dateTime={event.timestamp}>{relativeTime(event.timestamp)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </CcSection>
  );
}

function PulseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}
