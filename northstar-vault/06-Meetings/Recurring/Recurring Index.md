---
type: index
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meetings, recurring]
---

# Recurring Meetings

> [!info] Why this page exists
> Recurring meetings (a weekly sync, a monthly all-hands) accumulate their own context — a standing agenda, a rotation, past decisions — that's distinct from any single instance's notes. This folder holds one durable "hub" page per series.

> [!tip] When to use this page
> Create a hub page (from [[Recurring Meeting Template]]) the first time a meeting becomes a standing, repeating thing (not a one-off). Link every dated instance in `06-Meetings/Notes/` back to its hub via the `series` frontmatter field.

> [!note] How it connects to the rest of the vault
> Each hub page's Dataview query surfaces its own instances from `Notes/` by matching `series`. This index lists the hub pages themselves.

---

## All recurring meeting series

```dataview
TABLE status as "Status", owner as "Owner"
FROM "06-Meetings/Recurring"
WHERE type = "recurring"
SORT file.name ASC
```

> [!todo] Placeholder
> Add the first recurring meeting hub page once a standing meeting exists (e.g. a weekly team sync). Owner: Vault Maintainer.
