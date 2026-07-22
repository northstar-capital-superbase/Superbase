---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [adr]
---

# Decisions (ADRs)

> [!info] Why this page exists
> Every non-trivial technical or product decision has a "why" that's obvious the day you make it and completely opaque a year later. Architecture Decision Records (ADRs) capture that "why" once, at the moment it's clearest, so nobody has to reverse-engineer intent from code or guess whether a constraint is still valid.

> [!tip] When to use this page
> Land here to browse or search decisions before re-opening a debate — check whether it's already been decided (and why) before re-deciding it. Create a new ADR (from [[ADR Template]]) whenever a decision is: hard to reverse, affects multiple people/systems, or was genuinely debated between real alternatives. Don't write an ADR for something with one obvious answer.

> [!note] How it connects to the rest of the vault
> ADRs sit between [[Canon]] (identity) and execution ([[Product Index]], [[Engineering Index]]) — see [[Vault Guide]]. A spec or system doc that depends on a decision should link the specific `ADR-####` rather than restating it.

---

## How numbering and status work

- IDs are permanent and sequential: `ADR-0001`, `ADR-0002`, ... Never reuse or renumber, even if a decision is later reversed — see [[ADR-0001-record-architecture-decisions]] for the reasoning.
- An ADR is never edited to "just fix" the decision once `accepted`. To change your mind, write a **new** ADR that supersedes the old one and link both directions (`supersedes` / `superseded-by` frontmatter).
- Status values, per [[Conventions]]: `proposed` → `accepted` → (optionally) `deprecated` or `superseded`.

## All decisions

```dataview
TABLE status as "Status", owner as "Owner", created as "Opened", supersedes as "Supersedes"
FROM "02-Decisions"
WHERE type = "adr"
SORT file.name ASC
```

## Awaiting a decision

```dataview
TABLE owner as "Owner", created as "Opened"
FROM "02-Decisions"
WHERE type = "adr" AND status = "proposed"
SORT created ASC
```

To create a new one, use [[ADR Template]] (or let Templater's folder-template mapping — see [[Plugin Setup]] — apply it automatically when you create a file in this folder).
