---
type: meeting
series: "<% tp.system.prompt('Recurring series (leave blank if one-off)') %>"
owner: "<% tp.system.prompt('Note-taker (name/role)') %>"
attendees: []
created: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

# <% tp.file.title %>

> [!info] Why this page exists
> This is the record of one specific meeting — what was discussed, decided, and who's doing what next — so decisions don't rely on everyone's memory of the conversation. See [[Meetings Index]].

> [!tip] When to use this page
> Fill in during or immediately after the meeting. Name the file `YYYY-MM-DD Meeting Title.md` per [[Conventions]] so it sorts chronologically.

> [!note] How it connects to the rest of the vault
> If this is part of a recurring series, set `series` to match that hub page's title in [[Recurring Index]]. Any decision made here that should bind future work belongs as a real [[ADR Index|ADR]], not just these notes.

---

## Agenda

> [!todo] Placeholder

## Notes

> [!todo] Placeholder

## Decisions

> [!todo] Placeholder
> If significant, promote to an [[ADR Template|ADR]].

## Action items

> [!todo] Placeholder
> Who, what, by when.
