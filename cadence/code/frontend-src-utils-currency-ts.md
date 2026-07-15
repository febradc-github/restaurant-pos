---
type: file
tags: [code/frontend]
aliases: ["frontend/src/utils/currency.ts"]
created: 2026-07-16
updated: 2026-07-16
related: ["[[frontend-src-components-checkout-tsx]]", "[[src-components-salestrendchart-tsx]]", "[[src-components-analyticsdashboard-tsx]]", "[[adr-005-manual-payment-confirmation]]"]
sources: []
---

# frontend/src/utils/currency.ts

First cross-component shared currency formatter for Philippine peso (₱). Hand-rolled formatting with comma thousands and 2 decimals: `₱27.00`, `₱1,234.50`. Not using Intl.NumberFormat('en-PH', ...) to avoid runtime ICU currency-data dependency in every runtime (embedded/kiosk deployment concern).

## Exports
- `formatCurrency(amount: number): string` -- formats amount as ₱-prefixed string with comma thousands, 2 decimals

## Pattern

**New directory**: This is the first truly cross-cutting helper (used by Checkout now, should eventually be adopted by Analytics), breaking the existing colocation pattern where helpers lived next to their single component (e.g., tableZoneGrouping.ts next to TableLayoutEditor.tsx). Future genuinely-shared logic should also live in utils/ rather than starting a third convention.

## Debt/Migration

This is a Philippines-market POS per adr-005. SalesTrendChart.tsx and AnalyticsDashboard.tsx still have incorrect `$`-prefixed formatters (pre-C-38 assumption of USD). They should eventually migrate to this formatCurrency. Out of scope for C-38 (deliberately not touched, per ticket boundary) but worth flagging for a future audit ticket.

## Testing

- frontend/src/utils/currency.test.ts -- verified formatter output for edge cases: 0, 1.5, 1000, 1234567.89
