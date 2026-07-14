---
type: file
tags: [code/frontend]
aliases: ["src/components/Checkout.test.tsx"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-components-checkout-tsx]]", "[[antd-radio-button-pointer-events-gotcha]]"]
sources: []
---

# src/components/Checkout.test.tsx

Tests for rebuilt Checkout component: renders Cards for each open order, payment method Radio.Group with button-style options, Confirm Payment and Cancel Order buttons per order. Tests state transitions (selecting payment method, confirming/cancelling order), API calls (api.checkout, api.cancel), and status displays (Paid tag, print-failure Alert warning). When Radio.Button is clicked in tests, target the visible label text/span (not the radio role element itself)—see [[antd-radio-button-pointer-events-gotcha]] for the antd pointer-events:none caveat.

## Used by
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- test suite
