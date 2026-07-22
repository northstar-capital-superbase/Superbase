---
type: meta
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meta, plugins]
---

# Plugin Setup

> [!info] Why this page exists
> The dashboards, templates, and diagrams in this vault only work if the right community plugins are installed and configured the same way on every contributor's machine. This page is the checklist so a new laptop reaches parity in minutes, not by trial and error.

> [!tip] When to use this page
> The first time you open this vault on a new device, and any time a dashboard or template silently "does nothing" (usually a missing/misconfigured plugin).

> [!note] How it connects to the rest of the vault
> Dataview powers every `Index` note (see [[Conventions]] for the frontmatter it depends on). Templater powers every note in [[Templates Index]]. Excalidraw powers [[Excalidraw Index]]. Git powers the workflow in [[Git Integration]].

---

## Required community plugins

| Plugin | Used for | Notes |
|---|---|---|
| **Dataview** | Every dashboard/index page in this vault | Enable "Automatic view refresh" so tables stay live |
| **Templater** | All templates in [[Templates Index]] | Folder templates config below |
| **Excalidraw** | Diagrams referenced in [[Excalidraw Index]] | Set default save folder to `Excalidraw/` |
| **Obsidian Git** | Optional in-app commit/push (see [[Git Integration]]) | Skip if you prefer the CLI |
| **Linter** | Keeps frontmatter/whitespace consistent on save | Recommended, not required |

Core plugins to leave enabled: **Backlinks**, **Outgoing links**, **Tags**, **Templates** (Obsidian's built-in one can stay off once Templater is set up — Templater supersedes it).

## Templater configuration

In **Settings → Templater**:

- **Template folder location:** `Templates`
- **Trigger Templater on new file creation:** on
- **Folder templates** — map each content folder to its template so `Ctrl/Cmd+N` in that folder pre-fills the right structure:

| Folder | Template |
|---|---|
| `02-Decisions` | `Templates/ADR Template.md` |
| `03-Product/Personas` | `Templates/Persona Template.md` |
| `03-Product/Specs` | `Templates/Spec (PRD) Template.md` |
| `03-Product/Features` | `Templates/Feature Doc Template.md` |
| `03-Product/Feedback` | `Templates/Feedback Note Template.md` |
| `04-Engineering/Systems` | `Templates/System Doc Template.md` |
| `04-Engineering/Runbooks` | `Templates/Runbook Template.md` |
| `05-Research/*` (all four subfolders) | `Templates/Research Note Template.md` |
| `06-Meetings/Notes` | `Templates/Meeting Note Template.md` |
| `06-Meetings/1-1s` | `Templates/1-1 Template.md` |
| `06-Meetings/Recurring` | `Templates/Recurring Meeting Template.md` |
| `07-Roadmap/Quarters` | `Templates/Quarterly Plan Template.md` |
| `01-Canon` | `Templates/Canon Page Template.md` |

## Dataview configuration

In **Settings → Dataview**: enable **Enable JavaScript Queries** is *not* required — every query in this vault intentionally uses plain DQL (`dataview` code blocks), not DataviewJS, to keep queries readable and reviewable by non-engineers. Keep it disabled unless a future page explicitly needs it, and document why in that page's "why this exists" callout if you do.

## Excalidraw configuration

In **Settings → Excalidraw**:

- **Excalidraw folder:** `Excalidraw`
- **Embed / display mode:** "Excalidraw" (renders the drawing, not raw JSON, when previewed)

See [[Excalidraw Index]] for naming and linking conventions.

## What to commit vs. ignore

See [[Git Integration]] for the full `.obsidian/` policy — in short: plugin lists and settings are committed so the whole team shares one config; workspace/cache state is ignored because it's per-device.
