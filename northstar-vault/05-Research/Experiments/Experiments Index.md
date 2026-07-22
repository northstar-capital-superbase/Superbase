---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [research, experiments]
---

# Experiments

> [!info] Why this page exists
> Experiments (A/B tests, pilots, small bets) produce results that are easy to misremember after the fact ("didn't we try that already?"). This folder is the durable record of what was tried, the hypothesis, and the actual result — including negative results.

> [!tip] When to use this page
> Log a note (from [[Research Note Template]], with `type: experiment`) before running an experiment (hypothesis + design) and update it with results when it concludes. Check here before re-running something that may have already been tried.

> [!note] How it connects to the rest of the vault
> An experiment should trace back to the [[Specs Index|spec]] or question that motivated it, and its result should inform the next [[Roadmap]] decision either way — a "failed" experiment with a documented result is still valuable.

---

## All experiments

```dataview
TABLE status as "Status", updated as "Updated"
FROM "05-Research/Experiments"
WHERE type = "experiment"
SORT updated DESC
```
