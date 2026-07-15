---
type: file
tags: [code/frontend]
aliases: ["src/components/Checkout.test.tsx"]
created: 2026-07-14
updated: 2026-07-15
related: ["[[src-components-checkout-tsx]]", "[[antd-radio-button-pointer-events-gotcha]]", "[[US-32]]"]
sources: []
---

# src/components/Checkout.test.tsx

Tests for rebuilt Checkout component: renders Cards for each open order, payment method Radio.Group with button-style options, Confirm Payment and Cancel Order buttons per order. Tests state transitions (selecting payment method, confirming/cancelling order), API calls (api.checkout, api.cancel), and status displays (Paid tag, print-failure Alert warning). When Radio.Button is clicked in tests, target the visible label text/span (not the radio role element itself)—see [[antd-radio-button-pointer-events-gotcha]] for the antd pointer-events:none caveat.

## C-32 Updates

Tests updated and added during C-32 audit:

1. **Popconfirm confirmation flow**: Updated existing cancel test to go through the new `Popconfirm` modal step—Cancel button now requires user confirmation before the API call fires. Tests verify the confirmation dialog appears and both "Yes, cancel" and "No" paths work correctly.

2. **Large touch-target verification**: Added assertions checking for `ant-btn-lg` class on Confirm button and `ant-radio-group-large` class on payment-method Radio.Group, verifying compliance with the `size="large"` touch-target convention.

3. **Per-order async loading/disabled state**: Added tests verifying that when a Confirm or Cancel request is in flight for a specific order, only that order's Confirm and Cancel buttons show loading spinner and disable, while unaffected orders remain interactive. Tests both simultaneous requests on different orders and state clearing after success/failure.

## Used by
- [[src-components-checkout-tsx|src/components/Checkout.tsx]] -- test suite
