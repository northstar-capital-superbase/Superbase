---
type: index
status: active
owner: "Placeholder — Head of Product"
created: 2026-07-22
updated: 2026-07-22
tags: [product, personas]
---

# Personas

> [!info] Why this page exists
> Every product decision implicitly assumes a user. Writing personas down makes that assumption explicit and shared, instead of every person on the team carrying a slightly different mental model of "our user."

> [!tip] When to use this page
> Reference a specific persona in a [[Specs Index|spec]] whenever you write "the user wants..." — link the persona instead of describing them again inline. Create a new persona (via [[Persona Template]]) when a spec keeps needing to describe a user type that doesn't exist here yet. Revise a persona when real user research (see [[User Research Index]]) contradicts it — don't let personas ossify into assumptions nobody's checked in years.

> [!note] How it connects to the rest of the vault
> Personas should be grounded in [[User Research Index]] findings, not invented from imagination. [[Specs Index|Specs]] and [[Feature Doc Template|feature docs]] should reference personas by link.

---

## All personas

```dataview
TABLE owner as "Owner", updated as "Last reviewed"
FROM "03-Product/Personas"
WHERE type = "persona"
SORT file.name ASC
```

> [!todo] Placeholder
> Add the first persona using [[Persona Template]] once there's real user research to base it on — don't invent personas speculatively.
