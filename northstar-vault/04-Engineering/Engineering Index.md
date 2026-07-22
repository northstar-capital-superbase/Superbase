---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [engineering]
---

# Engineering

> [!info] Why this page exists
> Engineering knowledge has a short half-life if it only lives in people's heads and Slack threads. This page is the map across the five kinds of engineering documentation this vault distinguishes, so new engineers and future-you know exactly where to look and where to write.

> [!tip] When to use this page
> Land here when starting as a new engineer (see [[Onboarding Index]] first), or when unsure whether something you're about to write is architecture, a standard, a runbook, or a system doc — the table below disambiguates.

> [!note] How it connects to the rest of the vault
> Engineering docs implement decisions made in [[ADR Index]] and build toward specs in [[Specs Index]]. Diagrams referenced from here live in [[Excalidraw Index]], organized under `Excalidraw/Architecture/`.

---

## The five subfolders

| Folder | Question it answers | Changes how often |
|---|---|---|
| [[Architecture Index\|Architecture]] | How do our systems fit together, at a high level? | Rarely — updated deliberately |
| [[Standards Index\|Standards]] | How do we write, review, and ship code? | Occasionally |
| [[Runbooks Index\|Runbooks]] | What do we do when something breaks? | As operational reality changes |
| [[Onboarding Index\|Onboarding]] | How does a new engineer get productive? | Occasionally |
| [[Systems Index\|Systems]] | How does *this specific* service/module work? | Whenever that system changes |

## Recently touched engineering docs

```dataview
TABLE type as "Type", status as "Status", file.mtime as "Updated"
FROM "04-Engineering"
WHERE type != "index"
SORT file.mtime DESC
LIMIT 10
```
