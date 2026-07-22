# Northstar Vault

This folder is a self-contained **Obsidian vault** — the internal knowledge base for Northstar. It is versioned in this repository like any other source artifact, but it is not application code and has no runtime dependency on the app in the rest of this repo.

## Opening the vault

1. In Obsidian, choose **Open folder as vault** and select `northstar-vault/`.
2. Install the community plugins listed in [`00-Meta/Plugin Setup.md`](00-Meta/Plugin%20Setup.md) (Dataview, Templater, Excalidraw, Git, Linter).
3. Open [`Home.md`](Home.md) — it is the front door to everything else.

## What this is (and isn't)

- This is a **documentation framework**, not filled-in company history. Every place where real Northstar information belongs is marked with an explicit `> [!todo] Placeholder` callout.
- It ships as a **minimal, complete core** rather than a large tree of speculative folders. A new section (Product, Engineering, Research, Meetings, Roadmap, ...) is added only once real work earns it — see [`00-Meta/Vault Guide.md`](00-Meta/Vault%20Guide.md#how-the-vault-grows) for that principle and the reserved numbering.
- It is not a personal notebook. Every page is written as if a new hire, three years from now, will open it cold and need to understand why it exists.

## Where to go next

| I want to... | Go to |
|---|---|
| Understand how the vault is organized | [`00-Meta/Vault Guide.md`](00-Meta/Vault%20Guide.md) |
| Learn the naming/frontmatter/tagging rules | [`00-Meta/Conventions.md`](00-Meta/Conventions.md) |
| See required plugins and settings | [`00-Meta/Plugin Setup.md`](00-Meta/Plugin%20Setup.md) |
| Understand how this vault is versioned with Git | [`00-Meta/Git Integration.md`](00-Meta/Git%20Integration.md) |
| Start using the vault day-to-day | [`Home.md`](Home.md) |
