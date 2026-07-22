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
> Read it fully during onboarding (see [[Onboarding Index]]). Come back to it whenever you're unsure where a new note belongs, or when proposing a structural change (log that change in [[Vault Changelog]]).

> [!note] How it connects to the rest of the vault
> This is the parent explanation for [[Conventions]], [[Plugin Setup]], and [[Git Integration]] — read those next, in that order.

---

## Design principles

These five rules were used to decide every folder and file in this vault. When in doubt, defer to them rather than adding new structure:

1. **Simple over comprehensive.** A folder only exists once real content needs it. We do not pre-build structure for hypothetical future needs — see "How the vault grows" below.
2. **Indexes, not duplication.** Every folder has exactly one index note that uses Dataview to surface its contents. We never hand-maintain a second list of "all the specs" or "all the ADRs" anywhere else.
3. **Frontmatter is the API.** Dataview dashboards work because every note follows the schema in [[Conventions]]. If a note doesn't have the right frontmatter, it becomes invisible to every dashboard — treat frontmatter as required, not optional metadata.
4. **Numbered top-level, unnumbered utility.** `00`–`07` folders are numbered because their order tells a story (see below). `Templates/`, `Excalidraw/`, and `Attachments/` are utilities used *by* that story, so they're left unnumbered and sort after it.
5. **Write for the reader three years from now.** Nobody who opens a page should have to ask a person what it means. Placeholders exist so a note's *structure* can be right before its *content* is — see the placeholder convention below.

## The story the top-level folders tell

| Order | Folder | Question it answers |
|---|---|---|
| 00 | `00-Meta/` | How does this vault work? |
| 01 | [[Canon]] | Who are we, and what do we believe? |
| 02 | [[ADR Index]] | How do we make decisions and keep them from being re-litigated? |
| 03 | [[Product Index]] | What are we building, and for whom? |
| 04 | [[Engineering Index]] | How is it actually built and operated? |
| 05 | [[Research Index]] | What have we learned, and what don't we know yet? |
| 06 | [[Meetings Index]] | How do we coordinate as humans? |
| 07 | [[Roadmap]] | Where are we going next? |

Reading top to bottom is, deliberately, reading the company from identity → decisions → execution → learning → coordination → future.

## How the vault grows

This vault was deliberately built in two layers, and the same two-layer model keeps applying forever as the company grows:

1. **Scaffolding** — the folder, its one index note, its Dataview dashboard, and its Templater template. All seven sections above now have this layer in place, so the vault's *shape* is complete and won't need restructuring as the company scales from a solo founder to a multi-team org.
2. **Content** — the actual leaf notes inside a section: a specific ADR, a specific spec, a specific system doc. This layer is filled in only as real work earns it — a folder's own index note says exactly what triggers its first real entry (e.g. [[Systems Index]] says "add the first system doc once there's a real service/module worth documenting").

In other words: **the scaffolding exists so a note never has nowhere to go; the content still has to be earned.** A real decision, a real feature, real research, or a genuine need is what turns a scaffolded section into a lived-in one — never "this might be useful someday." Check [[Vault Changelog]] for the dated log of when each layer was introduced.

## The placeholder convention

Wherever real Northstar-specific information belongs (a mission statement, a person's name, a metric, a decision outcome), the page contains an explicit callout instead of invented content:

```markdown
> [!todo] Placeholder
> Replace with the actual <thing>. Owner: <role>.
```

Never delete a placeholder callout without replacing it with real content — an empty section with no callout looks finished when it isn't, which is worse than an obvious gap. Note the distinction from an *empty section index*: an index like [[Personas Index]] with zero personas isn't missing anything — it's honestly reflecting that no persona has been earned yet, per "How the vault grows" above.

## Note-type reference

Every note has a `type` frontmatter field. This table is the master list — if you introduce a new type, add it here in the same commit.

| `type` | Used for | Lives in |
|---|---|---|
| `meta` | Docs about the vault itself | `00-Meta/` |
| `index` | Per-folder Dataview dashboard | one per folder |
| `canon` | Foundational identity docs | `01-Canon/` |
| `adr` | Architecture Decision Records | `02-Decisions/` |
| `persona` | User/customer personas | `03-Product/Personas/` |
| `spec` | Product specs / PRDs | `03-Product/Specs/` |
| `feature` | Living docs for shipped features | `03-Product/Features/` |
| `feedback` | Customer feedback intake notes | `03-Product/Feedback/` |
| `system` | Per-service/module engineering docs | `04-Engineering/Systems/` |
| `standard` | Engineering standards/guidelines | `04-Engineering/Standards/` |
| `runbook` | Operational/incident procedures | `04-Engineering/Runbooks/` |
| `research` | Research findings | `05-Research/**` |
| `experiment` | A/B tests and experiment write-ups | `05-Research/Experiments/` |
| `meeting` | A single dated meeting's notes | `06-Meetings/Notes/` |
| `1-1` | A single dated 1:1's notes | `06-Meetings/Notes/` |
| `recurring` | A recurring meeting's hub page | `06-Meetings/Recurring/` |
| `roadmap` | Roadmap board | `07-Roadmap/` |
| `quarter` | A quarterly plan / OKR set | `07-Roadmap/Quarters/` |
| `template` | A Templater template | `Templates/` |

See [[Conventions]] for the full frontmatter schema, naming rules, and tagging guidance.
