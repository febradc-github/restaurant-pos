---
type: file
tags: [code/frontend]
aliases: ["src/components/CashierPage.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-cashierpage-tsx]]", "[[src-components-checkout-tsx]]"]
sources: []
---

# src/components/CashierPage.test.tsx

Tests for CashierPage wrapper: renders Checkout's heading under the page chrome, forwards authToken and apiBaseUrl props through to Checkout, shows Checkout's own logged-out fallback when no token passed. Verifies page-level shell integration only; Checkout's own behavior tested separately.

## Used by
- [[src-components-cashierpage-tsx|src/components/CashierPage.tsx]] -- test suite
