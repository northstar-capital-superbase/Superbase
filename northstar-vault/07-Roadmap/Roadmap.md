---
type: roadmap
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [roadmap]
---

# Roadmap

> [!info] Why this page exists
> A team needs one shared, current answer to "what are we doing now, what's next, and what's later" — not five different half-remembered priority lists. This page is that answer, kept as a lightweight board rather than a heavyweight project plan.

> [!tip] When to use this page
> Check here before starting new work to confirm it's actually a priority. Update the `horizon` field on a linked [[Specs Index|spec]] to move it between Now/Next/Later — this board queries specs directly rather than duplicating a list by hand.

> [!note] How it connects to the rest of the vault
> Items here should trace back to [[Mission & Vision]] and typically originate from a [[Specs Index|spec]]. Quarterly framing and OKRs live in [[Quarters Index]] — this page is the rolling, always-current view; that folder is the periodic, dated view.

---

## Now / Next / Later

Set a `horizon: now | next | later` field in a spec's frontmatter to place it on this board.

```dataview
TABLE status as "Status", owner as "Owner"
FROM "03-Product/Specs"
WHERE type = "spec" AND horizon = "now"
SORT updated DESC
```

```dataview
TABLE status as "Status", owner as "Owner"
FROM "03-Product/Specs"
WHERE type = "spec" AND horizon = "next"
SORT updated DESC
```

```dataview
TABLE status as "Status", owner as "Owner"
FROM "03-Product/Specs"
WHERE type = "spec" AND horizon = "later"
SORT updated DESC
```

> [!todo] Placeholder
> Once specs exist, tag them with a `horizon` field so this board populates automatically. Owner: Head of Product.

## Shipped

A rolling, dated log of what actually went out — the public-facing counterpart to [[Features Index]]'s living docs. Keep entries short; link to the full feature doc for detail.

> [!todo] Placeholder
> Newest first, one line per shipped item, e.g. `2026-08-01 — [[Feature Name]] — one-line description.`

## Quarterly plans

See [[Quarters Index]] for OKRs and quarter-scoped planning that this rolling board doesn't capture.
