---
type: index
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [home, dashboard]
---

# 🧭 Northstar

> [!info] Why this page exists
> This is the front door of the vault. Nobody should have to remember where anything lives — they should be able to land here and get to it in one or two clicks. This page has almost no content of its own; it is a **live index**, kept fresh automatically by Dataview instead of by hand.

> [!tip] When to use this page
> Every time you open the vault. It is the default note Obsidian should open to (set it as the vault's "Home" or "Default open file" in **Settings → Core plugins → Daily notes / Startup**, or use the community **Homepage** plugin).

> [!note] How it connects to the rest of the vault
> Every top-level section below links to that section's own index/dashboard note, which in turn links to the individual pages inside it. Home never links directly to a leaf note — it links to *indexes*, so this page never goes stale as content grows.

---

## The sections

| # | Section | What lives there |
|---|---|---|
| 01 | [[Canon\|Canon]] | Mission, values, brand, glossary, org — the slow-changing source of truth |
| 02 | [[ADR Index\|Decisions]] | Architecture Decision Records — why we built things the way we did |
| 03 | [[Product Index\|Product]] | Personas, specs, shipped feature docs, customer feedback |
| 04 | [[Engineering Index\|Engineering]] | Architecture, standards, runbooks, onboarding, per-system docs |
| 05 | [[Research Index\|Research]] | Market, competitive, user research, experiments |
| 06 | [[Meetings Index\|Meetings]] | Recurring meeting hubs, 1:1s, dated meeting notes |
| 07 | [[Roadmap\|Roadmap]] | Now / Next / Later, quarterly plans, shipped changelog |
| — | [[Templates Index\|Templates]] | Templater templates for every note type in this vault |
| — | [[Excalidraw Index\|Excalidraw]] | Diagram organization and embedding conventions |

New here? Start with the [[Vault Guide]].

---

## Recently updated across the vault

```dataview
TABLE type as "Type", status as "Status", file.mtime as "Last updated"
FROM -"Templates" AND -"00-Meta"
SORT file.mtime DESC
LIMIT 12
```

## Open decisions awaiting a call

```dataview
TABLE status as "Status", owner as "Owner", created as "Opened"
FROM "02-Decisions"
WHERE type = "adr" AND status = "proposed"
SORT created ASC
```

## Specs currently in flight

```dataview
TABLE status as "Status", owner as "Owner", updated as "Updated"
FROM "03-Product/Specs"
WHERE type = "spec" AND status != "shipped" AND status != "archived"
SORT updated DESC
```

## This quarter, at a glance

See [[Roadmap]] for the full Now / Next / Later board and [[Quarters Index|quarterly plans]].
