import type { ChatSummary } from "@/components/labs/useChatHistory";

// Pure Recent Activity data contract. Today the only real activity source is
// the user's own Lab Console sessions (kind "lab_session") — everything else
// is a defined-but-unpopulated future kind so agent runs, memory updates,
// portfolio analysis, workflow runs, research, and auth events can plug in
// later without changing the timeline's shape or rendering.
export type ActivityKind =
  | "lab_session"
  | "agent_run"
  | "memory_update"
  | "portfolio_analysis"
  | "workflow"
  | "research"
  | "auth";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  /** ISO timestamp. */
  timestamp: string;
  href?: string;
}

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  lab_session: "Lab session",
  agent_run: "Agent run",
  memory_update: "Memory updated",
  portfolio_analysis: "Portfolio analysis",
  workflow: "Workflow completed",
  research: "Research finished",
  auth: "Account",
};

// The only real activity source wired up today: the user's own Lab Console
// history (already persisted per-account — see useChatHistory).
export function activityFromChatHistory(history: ChatSummary[]): ActivityEvent[] {
  return history.map((chat) => ({
    id: chat.id,
    kind: "lab_session" as const,
    title: chat.title,
    timestamp: chat.createdAt,
    href: "/labs/console",
  }));
}

// Compact "2h ago" / "3d ago" formatting. Falls back to a safe label on parse
// failure so we never render "NaN".
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = now.getTime() - then;
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
