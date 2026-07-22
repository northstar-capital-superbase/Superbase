---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [product, features]
---

# Features

> [!info] Why this page exists
> Once something ships, the spec that proposed it starts going stale — reality diverges from the original plan. Feature docs are the living record of *what a feature actually does today*, so support, sales, and new engineers have one current source instead of an aging spec.

> [!tip] When to use this page
> Create a feature doc (from [[Feature Doc Template]]) the moment something ships. Update it in place whenever the feature's real behavior changes — it should never need a "v2" copy; it just gets edited.

> [!note] How it connects to the rest of the vault
> Each feature doc links back to the [[Specs Index|spec]] it originated from (for historical "why") and to the [[04-Engineering/Systems/Systems Index|system(s)]] that implement it (for "how"). It's also the natural place to link relevant [[Feedback Index|feedback]].

---

## All shipped features

```dataview
TABLE status as "Status", owner as "Owner", updated as "Updated"
FROM "03-Product/Features"
WHERE type = "feature"
SORT updated DESC
```
