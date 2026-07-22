---
type: meta
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meta, changelog]
---

# Vault Changelog

> [!info] Why this page exists
> The vault's *structure* is itself a decision that should be traceable, the same way [[ADR Index|ADRs]] make product/engineering decisions traceable. This is a short, dated log of changes to the vault's information architecture — new folders, renamed sections, retired templates — so nobody has to reverse-engineer "why is it like this" from git blame alone.

> [!tip] When to use this page
> Add an entry whenever you add/remove/rename a top-level folder, change the frontmatter schema in [[Conventions]], or add a new note `type`. Do **not** log routine content additions here — that's what git history and each `Index` page's "recently updated" query are for.

> [!note] How it connects to the rest of the vault
> This is scoped to the vault's *shape*, not its *content*. Company-facing history (milestones, launches) lives in [[History & Milestones]]; shipped-feature history lives in [[Roadmap#Shipped|the Roadmap changelog]].

---

## Log

| Date | Change | Why |
|---|---|---|
| 2026-07-22 | Added scaffolding (folder, index, Dataview dashboard, Templater template) for Product, Engineering, Research, Meetings, and Roadmap | Complete the vault's *shape* per [[Vault Guide#How the vault grows]], so every future note has somewhere to go. No leaf content was added — each folder's index still says what has to be true before its first real note is written |
| 2026-07-22 | Core vault created: `00-Meta`, [[Canon]], [[ADR Index\|Decisions]], `Templates` (ADR + Canon Page), `Excalidraw`, `Attachments`, `Home` | Establish the minimal, complete documentation core — see [[Vault Guide]] for the reasoning |

> [!todo] Placeholder
> Continue this log as the vault evolves. Newest entries at the top.
