---
type: domain
tags: [code/frontend, ui-redesign]
aliases: ["responsive breakpoint patterns", "matchMedia vs antd Layout.Sider"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-ordertaking-tsx]]", "[[frontend-src-components-OwnerPage-tsx]]", "[[US-37]]", "[[US-39]]"]
sources: []
---

# Two responsive-breakpoint patterns now coexist in frontend (C-37 vs C-39)

## Pattern 1: antd Layout.Sider breakpoint (C-37)

[[frontend-src-components-OwnerPage-tsx|OwnerPage.tsx]] uses antd's `Layout.Sider` `breakpoint`/`onBreakpoint` props to toggle sidebar visibility based on screen size. The Sider component manages its own responsive state internally.

## Pattern 2: matchMedia hook (C-39)

[[frontend-src-components-ordertaking-tsx|OrderTaking.tsx]] introduces a custom `useIsNarrowViewport()` hook that wraps `window.matchMedia('(max-width: 991.98px)')` to swap a persistent order-summary panel for a compact bottom bar below tablet width. Chosen for testability in jsdom/vitest: the hook can be stubbed deterministically with an existing `stubNarrowViewport()` test helper, whereas antd's Sider breakpoint callbacks are harder to mock cleanly.

## Why two patterns?

No unified convention was established before C-37 and C-39 shipped. The coder of C-39 chose matchMedia because it's simpler to test than antd's Layout.Sider in jsdom without pulling in additional mocking libraries.

## Recommendation

For future tickets, establish a single responsive-breakpoint convention (prefer antd's built-in breakpoint system, or standardize on matchMedia across the app). Note: the 991.98px breakpoint in OrderTaking matches antd's `lg` breakpoint (where Sider typically switches), so there's no visual discontinuity — they're aligned semantically, just implemented differently.
