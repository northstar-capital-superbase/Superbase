---
type: meta
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meta, git]
---

# Git Integration

> [!info] Why this page exists
> Treating documentation like code — versioned, reviewed, diffable — is what makes this vault trustworthy over years instead of degrading into stale wiki pages. This page defines exactly how Git is used so that policy survives founder → team → org transitions.

> [!tip] When to use this page
> When setting up the vault on a new machine, when deciding whether a change needs review, or when writing the commit message for a documentation change.

> [!note] How it connects to the rest of the vault
> This is the operational counterpart to [[Vault Guide]] and [[Conventions]] — those define *what* good content looks like; this defines *how it gets safely committed*.

---

## Two supported workflows

Pick one per contributor; both are fine to mix within the same team:

1. **CLI Git** (recommended for anyone already comfortable with `git`) — the vault is just a folder in a repo; commit/push as normal.
2. **Obsidian Git plugin** — for non-technical contributors (e.g. a founder without a terminal habit), it adds a commit/push command and can auto-commit on an interval. Configure it to commit on a schedule, not on every keystroke, to avoid one-line-diff spam.

## What to commit vs. ignore

Obsidian's `.obsidian/` folder mixes **shared configuration** with **per-device UI state**. The vault's [`.gitignore`](../.gitignore) draws the line as:

| Commit | Ignore |
|---|---|
| `.obsidian/community-plugins.json` | `.obsidian/workspace.json` |
| `.obsidian/core-plugins.json` | `.obsidian/workspace-mobile.json` |
| `.obsidian/*/data.json` for **Dataview, Templater, Excalidraw** settings | `.obsidian/cache/` |
| — | `.trash/` |

Rationale: the left column is "how the vault behaves for everyone," the right column is "which panes were open on my laptop last Tuesday." See the actual [`.gitignore`](../.gitignore) for the enforced rules.

## Commit message convention

Use a `docs(<area>): <summary>` prefix so documentation history is greppable and distinguishable from app-code commits in the same repository:

```
docs(canon): update mission statement
docs(adr): add ADR-0012 on event bus choice
docs(meta): tighten the frontmatter schema
```

`<area>` should match a top-level folder name (`canon`, `adr`, `meta`, plus whichever new area a future section introduces per [[Vault Guide#How the vault grows]]).

## Review policy by area

Not every note carries the same blast radius if it's wrong. Match review rigor to consequence — this table covers today's two sections; add a row here in the same change that introduces a new section per [[Vault Guide#How the vault grows]], since each area's review policy should be decided deliberately rather than defaulted:

| Area | Review needed | Why |
|---|---|---|
| [[Canon]] | Required (PR + explicit approval) | Identity-defining; changes here should be rare and deliberate |
| [[ADR Index]] (status `accepted`) | Required (PR) | An accepted ADR is a binding decision; changing it retroactively is itself a decision |

As the team grows past a solo founder, formalize the "required" row with a `CODEOWNERS` entry (e.g. `northstar-vault/01-Canon/* @founders`, `northstar-vault/02-Decisions/* @eng-leads`) so GitHub/GitLab enforces it automatically.

## Branching

- **Solo founder / small team:** commit most changes directly to the main branch — documentation rarely needs the ceremony of app-code branching.
- **Growing team:** open a short-lived branch for anything in the "Required" review row above; everything else can still go direct-to-main. Don't force a branch-per-meeting-note workflow — that's ceremony without benefit.

## Merge-conflict hygiene

Obsidian has no structural merge tool, so conflicts are resolved as plain text. Two habits keep this rare:

- **One concern per file.** An ADR, a Canon page — never combine unrelated edits in one note, so two people rarely touch the same file for different reasons.
- **Dashboards are generated, not edited.** [[Home]] and every `Index` page are Dataview queries with almost no hand-written prose — there's nothing there for two people to conflict over.

## Large binary assets

Excalidraw drawings are stored as Markdown-embedded JSON and stay small, but exported PNGs/PDFs in `Attachments/` can grow large over years. If that folder starts dominating repo size, introduce **Git LFS** for it specifically rather than for the whole vault.

## Continuous integration (optional, recommended once the team grows)

A lightweight CI job on this folder catches drift cheaply:

- **Markdown lint** (`markdownlint`) for consistent formatting.
- **Broken internal link check** (e.g. `lychee` or an Obsidian-aware link checker) so a renamed note doesn't leave silent dead links.
- **Frontmatter schema check** — a small script asserting every `.md` file (outside `Templates/`) has `type`, `owner`, and `created`, per [[Conventions]].

> [!todo] Placeholder
> Wire an actual CI workflow for this folder when the team is large enough that broken links/frontmatter start slipping through review. Owner: Engineering lead.
