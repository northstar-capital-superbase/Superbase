---
type: meta
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meta, onboarding]
---

# Vault Guide

> [!info] Why this page exists
> A knowledge base only stays useful if everyone agrees on *where things go*. This page is the single explanation of the vault's information architecture — read it once, and every other folder's location becomes predictable instead of arbitrary.

> [!tip] When to use this page
> Read it fully the first time you use this vault. Come back to it whenever you're unsure where a new note belongs, or when proposing a structural change (log that change in [[Vault Changelog]]).

> [!note] How it connects to the rest of the vault
> This is the parent explanation for [[Conventions]], [[Plugin Setup]], and [[Git Integration]] — read those next, in that order.

---

## Design principles

These five rules were used to decide every folder and file in this vault. When in doubt, defer to them rather than adding new structure:

1. **Simple over comprehensive.** A folder only exists once real content needs it. We do not pre-build structure for hypothetical future needs — see "How the vault grows" below.
2. **Indexes, not duplication.** Every folder has exactly one index note that uses Dataview to surface its contents. We never hand-maintain a second list of "all the specs" or "all the ADRs" anywhere else.
3. **Frontmatter is the API.** Dataview dashboards work because every note follows the schema in [[Conventions]]. If a note doesn't have the right frontmatter, it becomes invisible to every dashboard — treat frontmatter as required, not optional metadata.
4. **Numbered top-level, unnumbered utility.** Top-level content folders are numbered because their order tells a story (see below). `Templates/`, `Excalidraw/`, and `Attachments/` are utilities used *by* that story, so they're left unnumbered and sort after it.
5. **Write for the reader three years from now.** Nobody who opens a page should have to ask a person what it means. Placeholders exist so a note's *structure* can be right before its *content* is — see the placeholder convention below.

## The story the top-level folders tell

| Order | Folder | Question it answers |
|---|---|---|
| 00 | `00-Meta/` | How does this vault work? |
| 01 | [[Canon]] | Who are we, and what do we believe? |
| 02 | [[ADR Index]] | How do we make decisions and keep them from being re-litigated? |

Reading top to bottom is, deliberately, reading the company from identity → decisions → (and, as the company grows, on into execution, learning, coordination, and future planning — see below).

## How the vault grows

This vault ships as a **minimal, complete core** rather than a large tree of placeholder folders. The numbering above intentionally starts at `00` and leaves room after `02` — as the company does real work, later-numbered sections get added, each earning its place at the moment it's needed rather than in advance:

| Reserved order | Future section | Gets created when... |
|---|---|---|
| 03 | Product | A real product spec is written |
| 04 | Engineering | A real system exists that needs documenting |
| 05 | Research | Real market, competitive, or user research is performed |
| 06 | Meetings | The team has a recurring meeting worth capturing |
| 07 | Roadmap | There's a real set of priorities to track |

Each of those, when added, follows the same conventions established here: one index note per folder, Dataview-driven dashboards, a matching Templater template, and the same Why/When/How callouts on every page. Check [[Vault Changelog]] for the dated log of when each section was actually introduced, and this page's type-reference table below for the current, authoritative list of what exists today.

This is the practical form of a simple rule: **a note earns its place** because a real decision was made, a real system was built, real research was performed, or someone genuinely needed the document — not because it might be useful someday.

## The placeholder convention

Wherever real Northstar-specific information belongs (a mission statement, a person's name, a metric, a decision outcome) *within a note that does exist*, the page contains an explicit callout instead of invented content:

```markdown
> [!todo] Placeholder
> Replace with the actual <thing>. Owner: <role>.
```

Never delete a placeholder callout without replacing it with real content — an empty section with no callout looks finished when it isn't, which is worse than an obvious gap. This is different from — and much narrower than — leaving an entire folder or note unwritten: a placeholder callout marks a specific gap in a note that already earned its place (like Northstar's mission, which every company needs from day one, even before it's finalized); it is not a substitute for deciding whether a whole new section is warranted yet.

## Note-type reference

Every note has a `type` frontmatter field. This table is the master list of types that exist **today** — if you introduce a new type (typically alongside a new section, per "How the vault grows" above), add it here in the same change.

| `type` | Used for | Lives in |
|---|---|---|
| `meta` | Docs about the vault itself | `00-Meta/` |
| `index` | Per-folder Dataview dashboard | one per folder |
| `canon` | Foundational identity docs | `01-Canon/` |
| `adr` | Architecture Decision Records | `02-Decisions/` |
| `template` | A Templater template | `Templates/` |

See [[Conventions]] for the full frontmatter schema, naming rules, and tagging guidance.
