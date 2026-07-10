# Northstar OS — Product Optimization & UX Review

A product-led review of Northstar OS across agent architecture, product experience,
the Lab Console, Settings, appearance, motion, performance, and code quality. It
records both what shipped in this pass and a prioritized backlog of recommendations.

Northstar OS is an AI operating system — the interface should feel calm, premium,
intelligent, and purposeful. Every recommendation below is filtered through one
question: _does this help the user accomplish their goal?_

---

## What shipped in this pass

- **Global theme system** — a `SettingsProvider` mounted in the root layout applies
  theme/appearance on every route (was `/settings`-only), with a no-flash pre-hydration
  script. Eight real built-in themes (Midnight, Graphite, Nord, Dracula, Solarized Dark,
  Terminal Green, Ocean Blue, Northstar Purple) as attribute-scoped `[data-theme]` token maps.
- **Appearance control center** — theme, accent (+ auto), corner radius, density, font size,
  background style, chat bubbles, sidebar default, glass, agent colors, animations, reduced
  motion — with an isolated **live preview** and Apply / Discard / Reset.
- **Settings as a control center** — 12 grouped, URL-addressable sections. Live sections use
  real probes; preference-only controls are labeled honestly.
- **Motion & performance** — unified spinner timing token, memoized chat subtree + markdown,
  fixed a status-timer leak, reduced-motion-gated smooth scrolling, and honored the in-app
  motion toggle in the sidebar.
- **Lab Console cleanup** — shared `AgentTrace` (now on mobile too), aligned empty states,
  a dismissible first-run hint, removed dead `SessionSwitcher`/`useSessions`, and de-duplicated
  a sidebar nav entry.
- **Safe agent refactors** — de-duplicated `buildMessages`, validated client-supplied
  `specialists[]`, and included orchestrator plan-phase tokens in the trace totals.

---

## 1. Agent architecture

The crew (`lib/orchestration/crew.ts`) is a **sequential, memory-mediated pipeline**: the
orchestrator plans, three (or four) specialists run one after another — each reading prior
outputs from shared memory — then the orchestrator synthesizes. This is transparent and easy
to reason about; the sequential design is _intentional_ because each specialist builds on the
previous one's output. Changes here carry reasoning-quality risk, so most are recommendations.

### HIGH

- **Plan-driven routing.** Today the orchestrator's plan is advisory text; the specialist list
  is fixed regardless of plan content. Let the plan actually select which specialists run.
  - _Why:_ Not every task needs all three specialists; routing cuts cost and latency.
  - _Impact:_ Faster, cheaper runs; answers feel more deliberate.
  - _Effort:_ Moderate — structured plan output + a routing step in `streamCrew`.
  - _Tradeoffs:_ Mis-routing could drop a useful perspective; needs a sensible default/floor.

- **Default-model cost/latency.** Default is `claude-opus-4-8` across 5–9 calls per message.
  - _Why:_ Opus is premium; a 5–9 call pipeline is slow and expensive for everyday tasks.
  - _Impact:_ Large latency/cost reduction with a tiered model (fast model for plan/specialists,
    strong model for synthesis).
  - _Effort:_ Low–moderate — per-role model selection in the provider layer.
  - _Tradeoffs:_ Slightly lower per-step quality; mitigated by keeping synthesis on the strong model.

### MEDIUM

- **Parallel fan-out for independent specialists.** Research is independent; Strategist and
  Behavioral partly depend on it. Run Research first, then Strategist + Behavioral in parallel.
  - _Why:_ The chain currently pays the sum of all latencies.
  - _Impact:_ Meaningful latency drop on multi-specialist runs.
  - _Effort:_ Moderate — restructure the loop into stages with `Promise.all`.
  - _Tradeoffs:_ Behavioral loses Strategist's output as context; measure quality before/after.

- **Context compaction / kind-filtering.** Every agent re-reads the last 24 mixed entries as one
  blob. Summarize older turns and/or filter by kind per agent.
  - _Why:_ Prompt size (and cost) grows linearly with session length.
  - _Impact:_ Cheaper long sessions; sharper, less noisy context.
  - _Effort:_ Moderate — a summarizer + per-agent context selection.
  - _Tradeoffs:_ Summarization can drop detail; keep raw memory in the store.

- **Token-level streaming.** Streaming is event-level (whole agent steps), so users wait for the
  full synthesis with no partial text.
  - _Why:_ Perceived latency; the app already streams events, not tokens.
  - _Impact:_ The answer feels immediate.
  - _Effort:_ Moderate — provider `stream()` + SSE token frames + incremental UI render.
  - _Tradeoffs:_ More complex client parsing and error handling.

### LOW

- **Redundancy:** the orchestrator's plan overlaps the Strategist's plan; consider making the
  plan purely a routing artifact rather than a second planning pass.
- **Trader tool loop** uses custom XML parsing rather than native tool-calling — fragile; migrate
  to provider function-calling when the abstraction supports it.
- **Possible new agent:** a lightweight **Critic/Verifier** pass before synthesis could raise
  answer quality on high-stakes tasks — add only behind a setting to avoid always paying for it.
- **Done this pass:** `buildMessages` de-duplication, `specialists[]` validation, plan-phase
  tokens in the trace.

---

## 2. Product experience

### HIGH

- **Global appearance/theme (done).** Settings previously applied only after visiting `/settings`
  and `[data-theme]` had no CSS. Now a global provider applies everything on first paint.

### MEDIUM

- **Connections shown twice** — embedded in the Command Center _and_ on `/connections`, pushing the
  console CTA below the fold. Pick one canonical surface; link to the other.
  - _Impact:_ Cleaner Command Center, faster path to the console. _Effort:_ Low. _Tradeoff:_ none material.
- **Nav idioms differ** — the sidebar is everywhere, but Settings also shows a secondary `OsNav`
  pill nav. Standardize on one wayfinding model. _Effort:_ Low. _Tradeoff:_ empty topbar space to fill.
- **Runtime status appears 3×** (sidebar footer, dashboard pills, Connections). Back them with one
  shared `useRuntimeStatus` hook to avoid duplicate fetches and drift. _Effort:_ Moderate.

### LOW

- **First-run onboarding (partially done).** Added a dismissible Command-Center hint; a fuller
  "connect your model" checklist would help brand-new installs. _Effort:_ Moderate.
- **Decorative voice button** in the composer implies a feature that isn't implemented; gate it
  behind the new Experimental → Voice input flag or remove it.

---

## 3. Lab Console

Chat-first is the right spine; keep dashboard clutter out. Desktop and mobile render as separate
trees gated by CSS.

### MEDIUM

- **Extract a shared `MessageThread`.** `Chat.tsx` and `MobileLabConsole.tsx` still duplicate
  bubble/empty-state rendering (~180 lines). This pass shared the `AgentTrace` and aligned empty
  states; a full thread extraction is the next step.
  - _Impact:_ Less drift, one place to improve the conversation surface. _Effort:_ Moderate.
  - _Tradeoff:_ Both UIs work today; refactor carries regression risk — do it behind tests.
- **Mobile agent trace (done).** Power users can now expand the trace on phones.

### LOW

- **Progressive disclosure** is already good (trace collapsed, agents/memory tucked away). Consider
  an inline "crew is collaborating" affordance on mobile mirroring the desktop `Thinking` row.

---

## 4. Settings (done)

Expanded from 6 flat tabs into **12 grouped, URL-addressable sections**: General, Appearance,
AI Models, Agents (incl. trading guardrails), Memory, Performance, Notifications, Privacy,
Developer Mode, Connections, Experimental, Authentication. Live sections use real health/memory
probes; preference-only controls (model, trading caps) are clearly labeled as local preferences,
consistent with the existing `NEEDS_OWNER_INPUT` notes.

- **Next:** wire the AI-model and trading-cap controls to the backend (currently local
  preferences), and back Connections/Memory/sidebar with one shared status hook.

---

## 5. Appearance (done)

Redesigned into a full customization surface with **live preview** before applying: eight built-in
themes, accent (+ theme-follow "auto"), corner radius, density, font size, animations, reduced
motion, sidebar default, background style, glass, agent colors, and chat bubbles. Themes are real
CSS token maps; the marketing homepage's separate `--ns-*` namespace is untouched.

- **Next (LOW):** custom accent hex picker; import/export of an appearance profile; per-agent color
  customization beyond the on/off tint.

---

## 6. Motion design

### MEDIUM

- **Unify the motion scale (partly done).** Four duplicate spin keyframes now share `--os-spin`;
  next, converge the two easing families (`--os-ease` vs the marketing spring) into one documented
  scale and replace remaining ad-hoc durations.
- **Complete framer-motion reduced-motion.** The sidebar honors the in-app toggle for its width
  animation; nested brand/nav/height animations still use fixed durations. Thread an effective
  reduce flag through, and replace `height: auto` `AnimatePresence` with transform-based reveals to
  cut layout thrash. _Effort:_ Moderate. _Tradeoff:_ touches a large component — test collapse/expand.

### LOW

- Add restrained micro-interactions (send-button press, staged agent-status transitions) gated by
  `data-motion`; keep them subtle (Linear/Arc/Apple), never flashy.

---

## 7. Performance

### MEDIUM

- **Duplicate network work.** Sidebar, Dashboard, Connections, and the console each fetch overlapping
  `/api/health` + `/api/trading` + `/api/agents` on mount. A shared cached hook (or SWR/React Query)
  removes redundant requests. _Effort:_ Moderate.
- **Re-render cascade (partly done).** Memoized the chat subtree + markdown so streaming status ticks
  don't re-render the thread; continue by memoizing agent rows and dashboard subcomponents.

### LOW

- **Fixed status-timer leak (done).** The post-run `setTimeout` is now cleared on unmount.
- Tailwind defines unused `animation` utilities; drop them. Marketing loads ~2k lines of CSS + animated
  SVG on `/`; consider deferring below-the-fold art.

---

## 8. Code quality

- **Done:** shared `AgentTrace` + `buildMemoryMessages`, removed dead session code and an unused
  interface, de-duplicated a sidebar nav entry.
- **MEDIUM:** consolidate the two status components (`StatusBadge` vs `StatusPill`) and the
  Settings-Integrations vs dashboard-Connections logic behind shared primitives/hooks.
- **LOW:** `OsSidebar.tsx` (740+ lines) and `labs.css` (1k+ lines) are large; split by concern when
  next edited. Introduce a shared spacing scale to replace per-component pixel values.

---

## Prioritized summary

### HIGH
1. Plan-driven specialist routing (§1) — deliberate, cheaper, faster runs.
2. Tiered per-role models (§1) — large latency/cost win.
3. Global appearance/theme system (§2) — **done**.

### MEDIUM
1. Parallel fan-out for independent specialists (§1).
2. Context compaction / kind-filtering (§1).
3. Token-level streaming (§1).
4. One canonical Connections surface + shared runtime-status hook (§2, §7).
5. Extract a shared `MessageThread` (§3).
6. Finish the motion scale + framer reduced-motion (§6).

### LOW
1. Custom accent picker + appearance import/export (§5).
2. Fuller first-run onboarding checklist (§2).
3. Consolidate status components; split large files; add a spacing scale (§8).
4. Critic/Verifier agent behind a setting (§1).

---

## Guardrails honored

- Not turned into a ChatGPT clone; the AI-OS vision and calm, premium feel are preserved.
- Working code was not rewritten unnecessarily — risky orchestration changes are recommendations,
  not edits.
- The marketing homepage (`--ns-*`) stays visually isolated from the OS theme system.
