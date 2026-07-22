---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [product]
---

# Product

> [!info] Why this page exists
> Product knowledge sprawls fast: who we're building for, what we're building, what we've shipped, and what customers say about it. This page is the single map across those four, so nobody has to guess which subfolder holds what.

> [!tip] When to use this page
> Land here when you're not sure whether something is a persona, a spec, a feature doc, or feedback — the definitions below disambiguate. Use it as the jumping-off point before starting new product work.

> [!note] How it connects to the rest of the vault
> Specs here should trace back to [[Mission & Vision]] and respect [[Values & Principles]]. A spec that becomes real work should be reflected on [[Roadmap]]; once shipped, it graduates from Specs into [[Features Index|Features]] (see below).

---

## The four subfolders

| Folder | Question it answers | Lifecycle |
|---|---|---|
| [[Personas Index\|Personas]] | Who are we building for? | Long-lived, revised occasionally |
| [[Specs Index\|Specs]] | What are we about to build, and why? | Written before build, `draft` → `shipped` |
| [[Features Index\|Features]] | What have we actually built, and how does it work today? | Living doc, updated as the feature evolves |
| [[Feedback Index\|Feedback]] | What are customers telling us? | Continuous intake |

## The spec → feature lifecycle

A spec (in `Specs/`) is written to propose and scope work. Once the work ships, create the corresponding page in `Features/` (using [[Feature Doc Template]]) describing the feature *as it actually behaves* — specs describe intent and go stale; feature docs describe reality and are kept current. Link the feature doc back to the originating spec rather than merging them, so the historical "why we scoped it that way" is preserved.

## Open specs

```dataview
TABLE status as "Status", owner as "Owner", updated as "Updated"
FROM "03-Product/Specs"
WHERE type = "spec" AND status != "shipped" AND status != "archived"
SORT updated DESC
```

## Recent feedback

```dataview
TABLE owner as "Owner", created as "Received"
FROM "03-Product/Feedback"
WHERE type = "feedback"
SORT created DESC
LIMIT 10
```
