---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[US-8]]", "[[DS-1]]"]
sources: []
---

# C-8: Local Print Agent & Hardware Integration -- Design

## Parent
Part of [[EP-1]] -- see [[DS-1]] for the umbrella rationale.

## Problem
Receipts need to print on the restaurant's thermal printer and the cash drawer needs to open at checkout, per [[adr-003-local-escpos-print-agent]] -- browsers can't talk to this hardware directly, so a local service is needed to bridge the web app and the physical hardware.

## Approach
Build a small local service that listens for print requests (from the Checkout flow in [[US-7]]) and sends raw ESC/POS commands to the connected thermal receipt printer, formatting a proper receipt. The same command sequence (or a dedicated one) triggers the printer's cash-drawer kick to open the drawer. The service surfaces an error back to the Cashier if the printer is unreachable, rather than silently failing.

## Acceptance criteria
- A local service runs and listens for print requests.
- On a print request, the service sends raw ESC/POS commands to print a formatted receipt.
- The same print job (or a dedicated command) triggers the cash drawer to open.
- The print agent surfaces an error to the Cashier if the printer is disconnected or unavailable, rather than failing silently.

## Estimate
5 points

## Assignee
claude
