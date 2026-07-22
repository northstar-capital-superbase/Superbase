---
type: index
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [templates]
---

# Templates

> [!info] Why this page exists
> Consistency across hundreds of notes over years only happens if creating a new one is easier *with* the convention than without it. Templater templates make the [[Conventions|frontmatter schema]] and page structure the path of least resistance, instead of something people have to remember to copy-paste correctly.

> [!tip] When to use this page
> Browse it to find the right starting point for a new note. In practice you shouldn't need to open this page often — [[Plugin Setup]]'s folder-template mapping applies the correct template automatically when you create a file in the matching folder.

> [!note] How it connects to the rest of the vault
> Every template here implements the schema in [[Conventions]] and produces a note of a specific `type` from [[Vault Guide]]'s type table. This list covers today's two note types; the same [[Vault Guide#How the vault grows]] principle applies here — a new template is added in the same change that introduces the section it belongs to, not before.

---

## All templates

| Template | Produces `type` | Used in |
|---|---|---|
| [[Canon Page Template]] | `canon` | [[Canon]] |
| [[ADR Template]] | `adr` | [[ADR Index]] |

## Template conventions

- Every template's frontmatter uses Templater syntax to auto-fill `created` (`<% tp.date.now("YYYY-MM-DD") %>`) and prompts for `owner` — see either template for the pattern.
- Every template body includes the three required callouts from [[Conventions]] (Why / When / How) pre-filled with the *generic* explanation for that note type, so the author only has to fill in the specific content, not invent the boilerplate.
- Templates never hard-code a real person's name, a real metric, or invented company detail — they use `> [!todo] Placeholder` callouts, consistent with the placeholder convention in [[Vault Guide]].
