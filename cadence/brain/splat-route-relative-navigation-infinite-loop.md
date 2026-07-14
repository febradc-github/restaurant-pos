---
type: domain
tags: [code/frontend]
aliases: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-app-tsx]]", "[[src-components-ownerpage-tsx]]", "[[US-16]]", "[[EP-14]]"]
sources: []
---

# Splat-route relative-navigation infinite loop

When a component with its own nested Routes is mounted at a parent route using a splat (e.g., `path="/owner/*"`), react-router resolves *relative* `navigate()` calls and relative `<Navigate to>` against the *entire currently-matched pathname*, including whatever the splat captured—not just the static `/owner` prefix.

Calling `navigate('menu')` while at `/owner/tables` produces `/owner/tables/menu`, not `/owner/menu`. If a catch-all or error boundary inside that nested tree then does its own relative redirect (e.g., `navigate('tables')`) to "recover", the two relative navigations chase each other and loop forever. No error is thrown; the render loop just pegs CPU with no output.

**Fix**: Every navigation target inside a component mounted at a splat route must be absolute. Build the full path explicitly (e.g., `/owner/menu`), never use relative navigation.

**Observed**: Surfaced during C-16 testing as multi-minute vitest run, hung render loop with no test output or failure message.
