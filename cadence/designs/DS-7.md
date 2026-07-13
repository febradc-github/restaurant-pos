---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-7]]", "[[DS-1]]", "[[DS-6]]", "[[DS-8]]"]
sources: []
---

# C-7: Checkout, Payment Confirmation & Cancellation -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
The Cashier needs to close out an order: take payment (cash, QR Ph, or GCash, all confirmed manually for v1 per [[adr-005-manual-payment-confirmation]]), generate a receipt, and be able to cancel an order that shouldn't proceed.

## Approach
Cashier (logged in per [[US-2]]) views an open order/table, selects the payment method, and confirms payment received -- marking the order paid. A paid order triggers receipt generation, handed off to the local print agent built in [[US-8]] for physical printing. The Cashier can also cancel an order at any point before or at checkout. The payment-confirmation step is implemented as its own distinct unit so a future live payment gateway integration can replace manual confirmation without reworking checkout.

## Acceptance criteria
- Cashier can view an open order/table and initiate checkout.
- Cashier selects a payment method: cash, QR Ph, or GCash.
- Cashier confirms payment received, which marks the order as paid.
- Cashier can cancel an order, removing it from active orders.
- A paid order triggers receipt generation, handed off to the print agent for physical printing.

## Estimate
4 points

## Assignee
claude
