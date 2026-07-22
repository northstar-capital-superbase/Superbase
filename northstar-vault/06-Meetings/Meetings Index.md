---
type: index
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [meetings]
---

# Meetings

> [!info] Why this page exists
> Meetings generate decisions and context that evaporate the moment everyone closes their laptop, unless someone writes it down. This section exists to make that writing-down structured and low-friction rather than an afterthought.

> [!tip] When to use this page
> Land here to find any past meeting's notes. Create meeting notes from [[Meeting Note Template]] or [[1-1 Template]] — Templater's folder mapping (see [[Plugin Setup]]) applies the right one automatically inside `06-Meetings/Notes/`.

> [!note] How it connects to the rest of the vault
> A decision made in a meeting that's significant enough to bind future work should be promoted into a real [[ADR Index|ADR]] — meeting notes are a record of *discussion*, not a substitute for a decision record.

---

## How this folder is organized

| Subfolder | Contains |
|---|---|
| [[Recurring Index\|Recurring]] | One hub page per recurring meeting series (agenda, cadence, attendees) |
| [[1-1s Index\|1:1s]] | One hub page per person, for their 1:1 series |
| `Notes/` | Every dated meeting instance — team meetings and 1:1s alike, distinguished by `type` frontmatter |

Dated notes live in one flat `Notes/` folder (not nested per series) so the folder tree doesn't grow one level per meeting series — a hub page's Dataview query is what groups them, not the file location. See [[Conventions]] for the `YYYY-MM-DD Title.md` naming rule.

## All meeting notes

```dataview
TABLE type as "Type", owner as "Owner"
FROM "06-Meetings/Notes"
SORT file.name DESC
LIMIT 15
```
