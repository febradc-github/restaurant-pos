---
type: domain
tags: [pos, payment]
aliases: []
created: 2026-07-16
updated: 2026-07-16
related: ["[[adr-005-manual-payment-confirmation]]", "[[frontend-src-utils-currency-ts]]", "[[src-components-salestrendchart-tsx]]", "[[src-components-analyticsdashboard-tsx]]"]
sources: []
---

# Philippines Peso Currency Audit Needed

This is a Philippines-market POS (confirmed via adr-005's QR Ph/GCash payment methods). C-38 implemented the first correct currency formatter (₱ Philippine peso) in `frontend/src/utils/currency.ts`.

**Debt**: SalesTrendChart.tsx and AnalyticsDashboard.tsx still have incorrect `$`-prefixed formatters (pre-C-38 assumption of USD). These should eventually migrate to the shared formatCurrency util.

Deliberately not touched in C-38 (out of scope — ticket boundary respected), but worth flagging for a future audit/migration ticket.
