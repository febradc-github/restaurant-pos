---
type: domain
tags: [code/frontend, ui/accessibility]
aliases: ["C-31 learnings", "Owner Console audit findings"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[US-31]]", "[[EP-28]]"]
sources: []
---

# Owner Console UI Audit Learnings (C-31)

Architectural and design facts discovered during [[US-31]] that apply to C-32/C-33 audits and future front-end work.

## ConfigProvider & Theme Tokens

This app's ConfigProvider never enables antd's `cssVar` mode, which means plain .css files have no mechanism to reference theme.ts tokens at runtime. Components needing runtime-theme-aware color must use `theme.useToken()` in TSX instead (see SalesTrendChart.tsx pattern). Raw hex values in .css files (TableLayoutEditor.css, OwnerPage.css, OrderTaking.css) are an architectural fact of this codebase, not a per-page audit finding to "fix" without a broader theming-architecture decision first.

## index.css Typography Trap

index.css contains leftover boilerplate from the pre-C-29 landing-page template: `h1, h2 { font-family: var(--heading); color: var(--text-h); margin: 0 0 8px }`. This rule silently reskins any raw `<h2>` in the app that doesn't use antd's `Typography.Title`. It was never removed by C-29 (which only touched #root/#center/App.css, not this rule) and creates a latent trap: any future page/component reaching for a plain `<h2>` instead of `Typography.Title` will inherit this styling and bypass antd theming.

Established pattern for owned/conforming pages: use `Typography.Title level={2}` instead of raw `<h2>`.

## Owner Console UI Density Pattern

Owner Console's compact/small-sized table and form controls are a deliberate, consistent pattern distinct from the app's `size="large"` touch-target convention (which applies to frontline/high-frequency/sometimes-gloved-hand interactions like OrderTaking, KitchenClockPad, KitchenDisplay, Login). This is a conscious trade-off for back-office information density.

Do not treat Owner Console's smaller controls as a C-30-style touch-target accessibility finding in C-32/C-33 -- the density pattern is intentional and different from frontline/customer-facing UI.

## Deferred Fixes & Reasoning

TableLayoutEditor's canvas delete-button (×) and resize-handle are ~20px, below the 44px touch-target guideline. These are deferred with documented reasoning, not bugs:
- They scale with the represented table (MIN_TABLE_SIZE=20px)
- A real fix requires redesigning the floor-plan editor's interaction model (e.g. a selection-based toolbar with separate controls)
- Out of scope for an audit ticket
- Resize handle also lacks keyboard-driven equivalent (would be a new accessibility feature, not an audit fix)

Document deferred findings in this style for C-32/C-33 rather than treating them as missing work.
