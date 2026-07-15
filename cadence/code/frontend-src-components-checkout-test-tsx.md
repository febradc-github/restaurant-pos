---
type: file
tags: [code/frontend, code/testing]
aliases: ["frontend/src/components/Checkout.test.tsx"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-checkout-tsx]]", "[[frontend-src-components-checkouthelpers-ts]]"]
sources: []
---

# frontend/src/components/Checkout.test.tsx

Test suite for Checkout component. 10 original test cases + 10 new C-38 cases (20 total).

## New C-38 Test Cases
- Order identity: renders order number (#id)
- Elapsed time: displays time-since-created_at via helper
- Duplicate-table disambiguation: order number distinguishes multiple orders at same table
- Prices/total/confirm-label: per-line prices formatted via currency formatter, total correct, button shows "Confirm payment ₱X.XX"
- Truncation+expand: shows "+N more" at threshold (5), "Show less" when expanded
- No-truncation-under-threshold: <5 items don't show expand toggle
- Shift-summary stats: open-order count, pending-total, paid-today rendering
- Search: filters by table label
- Search: filters by line-item menu-item name (case-insensitive)
- Sort toggle: oldest/newest ordering
- Cancel: quiet-style (type="text" danger) with Popconfirm still functional

All original 10 test cases remain passing. Test queries using `/confirm payment/i` regex continue to match the new button label format.

## Pattern

All helpers imported from checkoutHelpers.ts are tested in their own .test.ts file (separation of concerns: component tests focus on rendering/integration, helper tests cover logic edge cases).
