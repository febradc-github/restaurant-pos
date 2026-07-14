---
type: file
tags: [code/frontend]
aliases: ["src/components/KitchenPage.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-kitchenpage-tsx]]", "[[src-components-kitchendisplay-tsx]]", "[[US-19]]", "[[EP-14]]"]
sources: []
---

# src/components/KitchenPage.test.tsx

Test suite for KitchenPage wrapper component. Covers rendering and critical regression: verifies KitchenPage sends no Authorization header (no session token) when fetching orders, confirming the intentional no-login design per [[adr-008-server-login-kitchen-pin-attendance]]. Tests confirm that the component is a pure presentational shell with no auth dependencies.

## Exports
(None; test file.)

## Imports
- [[src-components-kitchenpage-tsx|src/components/KitchenPage.tsx]] -- component under test
- `vitest`, `testing-library/react` -- test harness and utilities
