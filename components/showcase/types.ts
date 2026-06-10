export type MockUser = {
  name: string;
  email: string;
  initials: string;
};

export type ShowcaseView = "home" | "login" | "dashboard";

export type StatusKey =
  | "executed"
  | "ok"
  | "watching"
  | "queued"
  | "building"
  | "hold";

export type GlyphKind =
  | "agents"
  | "portfolio"
  | "workflows"
  | "infra"
  | "memory"
  | "orchestration";

export const STATUS: Record<
  StatusKey,
  { c: string; l: string }
> = {
  executed: { c: "#7FB39B", l: "Executed" },
  ok: { c: "#7FB39B", l: "OK" },
  watching: { c: "#E2B17C", l: "Watching" },
  queued: { c: "#E2B17C", l: "Queued" },
  building: { c: "#E2B17C", l: "Building" },
  hold: { c: "#8A90A0", l: "Hold" },
};

export const MOCK = {
  user: { name: "Andrew", email: "andrew@northstar.os", initials: "A" },
  netWorth: {
    value: 28450,
    deltaPct: 3.2,
    deltaAbs: 880,
    assets: 31200,
    liabilities: 2750,
    history: [
      21100, 21600, 22050, 22900, 23400, 24100, 24800, 25600, 26300, 27100,
      27570, 28450,
    ],
  },
  emergency: { current: 4200, target: 9000, months: 2.8, targetMonths: 6 },
  allocation: [
    { ticker: "VOO", name: "S&P 500", pct: 55, color: "#6E8BFF" },
    { ticker: "QQQM", name: "Nasdaq 100", pct: 25, color: "#E2B17C" },
    { ticker: "VXUS", name: "Total Intl", pct: 20, color: "#7FB39B" },
  ],
  goals: [
    { name: "Emergency Fund", current: 4200, target: 9000 },
    { name: "Roth IRA · 2025 room", current: 1500, target: 7000 },
    { name: "Brokerage core", current: 12800, target: 20000 },
  ],
  agents: [
    {
      agent: "ALLOCATOR",
      action: "Routed $400 surplus → Brokerage",
      time: "2m ago",
      status: "executed" as const,
    },
    {
      agent: "RISK",
      action: "Allocation within 2% of target",
      time: "1h ago",
      status: "ok" as const,
    },
    {
      agent: "REBALANCE",
      action: "Flagged QQQM +1.4% drift",
      time: "3h ago",
      status: "watching" as const,
    },
    {
      agent: "ALLOCATOR",
      action: "Scheduled Roth contribution $250",
      time: "yesterday",
      status: "queued" as const,
    },
    {
      agent: "RISK",
      action: "Verified 6-month buffer floor",
      time: "yesterday",
      status: "ok" as const,
    },
  ],
  decisions: [
    {
      date: "Jun 07",
      title: "Routed surplus to Brokerage",
      detail: "$400 deployed after buffer maintained",
      outcome: "executed" as const,
    },
    {
      date: "Jun 03",
      title: "Held emergency buffer",
      detail: "Below 6-month target — no new risk taken",
      outcome: "hold" as const,
    },
    {
      date: "Jun 01",
      title: "Funded Roth IRA",
      detail: "$250 monthly contribution routed",
      outcome: "executed" as const,
    },
    {
      date: "May 28",
      title: "Rebalanced toward target",
      detail: "Trimmed QQQM by 1.0%",
      outcome: "executed" as const,
    },
  ],
};

export const usd = (n: number) => "$" + n.toLocaleString("en-US");
