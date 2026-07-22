---
type: recurring
status: active
owner: "<% tp.system.prompt('Owner (name/role)') %>"
created: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

# <% tp.file.title %>

> [!info] Why this page exists
> This is the durable "hub" for a recurring meeting — its purpose, cadence, and standing agenda — separate from any single instance's notes, which live as dated files. See [[Recurring Index]] (or [[1-1s Index]] if this is a 1:1 series).

> [!tip] When to use this page
> Create it the first time a meeting becomes a standing, repeating thing. Update the standing agenda/attendees here as they change; don't repeat that context in every dated instance.

> [!note] How it connects to the rest of the vault
> Every dated instance in `06-Meetings/Notes/` sets `series` to match this page's title, which the query below picks up automatically.

---

## Purpose

> [!todo] Placeholder
> Why does this meeting exist? What decision or coordination need does it serve?

## Cadence & attendees

> [!todo] Placeholder

## Standing agenda

> [!todo] Placeholder

## Past instances

```dataview
TABLE owner as "Note-taker"
FROM "06-Meetings/Notes"
WHERE series = this.file.name
SORT file.name DESC
```
