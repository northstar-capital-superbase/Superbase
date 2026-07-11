// Pure, isomorphic Command Center derivations — no React/Supabase/Next imports,
// so they run identically on the client and in tests. Every output is derived
// only from real runtime/auth signals; nothing here fabricates portfolio
// values, recommendations, or activity. When a signal is unknown the copy stays
// honest ("ready", "not connected yet") rather than inventing state.

export interface CommandCenterSignals {
  /** LLM model key present — the crew can actually run. */
  configured: boolean;
  /** Shared-memory backend, or null while the runtime probe is still loading. */
  memory: "supabase" | "in-memory" | null;
  /** A brokerage (Robinhood MCP) is connected for this deployment. */
  tradingEnabled: boolean;
  /** The signed-in user has set a display name. */
  hasDisplayName: boolean;
  /** The user has at least one saved Lab Console session. */
  hasSessions: boolean;
}

// One calm, honest briefing sentence (occasionally two short ones) describing
// the user's current situation. It never claims work that hasn't happened.
export function buildBriefing(s: CommandCenterSignals): string {
  if (!s.configured) {
    return "Northstar is ready. Add a model key in Connections to bring the crew online.";
  }

  const parts: string[] = [];
  if (s.tradingEnabled) {
    parts.push("Your account is configured and a brokerage is connected.");
  } else {
    parts.push("Your account is configured.");
    parts.push("No financial accounts are connected yet.");
  }

  if (s.hasSessions) {
    parts.push("Pick up where you left off or start a new conversation.");
  } else if (s.tradingEnabled) {
    parts.push("Start a conversation to put the crew to work.");
  } else {
    parts.push("Start a conversation or connect your first brokerage.");
  }

  return parts.join(" ");
}

export interface PendingItem {
  id: "model-key" | "profile" | "brokerage";
  title: string;
  description: string;
  href: string;
  cta: string;
}

// Only real, actionable setup items — each maps to a concrete destination the
// user can act on now. Returns [] when nothing is pending (the calm "all set"
// state). Ordered by how blocking each item is: without a model key the crew
// cannot run at all, so it leads.
export function buildPendingItems(s: CommandCenterSignals): PendingItem[] {
  const items: PendingItem[] = [];

  if (!s.configured) {
    items.push({
      id: "model-key",
      title: "Add a model key",
      description: "Connect a language model so the crew can start working.",
      href: "/connections",
      cta: "Open Connections",
    });
  }

  if (!s.hasDisplayName) {
    items.push({
      id: "profile",
      title: "Complete your profile",
      description: "Add a display name so Northstar can greet you by name.",
      href: "/settings",
      cta: "Open Settings",
    });
  }

  if (!s.tradingEnabled) {
    items.push({
      id: "brokerage",
      title: "Connect a brokerage",
      description: "Link Robinhood to unlock portfolio insights and the Trader agent.",
      href: "/connections",
      cta: "Connect Robinhood",
    });
  }

  return items;
}
