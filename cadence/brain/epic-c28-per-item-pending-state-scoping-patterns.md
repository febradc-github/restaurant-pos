---
type: domain
tags: [code/frontend]
aliases: ["C-28 per-item pending scoping", "per-item pending state divergence C-32 vs C-33"]
created: 2026-07-15
updated: 2026-07-15
related: ["[[EP-28]]", "[[US-32]]", "[[US-33]]", "[[src-components-checkout-tsx]]", "[[src-components-kitchendisplay-tsx]]"]
sources: []
---

# Epic C-28: Per-Item Pending State Scoping Patterns & Design Decisions

During the C-28 "Frontend GUI Quality & Consistency Pass" audit, both C-32 (Checkout) and C-33 (KitchenDisplay) independently added per-item async-action pending state tracking, but made deliberate, opposing scoping choices. This note captures the decision framework so future work asks the right questions rather than assuming one pattern fits all.

## Checkout (C-32): Same-Item Mutual Exclusion

When a Confirm payment or Cancel order action is in flight for a specific order, **only that order's controls disable**: the "Confirm payment" Button, "Cancel order" Button, and payment-method Radio.Group all show loading spinners and disable for just that one order.

**Design rationale:** Checkout flow is single-order-per-session by design. The mutual exclusion prevents accidental double-submission within the same order's lifecycle. The workflow is linear: staff picks one order, pays it, moves to the next. Blocking unrelated orders would be moot (there is contextually only one at a time), and the interaction pattern is: "I am acting on this specific order, so that order's controls should show me feedback specific to my action."

**Implemented as:** `pendingOrderId` + `pendingAction` state tracking; only the matched order's buttons disable.

## KitchenDisplay (C-33): Cross-Item Independence

When a mark-ready action is in flight for a specific order, **only that order's "Mark ready" Button shows loading and disables. Other orders' "Mark ready" buttons remain fully enabled and clickable.**

**Design rationale:** Kitchen board is multi-order-per-view by design. Under time pressure during a busy service, staff need throughput: if one order's mark-ready request is slow, staff should never be blocked from advancing other orders. The interaction pattern is: "I am advancing this one order, but the board is still live and I should keep moving." Confirmation-per-tap would actively harm the documented at-speed kitchen design intent, so no Popconfirm is used (unlike Checkout's "Cancel order").

**Implemented as:** `markingReadyId` state tracking; only the matched order's button disables.

## Design Question Framework

When extending the per-item-pending pattern to a new screen, ask:

1. **Is this a single-item or multi-item context?** Single-item flows (Checkout) can afford to block unrelated controls because context is narrow. Multi-item displays (KitchenDisplay) need cross-item independence for throughput.

2. **Is the action destructive or workflow-advancing?** Destructive actions (Cancel order) warrant confirmation dialogs and tighter mutual exclusion. Workflow-advancing actions (Mark ready) that execute under time pressure should optimize for speed, not confirmation friction.

3. **What does the frontline user need to do fast?** High-throughput contexts (kitchen) prioritize avoiding blocks. Back-office or lower-frequency contexts may accept tighter controls for safety.

## Confirmation-Dialog Decision Pattern

This epic also established that confirmation-dialog-before-destructive-action is **judgment-based, not a blanket rule**.

- **Deactivate employee** (EmployeeManager): destructive (user gone from system), hard to reverse → Popconfirm
- **Cancel order** (Checkout, C-32): destructive (removes active order, blocks payment flow), hard to reverse → Popconfirm
- **Mark ready** (KitchenDisplay, C-33): normal workflow advance under time pressure → NO confirmation, because asking "are you sure?" on every tap would actively harm the documented design intent

When auditing future screens for confirmation missing, ask "is this actually destructive, or does it just look similar to a case that was destructive elsewhere?" rather than pattern-matching mechanically.

## Alert Role Override Pattern

KitchenClockPad.tsx (C-12, audited in C-19) established the canonical source of the `role="status"` override pattern for Ant Design `Alert` components:

- Error Alerts keep default `role="alert"` (urgent, needs immediate attention)
- Non-urgent success Alerts get explicit `role="status"` to indicate status change rather than alert condition

This pattern has been consistently applied across Login (C-30), Owner Console (C-31), Checkout (C-32), and KitchenDisplay (C-33) audits and should be used as the reference for any new alerts.

## Epic Completion

C-28 is now complete: all 5 child tickets (C-29 App Shell, C-30 Login, C-31 Owner Console, C-32 Checkout, C-33 Kitchen) are done. The original goal — "fix all GUI problems, use Ant Design, make it beautiful" — is met.
