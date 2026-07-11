"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui";
import type { ChatSummary } from "@/components/labs/useChatHistory";
import { CcSection } from "./CcSection";

// Real, client-side activity: the user's own Lab Console sessions (already
// persisted per-account in localStorage). No fabricated events — if there's no
// history we say so plainly. The timeline is capped so the home stays calm.
const MAX_VISIBLE = 5;

export function RecentActivity({ history }: { history: ChatSummary[] }) {
  const items = history.slice(0, MAX_VISIBLE);

  return (
    <CcSection
      label="Recent activity"
      bodyClassName={items.length ? "cc-body cc-body--flush" : "cc-body"}
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<PulseIcon />}
          title="No activity yet"
          description="Your work will appear here — start a Lab Console session to begin."
        />
      ) : (
        <ol className="cc-timeline">
          {items.map((chat) => (
            <li key={chat.id} className="cc-event">
              <span className="cc-event-dot" aria-hidden="true" />
              <Link href="/labs/console" className="cc-event-main">
                <span className="cc-event-title">{chat.title}</span>
                <span className="cc-event-meta">
                  Lab session · <time dateTime={chat.createdAt}>{relativeTime(chat.createdAt)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </CcSection>
  );
}

// Compact "2h ago" / "3d ago" formatting. Falls back to the raw date on parse
// failure so we never render "NaN".
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
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
