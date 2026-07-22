---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [engineering, runbooks, oncall]
---

# Runbooks

> [!info] Why this page exists
> When something breaks at 2am, nobody should have to reconstruct the fix from memory or Slack archaeology. Runbooks are step-by-step, tested procedures for known operational situations, written *before* they're needed.

> [!tip] When to use this page
> Follow a runbook during an incident that matches its trigger condition. Write a new one (from [[Runbook Template]]) immediately after any incident that didn't have one — capture the fix while it's fresh, not weeks later.

> [!note] How it connects to the rest of the vault
> Runbooks reference the specific [[Systems Index|system]] they apply to. A runbook that reveals a deeper design flaw should motivate a new [[ADR Index|ADR]] or a [[Specs Index|spec]] for a real fix, not just a permanent workaround.

---

## All runbooks

```dataview
TABLE status as "Status", updated as "Last verified"
FROM "04-Engineering/Runbooks"
WHERE type = "runbook"
SORT file.name ASC
```

> [!todo] Placeholder
> Add runbooks as real operational procedures are established (deploy rollback, database failover, on-call escalation, etc.). Owner: Engineering Lead.
