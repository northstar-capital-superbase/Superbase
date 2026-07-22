---
type: meta
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meta, conventions]
---

# Conventions

> [!info] Why this page exists
> Dataview dashboards, Templater templates, and cross-links all silently depend on notes following the *same* rules. Without one written-down convention, every author invents their own, and the dashboards throughout this vault (starting with [[Home]]) quietly stop working. This page is that single source of truth.

> [!tip] When to use this page
> Reference it every time you create a new note by hand instead of from a template, or whenever a Dataview query returns fewer results than expected — the first thing to check is whether frontmatter matches this schema.

> [!note] How it connects to the rest of the vault
> Every template in [[Templates Index]] already implements these rules. Every `Index` page in every folder queries against this schema. This page is the contract between the two.

---

## Frontmatter schema

Every note (except quick throwaway scratch notes, which shouldn't be committed at all) starts with YAML frontmatter:

```yaml
---
type: spec              # required — see the type table in [[Vault Guide]]
status: draft            # required for anything with a lifecycle (see below)
owner: "Placeholder — Person Name"   # required — who is accountable for this note
created: 2026-07-22       # required — ISO date, set once
updated: 2026-07-22       # optional — bump on substantive edits
tags: [billing, api]     # optional — see tagging rules below
---
```

Fields that don't apply to a note type (e.g. `status` on a Canon page that never changes state) may be omitted, but `type`, `owner`, and `created` are always present.

## Status vocabulary

Reuse this exact vocabulary — Dataview filters in the dashboards match on these literal strings.

| Status | Meaning | Used by |
|---|---|---|
| `draft` | Being written, not yet reviewed | specs, research, ADRs |
| `proposed` | Written and ready for a decision | ADRs |
| `accepted` | Decision made, in effect | ADRs |
| `deprecated` | No longer recommended, not yet replaced | ADRs, standards |
| `superseded` | Replaced by a specific newer note (link it) | ADRs |
| `active` | Currently true / in use | systems, standards, recurring meetings |
| `shipped` | Built and released | specs, features |
| `exploring` | Early, pre-spec | research, experiments |
| `archived` | Historical only, kept for context | any type |

## Naming rules

- **Note titles are the filename.** Use `Title Case With Spaces.md` for hand-authored pages (`Values & Principles.md`). Obsidian wikilinks read better this way than `kebab-case`.
- **ADRs** are the one exception, because they need a stable, sortable, permanent ID: `ADR-0001-short-kebab-title.md`. Never renumber or delete an ADR — see [[ADR Index]].
- **Dated notes** (meetings, 1:1s) use `YYYY-MM-DD Title.md` so they sort chronologically in the file explorer without relying on frontmatter: `2026-07-22 Weekly Eng Sync.md`.
- **Index pages** are always named `<Section> Index.md`, except the very top one, which is [[Home]], and Canon's, which is [[Canon]] (see [[Canon]] for why it's the one exception).

## Linking rules

- Prefer `[[Wikilinks]]` over Markdown links for anything inside the vault — they survive renames and power Obsidian's graph/backlinks.
- Link to the *index* of a section from outside that section, and only deep-link to a specific leaf note when you mean that exact note (e.g. link [[Engineering Index]] from a roadmap item, but link a specific `ADR-0007-...` from a spec that depends on that exact decision).
- Every leaf note should have at least one inbound link from an index or a related note. An unlinked note is undiscoverable — if you can't find a natural place to link it from, that's a signal it's in the wrong folder.

## Tagging rules

Tags are for *cross-cutting* concerns that don't map to folders — a feature area, a system name, a customer segment. Don't tag with something a folder or `type` already tells you (no `#adr` tag on ADRs; the folder and `type` already say that).

Keep the tag vocabulary small and grep-able before adding a new one — check existing tags with:

```dataview
TABLE DISTINCT tags
FROM ""
FLATTEN tags
```

## Callout conventions

This vault uses three callouts consistently, in every note that needs them:

```markdown
> [!info] Why this page exists
> ...

> [!tip] When to use this page
> ...

> [!note] How it connects to the rest of the vault
> ...

> [!todo] Placeholder
> Replace with real content. Owner: <role>.
```

Using the same three callout types everywhere means a reader can visually scan for "why/when/how" on any page in the vault, even one they've never seen before.
