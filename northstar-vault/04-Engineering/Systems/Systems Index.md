---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [engineering, systems]
---

# Systems

> [!info] Why this page exists
> As Northstar grows past a single codebase, "how does this particular service actually work" becomes a question only one or two people can answer from memory. This folder holds one durable doc per system/service, so that knowledge survives a vacation, an on-call handoff, or an eventual team transition.

> [!tip] When to use this page
> Create a new system doc (from [[System Doc Template]]) the first time a service/module is significant enough that someone other than its author will need to touch it. Don't create one per file or per small module — this is for units a person would reasonably "own."

> [!note] How it connects to the rest of the vault
> Each system doc should link to the [[Architecture Index|architecture diagram]] it belongs in and to any [[ADR Index|ADRs]] that shaped it. [[Runbooks Index|Runbooks]] and [[Features Index|feature docs]] should link back to the system(s) they depend on.

---

## All systems

```dataview
TABLE status as "Status", owner as "Owner", updated as "Updated"
FROM "04-Engineering/Systems"
WHERE type = "system"
SORT file.name ASC
```

> [!todo] Placeholder
> Add the first system doc once there's a real service/module worth documenting. Owner: Engineering Lead.
