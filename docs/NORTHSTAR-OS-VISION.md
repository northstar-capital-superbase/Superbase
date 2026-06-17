# Northstar OS — Product Vision & Design Specification

> **Status:** Vision / North Star (v1.0)
> **Authors:** Product · Creative Direction · UX Architecture
> **Audience:** Founders, design, engineering, and anyone who has to say "no" to a feature
> **One sentence:** Northstar OS is not a finance dashboard. It is the intelligence layer between a human and every financial decision they will ever make.

---

## 0. How to read this document

This is a *north star*, not a backlog. It describes what **should exist**, then tells you what to build first. Where the current codebase already gets something right, I say so and build on it. Where the reference design (and most of fintech) is weak, I say so bluntly. If a section reads as opinionated, that is deliberate — a product with no opinion becomes a settings screen with a logo.

Two artifacts grounded this work:

1. **The reference sidebar** ("Kangaroo Inc.") — a clean, modern, *generic* SaaS shell. Useful as a foil.
2. **The design language already in this repo** — `components/showcase/showcase.css`, `OsDashboard.tsx`, `Sidebar.tsx`. This is real, it is good, and the vision below extends its token system rather than inventing a new one.

The existing tokens we are committing to and evolving:

```
--ns-bg:        #06070A   /* near-black, the void the OS floats in   */
--ns-surface:   #0C0E13   /* card / panel                            */
--ns-surface-2: #11141B   /* raised / hover                          */
--ns-line:      rgba(255,255,255,.08)
--ns-text:      #EDEFF4   /* primary                                 */
--ns-text-2:    #9AA0B0   /* secondary                               */
--ns-text-3:    #6B7180   /* tertiary / mono labels                  */
--ns-accent:    #6E8BFF   /* the "intelligence" blue                 */
--ns-flow:      #E2B17C   /* amber — money in motion, execution      */
--ns-good:      #7FB39B   /* sage green — confirmed, healthy, synced */
```

Everything downstream — iconography, typography, animation — is in service of these.

---

## 1. Design Philosophy

### The thesis

Most financial software answers the question **"what happened?"** Northstar OS answers **"what should I do, and may I do it for you?"** That single shift — from *reporting* to *operating* — changes every design decision.

We are building a **command center**, not a dashboard. The difference:

| Dashboard | Command Center (Northstar OS) |
| --- | --- |
| You read it | It briefs you |
| Shows state | Proposes action |
| You navigate to data | Intelligence comes to you |
| Charts are the product | Charts are evidence behind a recommendation |
| Success = engagement (time on screen) | Success = *decisions resolved with confidence*, time on screen trending **down** |

### Five principles

**1. The loop is the product.**
`Observe → Understand → Recommend → Approve → Execute → Remember`. Every screen must declare which stage of the loop it serves. If a pixel doesn't advance the loop, it is decoration. The loop is also the system's promise of safety: nothing is executed that was not first observed, understood, recommended, and **approved**.

**2. Calm by default, intense on demand.**
A financial command center that screams at you all day is a slot machine. Northstar is quiet when things are nominal and escalates with precision when they aren't. Color is *rationed*: green/amber/red are reserved for system state and money, never for decoration. A calm screen is a feature, not an empty one.

**3. Trust is the UI.**
Every recommendation shows its work: which agent, what evidence, what confidence, what it will cost, and what happens if you do nothing. An AI that acts on money without a visible, legible, reversible audit trail is a liability, not a product. "Trust me" is not an interaction pattern.

**4. The human holds the trigger.**
Automation earns autonomy gradually and visibly. Day one: the OS recommends, you approve everything. Over time, *you* grant standing authority for specific, bounded actions ("rebalance within 2% drift," "sweep idle cash above $5k into the ladder"). Autonomy is a dial the user turns, never a default we ship.

**5. Memory is the moat.**
A tool you can replace tomorrow has no memory of you. Northstar remembers every decision, every rationale, every thing you said you cared about — and uses it. The longer you operate it, the more it becomes *yours* and the more absurd it feels to start over elsewhere. This is the only durable competitive advantage; design must treat memory as a first-class surface, not a log file.

### The feeling

Close your eyes and the product should feel like **a quiet room with a brilliant analyst who already did the work, respects your time, never bluffs, and will not touch the controls without asking.** Apple gives us restraint and materials. Palantir gives us density-without-panic and the seriousness of consequential data. Bloomberg gives us information velocity. Arc gives us spatial calm and the courage to hide things. Linear gives us speed and keyboard-first respect for power users. Jarvis gives us the conversational, agentic soul. Northstar is the synthesis: **Jarvis with an audit trail.**

---

## 2. Information Architecture

### The mental model

The reference sidebar organizes by **noun/object** (Home, Analytics, Customers, Partners, Payouts). That is how you organize a *database admin tool*. Northstar organizes by **the loop and the user's intent**, because the user is not managing tables — they are operating capital.

Three planes, always present, that the user moves between:

```
                       ┌──────────────────────────────────────┐
                       │           COMMAND BAR (⌘K)            │  ← ambient, summonable anywhere
                       └──────────────────────────────────────┘

   PLANE 1: PRESENT          PLANE 2: INTELLIGENCE         PLANE 3: SYSTEM
   "What's true now"         "What should I do"            "How the OS runs for me"
   ───────────────           ─────────────────             ──────────────────
   • Command Center (home)   • Agents                      • Memory
   • Portfolio               • Workflows / Automations     • Connections (accounts)
   • Accounts & Cash         • Research                    • Approvals & Policies
   • Markets                 • Decisions (the log)         • Settings / Identity
```

### Primary navigation (the spine)

```
◆ Command Center      ← the home / morning brief / the loop, live
▣ Portfolio           ← holdings, allocation, performance, drift
◇ Agents              ← the workforce: status, what each is doing, autonomy
↻ Workflows           ← automations & playbooks (Observe→Execute recipes)
⌕ Research            ← deep-dives, theses, the OS's reasoning corpus
⊞ Decisions           ← the immutable ledger of everything decided & why
◰ Memory              ← what the OS knows about you (and can forget)
```

Then, demoted to the footer rail (utilities, not destinations):

```
⊟ Connections   ⚙ Settings   ? Help / Console
```

### IA rules we will not break

- **Max 7 primary destinations.** Beyond that, navigation becomes a search problem; solve it with ⌘K, not more sidebar rows.
- **Verbs over nouns where it matters.** "Decisions," not "History." "Connections," not "Integrations." The label should describe what the user *does* there.
- **Everything reachable in ≤2 levels.** Depth is where products go to die. If something needs level 3, it belongs inside a detail view, not the nav.
- **The Command Bar (⌘K) is the real IA.** The sidebar is for orientation and the 80% path; ⌘K is for the other 20% and for power users who never touch the mouse. Every object, action, agent, and setting is addressable from it.

---

## 3. The Sidebar (designed in full)

### What's wrong with the reference

The Kangaroo sidebar has five tells of generic SaaS, each of which we invert:

1. **Workspace switcher as hero.** The most prominent, top-anchored element is "which org am I in." For a personal/professional finance OS, the hero should be *system state and the single most important thing right now* — not org-switching, which is a once-a-session action.
2. **A dead vertical gap.** Half the rail is empty, then plugged with an upsell card. That space is the most valuable real estate in the app and it's being used to advertise. We fill it with *live intelligence* (agent pulse, the next decision awaiting you).
3. **Count badges as noise.** "Customers 6" — six what? Badges should encode *urgency and money*, not row counts. Our badges mean "3 decisions need you" or "drift exceeds policy," never "6 items exist."
4. **Marketing inside the tool.** A promo card ("Try it out ↗") in the operating surface. Northstar never sells to you inside the cockpit. Growth surfaces live in onboarding and Settings, never in the rail.
5. **No system status.** A finance OS that can move money must, at all times, answer: *am I connected, is the model live, what mode am I in (advisory/auto), is anything pending?* The reference shows none of this.

### The Northstar sidebar — spec

A **76px collapsed rail by default**, expanding to **248px** on hover/focus or pin. Collapsed-first is deliberate: the cockpit is the content; the rail is a tool you summon, à la Arc. Icons are legible alone; labels appear on expand.

```
┌─ collapsed 76px ──┐        ┌─ expanded 248px ──────────────────────┐
│                   │        │  ✦ NORTHSTAR        ◐ ADVISORY  ⌘K     │  ← brand · live mode · cmd hint
│       ✦           │        │  ───────────────────────────────────  │
│                   │        │                                        │
│   ● nominal       │        │  SYSTEM            ● ALL NOMINAL · 2s   │  ← live heartbeat, not decoration
│                   │        │                                        │
│   ◆               │        │  ◆  Command Center                     │  ← active: amber left-edge + glow
│   ▣               │        │  ▣  Portfolio              $1.42M       │  ← value lives in the nav, calm
│   ◇  ²            │        │  ◇  Agents          ◐ 2 working         │  ← live: "2 working", not "²"
│   ↻               │        │  ↻  Workflows              4 armed      │
│   ⌕               │        │  ⌕  Research                           │
│   ⊞  ³            │        │  ⊞  Decisions       ◆ 3 need you        │  ← amber dot = action required
│   ◰               │        │  ◰  Memory                             │
│                   │        │                                        │
│   ─────           │        │  ───────────────────────────────────  │
│                   │        │  NEXT FOR YOU                          │  ← the dead-gap, reclaimed
│   ◆ pulse         │        │  ┌─────────────────────────────────┐  │
│                   │        │  │ Rebalance drift 2.4% > 2.0%     │  │  ← the single most urgent decision
│                   │        │  │ Strategist · 84% confidence     │  │
│                   │        │  │ [ Review ]      in 2 days auto  │  │
│                   │        │  └─────────────────────────────────┘  │
│                   │        │                                        │
│   ⊟               │        │  ⊟  Connections      ● 4 linked        │
│   ⚙               │        │  ⚙  Settings                           │
│   ◷ DH            │        │  ◷  Dana Hill · admin@…                │  ← identity demoted to footer
└───────────────────┘        └────────────────────────────────────────┘
```

**Why each choice:**

- **Brand + live mode in the header, together.** `✦ NORTHSTAR · ◐ ADVISORY` tells you instantly who you're operating and *what it's allowed to do right now*. Mode is a one-click toggle to a confirmation sheet — never a silent switch.
- **A real heartbeat.** `● ALL NOMINAL · 2s` (last sync). When something degrades, this is the first thing that changes color. It is the EKG of the system.
- **Money and agent-state live in the nav rows.** `Portfolio $1.42M`, `Agents ◐ 2 working`, `Decisions ◆ 3 need you`. The nav is not just routing — it's a glanceable status board. This is the Bloomberg lesson: information density where the eye already rests.
- **"Next For You" reclaims the dead gap.** Instead of an upsell, the single highest-priority decision sits in the rail, always, with confidence and an *auto-execute countdown* if the user has granted standing authority. One click to review. This is the loop, made ambient.
- **Identity is demoted to a quiet footer chip.** Switching identity/household is rare; it does not deserve the crown. Click expands account/household switcher (the legitimately useful part of Kangaroo's workspace switcher) as a popover.
- **Active state = amber left-edge bar + soft glow**, never a heavy filled pill. Amber (`--ns-flow`) because the active section is "where flow is happening." Restraint: one accented element per rail at a time.

**Behavior:** keyboard-navigable (`g` then `c` → Command Center, Linear-style), respects `prefers-reduced-motion`, collapses to an overlay drawer under 920px. The rail never scrolls independently of meaning — if "Next For You" stacks, it shows the top item and a "+2 more" affordance, never an unbounded list.

---

## 4. The Command Center (home)

This is the screen people open Northstar to see. It must answer, in **under three seconds**: *Am I okay? What changed? What needs me?* — and let the user act without leaving.

It is **not a grid of metric cards** (the current `OsDashboard` is a good v0, but it's still a dashboard — read-only tiles). The Command Center is a **briefing that ends in actions.**

### Structure: a vertical brief, not a grid

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Good morning, Dana.                              NORTHSTAR OS · 06:42 ET  │
│  Net worth is up 1.2% overnight. Three things need you. Nothing is wrong.  │  ← one-sentence
│                                                                            │     state of the
│  ┌── THE LINE ────────────────────────────────────────────────────────┐   │     world, written
│  │  $1,420,338   ▲ 1.2% · +$16,840 (30d)        ╱╲      ╱╲╱╲          │   │     by the OS
│  │  Net worth                              ╱╲╱╲╱    ╲╱╲╱      ╲___     │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ◆ NEEDS YOU (3)                                              Resolve all → │  ← the action stack
│  ┌────────────────────────────────────────────────────────────────────┐   │     — THE point of
│  │ ◆ Rebalance: equity drift 2.4% > 2.0% policy        84% · Strategist│   │     the screen
│  │   Sell $18k VTI → buy $12k BND, $6k cash. Tax impact: +$0 (IRA).    │   │
│  │   If you do nothing: auto-executes in 2 days per your policy.       │   │
│  │   [ Approve ]   [ Modify ]   [ Snooze ]   [ Why? ]                  │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ ◆ Cash drag: $42k idle in checking, 0.1% APY    71% · Research      │   │
│  │   Sweep $37k → T-bill ladder (5.1%). Est. +$1,580/yr.   [ Review ] │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │ ◇ Review: NVDA thesis flagged — earnings shifted    Behavioral     │   │
│  │   Your stop-loss logic may be stale.                   [ Open ]    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ⟁ AGENT PULSE (live)                          ◰ WHAT I LEARNED          │  ← two columns:
│  ┌──────────────────────────────┐   ┌──────────────────────────────────┐ │     live work +
│  │ ◐ Research  scanning 14 filings│  │ "You prefer tax-efficiency over  │ │     memory updates
│  │ ● Strategist drafted rebalance │  │  raw return." — applied 3× today │ │
│  │ ◐ Behavioral checking your bias│  │ Added: 'avoid energy sector'     │ │
│  │ ○ Trader    idle · armed       │  │ from your note Tuesday.          │ │
│  └──────────────────────────────┘   └──────────────────────────────────┘ │
│                                                                            │
│  ⌕ Ask Northstar anything…                                          ⌘K   │  ← the conversational
└──────────────────────────────────────────────────────────────────────────┘     floor: always there
```

### Why this works

- **It opens with a sentence, not a number.** "Net worth is up 1.2% overnight. Three things need you. Nothing is wrong." A number requires interpretation; a sentence *is* the interpretation. This is the single most important differentiator from every fintech home screen — the OS has a point of view and states it plainly.
- **"Needs You" is the spine.** The action stack is ranked by *consequence × urgency × confidence*, not chronology. Each item is a complete decision unit: what, why, who proposed it, confidence, **what happens if you ignore it**, and the action buttons. Approve/Modify/Snooze/Why is the universal decision grammar of the whole OS (see §17).
- **"If you do nothing" is shown on every item.** This is the trust mechanic. The OS never hides the consequence of inaction, and never hides an impending auto-execution. Silence is never consent unless you explicitly made it so.
- **Agent Pulse makes the workforce visible.** You see the intelligence *working*, live (SSE — already wired in this repo via `chat/stream`). This is the Jarvis feeling: the system is alive and laboring on your behalf even when you're not looking.
- **"What I Learned" surfaces memory as it forms.** Every day the OS shows you what it now knows about you. This makes the moat *felt*, builds trust, and gives the user a place to correct misconceptions ("no, I don't avoid energy — sell that idea").
- **A conversational floor.** The bottom is always an open prompt. The Command Center is browsable *and* askable. You can read the brief or just type "should I sell NVDA?" and the loop runs.

**Empty/healthy state matters.** When nothing needs you, the screen says so with confidence and goes quiet: "All nominal. 4 agents on watch. Next scheduled review: Friday." A calm Command Center is the product working, not the product empty. We design the calm state with as much care as the busy one.

---

## 5. The Agent System

The agents are the **workforce**, and the existing repo already has the right bones: an Orchestrator that plans and delegates to Research, Strategist, Behavioral, and (when connected) Trader, all collaborating through shared memory. The vision elevates this from a "crew trace" into a **legible, governable team you manage.**

### Mental model: a desk of specialists

You don't manage prompts. You manage a **desk** — a small team of named specialists, each with a role, a current task, a track record, and an autonomy level *you* set.

```
┌─ AGENTS ───────────────────────────────────────────────────────────────┐
│                                                                          │
│  ◆ ORCHESTRATOR                                          ● coordinating  │
│  Plans the work, delegates, synthesizes. The chief of staff.             │
│  Today: ran 6 loops · 3 recommendations · 0 errors                       │
│                                                                          │
│  ── THE DESK ────────────────────────────────────────────────────────   │
│                                                                          │
│  ◇ RESEARCH        ◐ scanning 14 filings        autonomy: ▮▮▮▯▯ propose  │
│     Facts, filings, context. "Always show me the source."                │
│     Trust: 94% accepted (last 30 decisions)              [ Inspect → ]   │
│                                                                          │
│  ◇ STRATEGIST      ● drafted rebalance          autonomy: ▮▮▮▯▯ propose  │
│     Turns research into sequenced plans.                                  │
│     Trust: 88% accepted · 2 modified by you              [ Inspect → ]   │
│                                                                          │
│  ◇ BEHAVIORAL      ◐ checking your bias         autonomy: ▮▮▮▮▯ guardian │
│     Pressure-tests for your failure modes. Can VETO, never execute.      │
│     Caught 3 emotional trades this quarter.              [ Inspect → ]   │
│                                                                          │
│  ◇ TRADER          ○ idle · armed               autonomy: ▮▮▯▯▯ approve  │
│     Executes via Robinhood MCP. Cap: $5k/order · advisory mode.          │
│     Last order: none. Connected · last probe 4m ago.     [ Inspect → ]   │
│                                                                          │
│  + Hire a specialist (Tax · Estate · Real Estate · Crypto)               │
└──────────────────────────────────────────────────────────────────────────┘
```

### The five ideas that make this an "agent system," not a chatbot

1. **Each agent is a *character* with a stable identity, color, and remit.** (We already have the signal colors: Orchestrator blue, Strategist violet, Research green, Behavioral amber.) Consistency builds a relationship; you learn to trust Research's sourcing and respect Behavioral's vetoes. Anthropomorphize *just enough* to build trust, never enough to imply the AI is infallible.
2. **Autonomy is a per-agent dial with named tiers.** `Observe → Propose → Approve-each → Auto-within-policy → Autonomous`. The dial is always visible and always the user's. Behavioral has a special **Guardian** tier — it can *veto* an action but can never *execute* one. That asymmetry (a safety agent that can only stop, never start) is a deliberate trust architecture.
3. **Every agent shows a track record.** "94% accepted," "caught 3 emotional trades," "2 modified by you." Trust is *earned and displayed*, which is how a user rationally decides to grant more autonomy. No track record, no autonomy.
4. **The trace is inspectable but folded.** The current repo surfaces the full agent trace — good for a lab, overwhelming for an OS. Default: a one-line synthesis ("Strategist drafted a rebalance, Behavioral approved, Research sourced from 14 filings"). `[ Inspect → ]` expands the full reasoning, tool calls, memory reads/writes, latency, and cost. Power on demand, calm by default.
5. **Agents are hireable and composable.** The desk grows with the user's life: a **Tax** agent at tax season, an **Estate** agent when they have kids, a **Real Estate** agent when they buy property. Each new agent is a declarative profile (the repo's architecture already supports this — agents are profiles in a registry), so the *product* surface of "hiring a specialist" maps cleanly to the *engineering* surface of registering a profile.

### Agent detail (Inspect) view

When you open an agent: its remit, its current task with live reasoning, its memory subscriptions (what it watches), its tools/MCPs, its autonomy dial with the exact policy in plain English ("may place orders up to $5,000 without asking, only within target allocation, never in your no-fly list"), its full track record, and a **conversation** — you can talk *directly* to one specialist. This is where "operating a command center" becomes literal: you brief a specialist, it goes to work, it reports back.

---

## 6. The Memory Layer

Memory is the moat (Principle 5) and almost no consumer finance product treats it as a designed surface. The repo already has shared memory (Supabase or in-process, with a Memory Explorer). The vision turns the *log* into a **living, governable model of the user.**

### Three layers of memory

```
┌─ MEMORY ────────────────────────────────────────────────────────────────┐
│  What Northstar knows about you. You own this. You can edit or forget any │
│  of it. 312 facts · 1,847 events · last updated 2 minutes ago.            │
│                                                                          │
│  ── ABOUT YOU (semantic — the model of you) ──────────────────────────   │
│  ◰ "Prioritizes tax-efficiency over raw return"   source: 14 decisions   │
│     Confidence ▮▮▮▮▮   applied 31×       [ This is wrong ]  [ Forget ]    │
│  ◰ "Risk tolerance: moderate, lower near goals"   source: onboarding+obs  │
│  ◰ "No-fly list: tobacco, private prisons"        source: your note 4/12  │
│  ◰ "Reviews finances Sunday mornings"             source: usage pattern   │
│                                                                          │
│  ── DECISIONS (episodic — what happened & why) ───────────────────────   │
│  ⊞ 06/14  Held NVDA through earnings        you · against Strategist      │
│  ⊞ 06/02  Rebalanced to target              auto · within policy         │
│  ⊞ 05/28  Declined cash sweep               you · "saving for Q3 tax"     │
│                                                                          │
│  ── WORKING (live — this session's context) ─────────────────────────    │
│  ◐ Currently weighing: rebalance vs. tax-loss harvest                    │
│                                                                          │
│                                            [ Export ]  [ Forget a topic ] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Design principles for memory

- **Semantic / Episodic / Working** — three honest layers. *About You* is the distilled model (facts, preferences, the no-fly list). *Decisions* is the immutable episodic ledger (this is also the Decisions surface, §IA — same data, two lenses). *Working* is the live scratchpad of the current loop.
- **Every memory cites its source.** "From 14 decisions," "your note 4/12," "usage pattern." A belief the OS holds about you that it can't justify is a belief you should be able to delete. No black-box personalization.
- **Every memory is editable and forgettable.** `[ This is wrong ]` corrects it; `[ Forget ]` removes it and the OS tells you what *downstream* recommendations relied on it. This is the GDPR-grade right-to-be-forgotten *as a feature*, surfaced, not buried in a privacy policy. Trust comes from the user feeling they can always reach in and fix the model of themselves.
- **Memory is shown forming.** The "What I Learned" panel on the Command Center is the daily diff of this layer. The user watches the model of themselves get sharper — that visibility is what makes 18 months of accumulated memory feel irreplaceable.
- **Confidence is visible.** Each semantic fact has a confidence bar that grows with corroborating evidence and decays when contradicted. The OS is honest about how sure it is that it understands you.

**Brutal note:** if Northstar ever uses memory the user can't see, edit, or delete, the entire trust thesis collapses and we are just another opaque robo-advisor. Memory transparency is non-negotiable, not a v3 nicety.

---

## 7. The Workflow System

Workflows are how the loop becomes **standing infrastructure** instead of a thing the user babysits. This is the "operating system" claim made concrete: the user doesn't perform tasks, they *install behaviors.*

A workflow is a saved, governed recipe shaped exactly like the loop: **Trigger (Observe) → Agents (Understand/Recommend) → Approval gate → Action (Execute) → Memory (Remember).**

```
┌─ WORKFLOWS ──────────────────────────────────────── 4 armed · 1 paused ──┐
│                                                                          │
│  ↻ DRIFT GUARD                                    ● armed · auto-within   │
│  When equity allocation drifts >2% from target,                          │
│  Strategist proposes a tax-aware rebalance →                             │
│  if Behavioral approves and tax impact < $200 → execute automatically,   │
│  else → ask me.                                                           │
│  Ran 3× · saved ~$2,100 in drift · last: 06/02              [ Edit ]     │
│                                                                          │
│  ↻ CASH SWEEP                                     ● armed · approve-each   │
│  When idle cash > $5k for 3 days → Research finds best yield → ask me.    │
│  Ran 1× · last: 05/28 (you declined)                       [ Edit ]     │
│                                                                          │
│  ↻ EARNINGS WATCH                                 ● armed · notify         │
│  Before any holding reports → brief me the night before with the thesis  │
│  and my stop-loss logic.                                    [ Edit ]     │
│                                                                          │
│  ↻ TAX-LOSS HARVEST                               ⏸ paused (off-season)    │
│                                                                          │
│  + New workflow        ⌘ Describe it in plain English: "When…"           │
└──────────────────────────────────────────────────────────────────────────┘
```

### The decisive idea: workflows are written in plain English, not nodes

Most "automation builders" are node graphs (Zapier, n8n). For a finance OS aimed at humans, that is the wrong abstraction — it's programming with extra steps. Northstar workflows read as **sentences with named, tappable parameters:**

> When **equity drift** exceeds **2%**, have **Strategist** propose a **tax-aware rebalance**; if **Behavioral approves** and **tax impact < $200**, **execute automatically**, otherwise **ask me.**

Every bolded token is an inline editable control (a threshold, an agent, an action, an approval gate). You author and read automation in the same medium you'd use to explain it to a person. Behind it, a real DAG executes — but the *surface* is language. And critically, **every workflow has an explicit approval gate as a first-class, visible token** — you can always see, in one sentence, whether this automation can touch your money on its own.

**Safety rails baked into the surface:**
- Every workflow shows its **autonomy tier** as a colored chip (notify / approve-each / auto-within-policy).
- Every auto-executing workflow shows **caps in plain sight** ("tax impact < $200," "orders < $5k").
- A global **kill switch** (`⌘ .` or the mode toggle in the rail) pauses *all* autonomous workflows instantly and reverts to advisory. A finance OS without a panic button is irresponsible.
- Every workflow run lands in **Decisions** with full attribution, so "the system did something while I slept" is always answerable.

---

## 8. The Settings Experience

Settings in most apps is a junk drawer. In a system that can **move your money**, Settings is where the user defines the **constitution of the OS** — and it deserves to be designed like a control room, not a form.

### Reframe: Settings → "Control"

Split into two: the boring stuff (profile, billing, appearance) stays as quiet forms. The consequential stuff gets its own designed home:

```
┌─ CONTROL ────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ◑ OPERATING MODE                                                          │
│  ┌──────────────┬──────────────┬───────────────┬────────────────────┐     │
│  │  OBSERVE     │  ADVISORY ◉  │  SUPERVISED   │  AUTONOMOUS        │     │
│  │  watch only  │  recommend   │  auto w/ caps │  full, within law  │     │
│  └──────────────┴──────────────┴───────────────┴────────────────────┘     │
│  Currently ADVISORY: I propose, you approve everything. ↑ to grant more.   │
│                                                                            │
│  ◈ POLICIES (the rules I will never break)                                 │
│  • Max single order:           $5,000          [ edit ]                    │
│  • Max daily deployment:       $20,000         [ edit ]                    │
│  • No-fly list:                tobacco, prisons [ edit ]                    │
│  • Require approval above:     $1,000          [ edit ]                    │
│  • Behavioral can veto:        ON (recommended) [ toggle ]                 │
│                                                                            │
│  ⊟ CONNECTIONS                                                             │
│  ● Robinhood (Agentic MCP)  live · advisory · cap $5k    [ manage ]        │
│  ● Plaid — 3 banks          synced 2m ago                [ manage ]        │
│  ○ Add connection                                                          │
│                                                                            │
│  ◷ IDENTITY & SECURITY · APPEARANCE · BILLING · NOTIFICATIONS  →           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Principles

- **The most dangerous controls are the most legible.** Operating Mode and Policies are written in plain English, with the *current effective rule* stated as a sentence ("Currently ADVISORY: I propose, you approve everything"). No user should ever be unsure what the OS is permitted to do.
- **Changing autonomy is a deliberate, confirmed act** with a plain-language preview of what will now happen without asking. Granting autonomy can require step-up auth (biometric/2FA) — it is functionally as serious as a wire transfer.
- **Connections show *capability and cap*, not just "connected."** "Robinhood · live · advisory · cap $5k" tells you what this link can actually *do*, which is what matters when the link can trade.
- **Every policy change is itself a Decision** in the ledger. Changing your own constitution is auditable.

---

## 9. Mobile Navigation

Mobile is **not the dashboard shrunk.** On mobile, the user is not *operating* — they are *approving and glancing.* The job to be done is: get the brief, resolve what needs me, ask a quick question. So mobile is **approval-first and conversational-first.**

```
┌─────────────────────────┐     Bottom nav — 4 zones, thumb-reachable:
│  Good morning, Dana.    │
│  ▲ 1.2% · 3 need you    │     ┌─────┬─────┬─────┬─────┐
│  ─────────────────────  │     │  ◆  │  ⊞  │  ⌕  │  ◰  │
│                         │     │Brief│Deci-│ Ask │ You │
│  ◆ NEEDS YOU       (3)  │     │     │sions│     │     │
│  ┌─────────────────────┐│     └─────┴─────┴─────┴─────┘
│  │ Rebalance drift 2.4%││      Home  Decide  Ask  Memory
│  │ 84% · Strategist    ││
│  │ swipe → approve     ││     • The center action: a single
│  │ swipe ← snooze      ││       floating ⌘/mic button → talk
│  │ tap → why           ││       to Northstar. Voice is a
│  └─────────────────────┘│       first-class mobile input
│  ┌─────────────────────┐│       (Jarvis on the go).
│  │ Cash drag $42k idle ││
│  │ tap to review       ││     • Approvals are SWIPE gestures
│  └─────────────────────┘│       (right=approve, left=snooze,
│                         │       tap=why) — fast, physical,
│  ⟁ 2 agents working     │       but the dangerous direction
│                         │       (approve) requires a confirm
│  [  ◆ Ask Northstar  ]  │       slide or Face ID for money
└─────────────────────────┘       movement above your cap.
```

### Mobile principles

- **Four destinations, period:** Brief (Command Center), Decisions, Ask (conversational + voice), You (Memory/identity). Everything else lives inside these or behind ⌘K's mobile equivalent (a search sheet).
- **Approvals are gestures.** Swipe-to-approve is the core interaction. But any action that moves money beyond a threshold demands an explicit confirm (slide-to-confirm + biometric). Never let a stray thumb wire money.
- **Voice is first-class.** The center floating button is push-to-talk. "Hey, did NVDA report yet?" / "Approve the rebalance." Mobile is where the Jarvis fantasy is most natural — hands busy, glance-and-go.
- **Notifications are decisions, not noise.** A push notification *is* an approval card: it states the action, confidence, and consequence, and can be approved (with auth) from the lock screen. We push only what needs the human — never "the market moved."
- **Calm carries to mobile.** When nothing needs you, the home is a single calm line: "All nominal. Nothing needs you. Next review Friday." No infinite feed to doomscroll.

---

## 10. What's Wrong With Typical Fintech Dashboards (and the Kangaroo reference)

Brutal honesty, as requested. These are the patterns Northstar exists to reject.

**1. They report; they don't recommend.** A wall of charts that makes *you* do the synthesis. The product's hardest job — "so what should I do?" — is offloaded onto the user. → *Northstar leads with a recommendation and a sentence of interpretation; charts are evidence, demoted below the decision.*

**2. They optimize for engagement, which is adversarial to the user.** Red numbers, streaks, push notifications on every tick, infinite feeds. This is casino design wearing a fintech skin; it manufactures the exact anxiety that makes people trade badly. → *Northstar optimizes for **decisions resolved with confidence** and is explicitly proud when your time-on-screen goes down. Calm is the KPI.*

**3. Generic IA organized by data table, not by user intent.** (The Kangaroo reference: Home/Analytics/Customers/Partners/Payouts — nouns from a schema.) → *Northstar's IA is the loop and the user's intent.*

**4. Dead space filled with upsell.** (Kangaroo's empty rail → promo card.) Marketing inside the cockpit erodes trust and wastes the best real estate. → *Northstar fills that space with live intelligence (the next decision, agent pulse).*

**5. Badges that count rows, not consequence.** ("Customers 6.") Noise dressed as signal. → *Northstar badges encode urgency and money only.*

**6. No visible system state.** Most dashboards can't tell you if they're live, syncing, or what they're allowed to do. Unacceptable for software that touches money. → *Northstar has a permanent heartbeat and a visible operating mode.*

**7. Black-box "insights."** "We think you should…" with no source, no confidence, no audit trail. Users correctly distrust this and ignore it. → *Northstar shows the agent, the evidence, the confidence, the cost, and the consequence of inaction — every time.*

**8. Settings as a junk drawer.** The controls that govern money are buried in the same list as "dark mode." → *Northstar elevates Mode and Policies into a designed Control surface.*

**9. They have no memory.** Every session starts from zero; the product never gets to know you. This is why they're commoditized and switchable. → *Memory is Northstar's central, visible, ownable surface.*

**10. They confuse "more data" with "more value."** Density without judgment is just stress. Bloomberg gets away with it because professionals are paid to parse it; a personal finance OS that does it is just cruel. → *Northstar is dense where it earns attention (the decision, the evidence) and ruthlessly empty everywhere else.*

The meta-point: **typical fintech dashboards treat the user as a reader. Northstar treats the user as an operator** — someone who issues intent and grants authority, while the system does the labor and shows its work.

---

## 11. Wireframes (text)

### 11.1 Desktop shell

```
┌──────┬──────────────────────────────────────────────────────────────────────┐
│  ✦   │  Good morning, Dana.                          NORTHSTAR · ◐ ADVISORY  │
│      │  Up 1.2% overnight. Three things need you. Nothing is wrong.          │
│  ●   │ ──────────────────────────────────────────────────────────────────── │
│      │                                                                      │
│  ◆   │   $1,420,338  ▲1.2% +$16,840 (30d)     ╱╲    ╱╲╱╲                    │
│  ▣   │   Net worth                       ╱╲╱╲╱  ╲╱╲╱    ╲__                  │
│  ◇²  │                                                                      │
│  ↻   │   ◆ NEEDS YOU (3)                                      Resolve all →  │
│  ⌕   │   ┌──────────────────────────────────────────────────────────────┐  │
│  ⊞³  │   │ ◆ Rebalance drift 2.4% > 2.0%          84% · Strategist       │  │
│  ◰   │   │   Sell $18k VTI → BND/cash · tax +$0 · auto in 2d             │  │
│      │   │   [Approve] [Modify] [Snooze] [Why?]                          │  │
│ ──   │   └──────────────────────────────────────────────────────────────┘  │
│ next │   ┌──────────────────────────────────────────────────────────────┐  │
│ ◆••• │   │ ◆ Cash drag $42k idle           71% · Research   [Review]     │  │
│      │   └──────────────────────────────────────────────────────────────┘  │
│ ⊟ ⚙  │   ⟁ AGENT PULSE          ◰ WHAT I LEARNED                          │
│ ◷DH  │   ⌕ Ask Northstar…                                            ⌘K   │
└──────┴──────────────────────────────────────────────────────────────────────┘
```

### 11.2 Decision detail (the universal unit, expanded via "Why?")

```
┌─ DECISION ───────────────────────────────────────────────────────── ✕ ──┐
│  Rebalance: equity drift 2.4% exceeds your 2.0% policy                    │
│  Proposed by Strategist · 84% confidence · 06:31 ET                       │
│ ──────────────────────────────────────────────────────────────────────── │
│  THE ACTION                                                               │
│    Sell  $18,000  VTI                                                      │
│    Buy   $12,000  BND  ·  $6,000 → cash reserve                           │
│    Account: Roth IRA (no taxable event)                                    │
│                                                                           │
│  WHY  (the agents' reasoning — folded, click to expand each)              │
│    ◇ Research   ▸ Equity now 67% vs 65% target; 14 filings, no red flags  │
│    ◇ Strategist ▸ Restores target with minimum trades, tax-aware          │
│    ◇ Behavioral ▸ APPROVED · "Consistent with your stated tax priority.   │
│                    Not reactive to this week's volatility."  ✓            │
│                                                                           │
│  IF YOU DO NOTHING                                                         │
│    Auto-executes in 2 days (Drift Guard workflow, within policy).         │
│    Drift compounds ~0.3%/wk. No deadline risk.                            │
│                                                                           │
│  MEMORY THIS USES                                                          │
│    "Prioritizes tax-efficiency" · "Risk: moderate" · target allocation    │
│                                                                           │
│  [ Approve ]   [ Modify… ]   [ Snooze 1wk ]   [ Decline & tell me why ]   │
└───────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Command Bar (⌘K)

```
┌─ ⌘K ─────────────────────────────────────────────────────────────────────┐
│  ⌕  rebalance|                                                            │
│ ──────────────────────────────────────────────────────────────────────── │
│  ACTIONS                                                                   │
│   ◆ Approve pending rebalance                                    ↵        │
│   ↻ Run Drift Guard now                                                    │
│   ⊞ Rebalance to target (manual)                                           │
│  ASK                                                                       │
│   ⌕ "Why did you recommend rebalancing?"                                   │
│   ⌕ "Show me every rebalance this year"                                    │
│  GO TO                                                                     │
│   ▣ Portfolio · Allocation        ◇ Strategist                            │
│  ⌘ . to pause all automation · type to filter · ↑↓ to move · ↵ to run     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Product Specification (condensed)

**Product:** Northstar OS — an AI operating system for personal & professional finance.
**Core loop:** Observe → Understand → Recommend → Approve → Execute → Remember.
**Primary user:** a financially serious individual or operator who wants leverage and judgment, not another brokerage app — and who will grant autonomy *only* in exchange for transparency and control.

**Pillars & primary surfaces**

| Pillar | Surface | Core job | Loop stage |
| --- | --- | --- | --- |
| AI Agents | Agents / Desk | A governable workforce with autonomy dials | Understand→Recommend |
| Financial Memory | Memory / Decisions | A visible, ownable, editable model of the user | Remember |
| Research | Research | Deep, sourced reasoning corpus | Observe→Understand |
| Portfolio Intelligence | Command Center / Portfolio | "Am I okay, what changed, what needs me" | Observe→Recommend |
| Workflow Automation | Workflows | Install behaviors, not perform tasks | all stages, standing |
| Execution | Trader + Connections (MCP) | Act within explicit, capped, vetoed authority | Execute |

**Non-negotiable requirements**
- Every action that moves money passes a visible **approval gate** with stated confidence, cost, and consequence-of-inaction.
- Permanent **operating mode** + **kill switch** (`⌘ .`).
- **Memory** is user-visible, source-cited, editable, and forgettable.
- **Decisions** is an immutable, fully-attributed ledger of everything decided and why.
- **Behavioral agent veto** is on by default.
- Hard **policy caps** (per-order, per-day, no-fly list) enforced server-side, surfaced in the UI.
- Full **keyboard operability** and ⌘K addressing of every object/action.

**Success metrics (note what's *missing*: DAU-for-its-own-sake)**
- Decisions resolved with confidence / week
- % recommendations accepted (agent trust) and time-to-approve
- Autonomy granted over time (trust curve) — the leading indicator of retention/moat
- Memory facts accumulated & correction rate
- **Inverse:** anxious sessions, rage-snoozes, time-on-screen-without-a-decision — all should fall

**Build order (honest sequencing)**
1. **Command Center + Decision unit + ⌘K** on top of the existing crew/stream/memory. This is the soul; ship it first.
2. **Agents desk + autonomy dials + Behavioral veto** (governance before more automation).
3. **Memory surface** (semantic/episodic/working with edit & forget).
4. **Workflows** (plain-English, with caps + kill switch).
5. **Control/Settings** reframe + Connections capability model.
6. **Mobile** (approval-first, voice, swipe).
We deliberately do **not** start with more charts.

---

## 13. Visual Design Language

Extend the repo's existing system; do not reinvent it. It's already 80% right.

- **Substrate: deep, near-black space (`#06070A`).** The OS floats in a void. This is Palantir/Bloomberg seriousness and it makes the rationed color *mean* something. Light mode is a later concession, not the identity.
- **Surfaces are barely-there.** Cards are `#0C0E13` with `rgba(255,255,255,.08)` hairline borders, raised to `#11141B` on hover. Elevation via subtle inner-light (`inset 0 1px 0 rgba(255,255,255,.03)`) and long, soft shadows — never heavy drop shadows. Materiality over decoration (the Apple lesson).
- **Color is semantic and rationed.** Blue `#6E8BFF` = intelligence/active reasoning. Amber `#E2B17C` = flow/execution/money-in-motion/needs-you. Sage `#7FB39B` = confirmed/healthy/synced. Red is reserved for true loss or breach — used so rarely it lands hard. **No decorative color, ever.** A screen is mostly grayscale; color is information.
- **Agent identity colors** (Orchestrator blue, Strategist violet, Research green, Behavioral amber) are a closed set — agents are recognizable by hue across the whole OS.
- **Ambient field, not flat.** The existing radial gradients (faint blue top-right, faint violet bottom-left) give the void depth without noise. Keep them subtle and *fixed* (parallax-free) so they read as atmosphere, not animation.
- **Generous negative space.** Density is earned per-region (the decision, the evidence), not sprayed everywhere. The calm between elements is the luxury signal.
- **Glass for transient/system chrome only** (nav bar, ⌘K, mode sheet): `backdrop-blur(14px) saturate(140%)`. Persistent content is solid — glass everywhere is nausea.
- **Corner radius:** 16px cards, 9–10px controls, 999px for status pills. Consistent and soft, never playful-round.

---

## 14. Iconography

- **One family, custom, 1.5px stroke, geometric, 24px grid.** Line icons (matching the repo's existing 1.4–1.5px strokes), rounded joins, optical consistency. No filled icons except the active-state mark and the brand glyph.
- **The brand is a star/north-star glyph** (`StarGlyph` exists). It is the only "logo," appears once (rail header), and doubles as the system-busy indicator (it pulses softly when the OS is thinking — the Jarvis "I'm working" tell).
- **Icons encode the loop, not generic objects.** Navigation glyphs are abstract/geometric (◆ command, ▣ portfolio, ◇ agents, ↻ workflows, ⌕ research, ⊞ decisions, ◰ memory) so they read as *system functions*, not clip-art (no literal piggy banks, no dollar-sign coins, no briefcases — the Kangaroo "shopping bag for Partners" is exactly the literalism to avoid).
- **Status is a vocabulary of dots and arcs, not icons:** `○` idle, `◐` working (rotating), `●` live/done, `◆` needs you. This tiny set, used consistently, becomes a language the user reads pre-cognitively.
- **Connection logos are the *only* place we allow brand color/raster** (Robinhood, Plaid, banks) — quarantined to Connections, never in the nav, so they don't pollute the monochrome system.
- **Motion-aware:** the working state (`◐`) animates; everything else is static. Reduced-motion swaps animation for a static distinct glyph.

---

## 15. Typography

The repo already pairs an Apple-grade sans with a mono. Make it doctrine.

- **Two families, strict roles.**
  - **Sans (Inter / SF Pro / Geist):** all human language — headings, body, recommendations, the OS's "voice." Tight tracking on large sizes (`-.02em` to `-.035em`), the way Apple sets display type.
  - **Mono (SF Mono / JetBrains Mono / Geist Mono):** everything *machine* — numbers, money, tickers, timestamps, labels/eyebrows, system tags, agent names, confidence. This is the single highest-leverage typographic decision: **money and data are always mono**, so the eye instantly distinguishes "the system's facts" from "the system's words." It's the Bloomberg/terminal signal that says *this is real data*.
- **Eyebrows are uppercase mono, letterspaced** (`.12–.18em`, `--ns-text-3`): `NET WORTH`, `NEEDS YOU`, `AGENT PULSE`. Quiet, technical, sectioning.
- **A tight, deliberate scale** (display 46/34, title 24, body 15/14, label 11–13, micro 10). Big numbers (net worth) are the only true display moment per screen — one hero number, never competing heroes.
- **The OS's written voice** (the daily sentence, "if you do nothing", agent rationales) is set in comfortable 15px sans with relaxed line-height. The system *talks like a calm expert*; the type must read like prose, not chrome.
- **Tabular/lining numerals always** for money so figures align in columns and don't jitter as they update live.

---

## 16. Animations

Animation in Northstar exists to **convey system state and causality**, never to entertain. The repo's easing is already right: `cubic-bezier(.16,1,.3,1)` — fast out, gentle settle, the Apple feel.

- **Entrances:** content fades up 6–8px over ~250–500ms with that easing. Nothing slides in from off-screen; nothing bounces. Calm arrival.
- **The thinking state is the signature animation.** When agents work, the brand glyph and the relevant agent's `◐` rotate/pulse softly. This is the *one* persistent motion in the app, and it's meaningful: the OS is laboring. When it stops, the room goes still — and stillness reads as "done / nominal."
- **Live data streams in, never refreshes.** Agent pulse and the Command Center update token-by-token / row-by-row via SSE (already wired). New information arrives with a brief, soft highlight that decays — you *see* the system learn in real time. Never a jarring full-screen reload.
- **Flow lines for the loop.** In diagrams and the agent trace, animated dashed paths (the repo's `ns-signal` / `ns-stream` / `ns-packet`) show information moving Observe→Execute. Used sparingly, this visualizes the OS's nervous system.
- **Approval is physical and rewarding.** Approving a decision plays a single, crisp confirm: the card settles, a sage check draws on, it files itself into Decisions with a brief motion-trail. Money moving deserves a moment of weight — not a toast that vanishes in 2s.
- **State changes are animated; layout is not.** Color/opacity/transform transitions, yes. Reflowing the page, no. Things don't jump.
- **`prefers-reduced-motion` is fully honored** (the repo already does this) — animation degrades to instant state with static distinct glyphs. Accessibility is not optional in software that moves money.
- **Speed is a feature.** Nothing exceeds ~500ms; most is 200–300ms. The OS must feel *faster than thought* (the Linear lesson). A laggy command center feels untrustworthy regardless of how it looks.

---

## 17. Interaction Patterns

- **⌘K is the spine of interaction.** Every object, action, agent, setting, and question is addressable from the command bar. It's launcher + search + ask, all in one. Power users should be able to operate Northstar end-to-end without a mouse (Linear/Arc DNA).
- **The universal decision grammar: Approve · Modify · Snooze · Why.** Every recommendation, everywhere (Command Center, mobile push, ⌘K, Decisions), offers exactly these four verbs. Learn it once, use it forever. *Modify* opens an editable version of the proposed action; *Why* expands the reasoning; *Snooze* defers with a reason captured into memory.
- **Keyboard-first navigation** (`g`+letter to jump, `j/k` to move the decision stack, `↵` to approve focused, `⌘.` global kill switch, `?` for the shortcut sheet). Mouse is fully supported but never required.
- **Progressive disclosure as the core discipline.** Default is the one-line synthesis; depth is one click away (`Why?`, `Inspect →`). Never show the full agent trace, tool calls, and token counts unless asked. Calm by default, infinite depth on demand.
- **Direct manipulation of automation.** Workflows and policies are edited inline by tapping the bolded parameter inside the sentence — no separate config modal. You edit the rule where you read it.
- **Conversational + structured are the same surface.** You can browse the Command Center *or* type/speak a question; both run the same loop and produce the same decision unit. Language and GUI are not separate modes.
- **Confirmation scaled to consequence.** Reading is free. Snoozing is one tap. Approving within-cap is one tap. Approving above-cap, changing autonomy, or moving money beyond policy requires deliberate confirm + step-up auth. Friction is proportional to risk — never uniform.
- **Optimistic, but reversible and attributed.** The UI responds instantly; the action files into Decisions with full attribution; where a thing can be undone, *Undo* is offered for a real window. Nothing money-related happens silently or irreversibly-without-warning.
- **Honest empty/calm states.** "Nothing needs you" is a designed, confident state, not a blank. The OS earns trust by being comfortable saying "all nominal."

---

## 18. Future Features That Support the OS Vision

Ordered roughly by how much each deepens the *operating system* claim (and the moat).

1. **Standing authority, granularly granted.** The autonomy curve made real: users grant bounded, revocable authorities ("rebalance within 2%," "sweep idle cash") one at a time, each with caps and an audit trail. The product's central long-term mechanic — every grant deepens dependence *and* trust simultaneously.
2. **Northstar voice / ambient Jarvis.** Full voice operation on mobile and desktop ("what's my exposure to rates?" / "approve the sweep"). Spoken daily brief. This is the literal Jarvis surface and the most defensible "feel."
3. **Scenario & simulation engine ("what-if").** "Show me retirement if I add $2k/mo," "stress my portfolio against a 2008," "what if I buy this house." The OS reasons forward, not just reports backward — the Palantir muscle applied to a personal balance sheet.
4. **Household & multi-entity operation.** Operate spouse, kids' 529s, an LLC, a trust — as one command center with per-entity policies and permissions. Turns a personal app into family-office infrastructure (and raises switching cost enormously).
5. **The agent marketplace / specialist roster.** Hire Tax, Estate, Real-Estate, Crypto, Small-Business specialists as declarative profiles. Northstar becomes a platform, not a feature set — and third parties can publish governed specialists.
6. **Proactive life-event detection.** The OS notices "you got a raise," "a large deposit hit," "a child was added to your profile" and opens the right loop unprompted. True Observe.
7. **Explainable risk & the "Behavioral mirror."** The Behavioral agent grows into a longitudinal coach: "you tend to sell winners early — here's the cost over 3 years." Memory + behavior = genuinely novel value no robo-advisor offers.
8. **Negotiated execution across venues.** Beyond Robinhood: route execution to the best venue/account for tax and cost, all within policy. Execution as an intelligent layer, not a single broker pipe.
9. **The Decisions ledger as a shareable, exportable record.** Auditable, advisor-ready, tax-ready. Your financial reasoning as portable, owned data — the anti-lock-in promise that paradoxically increases trust and retention.
10. **Northstar Labs as the live R&D channel.** The existing `/labs` becomes the place power users opt into experimental agents and workflows before they graduate — a structured way to ship the future without destabilizing the cockpit.
11. **Local-first, privacy-preserving memory option.** For the most security-conscious, memory and reasoning that stay on-device/in-tenant. Privacy as a premium feature, consistent with the "you own your memory" thesis.

---

## Appendix A — One-paragraph north star (for the README / pitch)

> Northstar OS is the intelligence layer between you and every financial decision. It observes your whole financial life, understands what you care about, recommends what to do — and, only with your permission, executes and remembers. It is operated, not browsed: a quiet command center of named AI specialists you grant authority to gradually and revoke instantly, every action shown with its reasoning, confidence, cost, and consequence. Not a dashboard that reports the past. An operating system for your financial future.

## Appendix B — What we are deliberately NOT building

- A social/“what are others buying” feed. (Engagement bait; corrodes judgment.)
- Gamified streaks, confetti, or “you’re a top investor!” dopamine loops.
- A node-graph automation builder. (Plain-English workflows instead.)
- An infinite-scroll transactions feed as the home screen.
- Dark patterns around autonomy (no pre-checked “let Northstar trade for you”).
- More charts as the answer to “add value.”
- In-cockpit upsell. (Looking at you, Kangaroo promo card.)
```
