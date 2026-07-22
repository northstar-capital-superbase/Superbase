---
type: index
status: active
owner: "Placeholder — Vault Maintainer"
created: 2026-07-22
updated: 2026-07-22
tags: [excalidraw]
---

# Excalidraw

> [!info] Why this page exists
> Diagrams communicate system shape and flows far better than prose, but scattered image exports rot the moment the system changes. Obsidian's Excalidraw plugin keeps diagrams as editable, versionable Markdown files instead — this page explains where they live and how they're referenced from prose.

> [!tip] When to use this page
> Check here for naming/folder conventions before creating a new diagram. Use it to browse existing diagrams before drawing a near-duplicate.

> [!note] How it connects to the rest of the vault
> Diagrams are drawn here but almost never viewed here directly — they're embedded into the prose page that needs them (`![[diagram-name]]`), most often [[Architecture Index]] and pages under [[Systems Index]].

---

## Organization

Diagrams are grouped by the domain they document, mirroring the vault's own top-level sections — not by author or date, so they stay findable as the team grows:

| Subfolder | For diagrams about |
|---|---|
| `Excalidraw/Architecture/` | System/service topology — embedded in [[Architecture Index]] and [[Systems Index]] pages |
| `Excalidraw/Product/` | User flows, journey maps — embedded in [[Specs Index]] and [[Features Index]] pages |
| `Excalidraw/Whiteboards/` | Freeform brainstorm/session captures — often ephemeral; promote anything durable into a named diagram in the folders above |

## Naming and embedding convention

- Name the file for what it depicts, not for the meeting or date it was drawn in: `Payments Flow.excalidraw.md`, not `2026-07-22 whiteboard.excalidraw.md` (whiteboards are the one exception, since they're explicitly ephemeral).
- Embed with `![[Diagram Name]]` in the prose page that needs it, rather than linking out — the diagram should render inline.
- If a diagram becomes outdated, update it in place. Don't create `Diagram Name v2` — Git history already preserves prior versions if needed (see [[Git Integration]]).

## All diagrams

```dataview
LIST
FROM "Excalidraw"
WHERE file.name != "Excalidraw Index"
SORT file.folder ASC, file.name ASC
```

> [!todo] Placeholder
> Add the first architecture diagram (e.g. a system map) once there's a real system to draw — link it from [[Architecture Index]].
