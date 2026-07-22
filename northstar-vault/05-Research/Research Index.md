---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [research]
---

# Research

> [!info] Why this page exists
> Decisions are only as good as the evidence behind them. This section exists so market context, competitive awareness, user understanding, and experiment results are captured durably — instead of living in someone's notes app or being re-derived from scratch each time a similar question comes up.

> [!tip] When to use this page
> Land here before starting new research to check whether the question's already been (partially) answered. Log findings here as they're produced, even if inconclusive — a documented "we tried this and it didn't tell us much" saves someone from repeating it.

> [!note] How it connects to the rest of the vault
> Research should inform [[Personas Index|personas]] and [[Specs Index|specs]] — link forward from the research note to what it influenced, and back from the spec/persona to the research it's grounded in.

---

## The four subfolders

| Folder | Question it answers |
|---|---|
| [[Market Index\|Market]] | What's happening in the broader market/industry? |
| [[Competitive Index\|Competitive]] | What are others building, and how does that inform us? |
| [[User Research Index\|User Research]] | What do actual users say/do? |
| [[Experiments Index\|Experiments]] | What did we test, and what happened? |

## Recent research

```dataview
TABLE type as "Type", status as "Status", updated as "Updated"
FROM "05-Research"
WHERE type != "index"
SORT updated DESC
LIMIT 10
```
