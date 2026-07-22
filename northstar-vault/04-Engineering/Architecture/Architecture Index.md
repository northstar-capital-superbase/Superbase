---
type: index
status: active
owner: "Placeholder — Engineering Lead"
created: 2026-07-22
updated: 2026-07-22
tags: [engineering, architecture]
---

# Architecture

> [!info] Why this page exists
> The system-level picture — how services, data stores, and integrations fit together — is the hardest thing to reconstruct from code alone. This folder is the durable, diagram-backed description of that shape, kept separate from the day-to-day detail that lives in [[Systems Index]].

> [!tip] When to use this page
> Read it before making any change that crosses system boundaries. Update it when the *shape* of the system changes (a new major service, a data store migration, a new integration) — not for internal changes within one system, which belong in [[Systems Index]].

> [!note] How it connects to the rest of the vault
> A significant architectural change should be backed by an [[ADR Index|ADR]] explaining why, and any accompanying diagram lives in `Excalidraw/Architecture/` (see [[Excalidraw Index]]) and is embedded here with `![[diagram-name]]`.

---

## System map

> [!todo] Placeholder
> Embed the current high-level architecture diagram once it exists: `![[Excalidraw/Architecture/System Map.excalidraw]]`. Owner: Engineering Lead.

## Architecture docs

```dataview
LIST
FROM "04-Engineering/Architecture"
WHERE type = "system" OR type = "standard"
SORT file.name ASC
```

## Related decisions

```dataview
TABLE status as "Status"
FROM "02-Decisions"
WHERE type = "adr" AND contains(tags, "architecture")
SORT file.name ASC
```
