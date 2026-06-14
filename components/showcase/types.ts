// Single-flow section router: home → overview (the OS hub) → robinhood
// (agentic trading) → labs (the multi-agent lab preview).
export type StudioSection = "home" | "overview" | "robinhood" | "labs";

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

// ── Robinhood Agentic ──────────────────────────────────────────────────────
// Mock data powering the agentic-trading surface: a live portfolio, the
// agent's confidence read, the notes it writes as it reasons, and a running
// status feed of what it's doing right now.

export type AgentMood = "analyzing" | "acting" | "watching" | "resting";

export type TradeNote = {
  id: string;
  time: string;
  title: string;
  body: string;
  tag: string;
  confidence: number; // 0–100 for this specific call
  tone: "bull" | "bear" | "neutral";
};

export type ActivityState = "done" | "active" | "queued";

export type AgentActivity = {
  time: string;
  label: string;
  detail: string;
  state: ActivityState;
};

export type Position = {
  ticker: string;
  name: string;
  shares: number;
  price: number;
  dayPct: number;
  value: number;
  weight: number;
  color: string;
};

export type AgentOrder = {
  side: "BUY" | "SELL";
  ticker: string;
  qty: number;
  price: number;
  status: "filled" | "submitted" | "queued";
  time: string;
};

export const ROBINHOOD = {
  mode: "advisory" as "advisory" | "auto",
  mood: "analyzing" as AgentMood,
  account: {
    value: 28450,
    buyingPower: 3120,
    dayPct: 1.18,
    dayAbs: 332,
    history: [
      26100, 26380, 26210, 26640, 26920, 27110, 26980, 27340, 27620, 27510,
      27880, 28120, 28010, 28280, 28450,
    ],
  },
  // The headline read: how convinced the agent is in its current posture.
  confidence: {
    level: 78,
    label: "High conviction",
    posture: "Constructive · adding on strength",
    trend: +6,
    history: [54, 58, 61, 59, 64, 68, 66, 70, 73, 71, 74, 78],
  },
  positions: [
    {
      ticker: "VOO",
      name: "S&P 500 ETF",
      shares: 21.4,
      price: 512.3,
      dayPct: 0.9,
      value: 10963,
      weight: 38,
      color: "#4D6BFF",
    },
    {
      ticker: "QQQM",
      name: "Nasdaq 100 ETF",
      shares: 38.2,
      price: 198.7,
      dayPct: 1.6,
      value: 7591,
      weight: 27,
      color: "#8AA6FF",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA",
      shares: 9,
      price: 131.4,
      dayPct: 2.7,
      value: 1183,
      weight: 12,
      color: "#9DB4FF",
    },
    {
      ticker: "VXUS",
      name: "Total Intl",
      shares: 84,
      price: 64.2,
      dayPct: -0.3,
      value: 5393,
      weight: 19,
      color: "#E2B17C",
    },
    {
      ticker: "CASH",
      name: "Buying power",
      shares: 1,
      price: 1320,
      dayPct: 0,
      value: 1320,
      weight: 4,
      color: "#4B5160",
    },
  ] as Position[],
  orders: [
    {
      side: "BUY",
      ticker: "NVDA",
      qty: 2,
      price: 130.8,
      status: "filled",
      time: "09:41",
    },
    {
      side: "BUY",
      ticker: "VOO",
      qty: 0.6,
      price: 511.2,
      status: "filled",
      time: "09:38",
    },
    {
      side: "SELL",
      ticker: "VXUS",
      qty: 8,
      price: 64.4,
      status: "submitted",
      time: "now",
    },
    {
      side: "BUY",
      ticker: "QQQM",
      qty: 1.2,
      price: 198.4,
      status: "queued",
      time: "10:00",
    },
  ] as AgentOrder[],
  // What the agent is doing right now — the "how it's doing" feed.
  activity: [
    {
      time: "now",
      label: "Rebalancing toward target weights",
      detail: "Trimming VXUS 1.0% · routing into VOO / QQQM",
      state: "active",
    },
    {
      time: "1m ago",
      label: "Filled NVDA add",
      detail: "Bought 2 @ $130.80 — momentum + earnings drift",
      state: "done",
    },
    {
      time: "12m ago",
      label: "Scanned 4 watchlist names",
      detail: "No setups cleared the entry bar — holding cash",
      state: "done",
    },
    {
      time: "10:00",
      label: "Scheduled QQQM contribution",
      detail: "DCA $250 queued for the open",
      state: "queued",
    },
  ] as AgentActivity[],
  // The notes the agent writes as it reasons — viewable reasoning trail.
  notes: [
    {
      id: "n1",
      time: "09:42",
      title: "Adding to NVDA into strength",
      body: "Breadth confirmed the move and IV stayed contained. Sized the add to keep single-name weight under the 12% cap. Stop sits below the 20-day.",
      tag: "EXECUTION",
      confidence: 81,
      tone: "bull",
    },
    {
      id: "n2",
      time: "09:30",
      title: "Trimming international exposure",
      body: "VXUS lagging on a stronger dollar; relative strength keeps fading. Rotating a slice toward US large-cap to track the target model.",
      tag: "ROTATION",
      confidence: 72,
      tone: "neutral",
    },
    {
      id: "n3",
      time: "08:55",
      title: "Holding cash buffer at 4%",
      body: "Macro print due midday. Keeping dry powder rather than forcing entries — will deploy on a clean pullback to support.",
      tag: "RISK",
      confidence: 88,
      tone: "bear",
    },
  ] as TradeNote[],
};

export const MOODS: Record<AgentMood, { label: string; c: string }> = {
  analyzing: { label: "Analyzing", c: "#6E8BFF" },
  acting: { label: "Executing", c: "#3FE0A6" },
  watching: { label: "Watching", c: "#E2B17C" },
  resting: { label: "Idle", c: "#8A90A0" },
};
