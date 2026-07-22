---
type: system
status: active
owner: "<% tp.system.prompt('Owner (name/role)') %>"
created: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---

# <% tp.file.title %>

> [!info] Why this page exists
> This is the durable technical reference for one specific system/service — what it does, how it's built, and how it fits with the rest of the architecture — so that knowledge doesn't live only with whoever last touched it. See [[Systems Index]].

> [!tip] When to use this page
> Read it before making changes to this system. Update it whenever the system's real behavior, dependencies, or operational characteristics change.

> [!note] How it connects to the rest of the vault
> Link the [[Architecture Index|architecture diagram]] this system appears in and any [[ADR Index|ADRs]] that shaped its design. Link relevant [[Runbooks Index|runbooks]].

---

## Purpose

> [!todo] Placeholder
> What does this system do, in one or two sentences?

## Design

> [!todo] Placeholder
> Key components, data flow, notable constraints. Embed a diagram from `Excalidraw/Architecture/` if helpful — see [[Excalidraw Index]].

## Dependencies

> [!todo] Placeholder
> What it depends on, and what depends on it.

## Operating this system

> [!todo] Placeholder
> Link relevant [[Runbooks Index|runbooks]] rather than duplicating operational steps here.
