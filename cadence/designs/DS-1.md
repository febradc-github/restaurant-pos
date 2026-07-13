---
type: design
tags: []
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]"]
sources: []
---

# C-1: Restaurant POS System -- Design

## Problem
A restaurant client in the Philippines, opening soon, needs a point-of-sale system to run daily operations: taking orders against tables, managing a customizable table layout, tracking menu and inventory, and processing payments at checkout with physical receipt/cash-drawer hardware. This is a from-scratch build for a single restaurant location, deployed on-premise (not cloud-hosted) to avoid recurring cloud costs and internet dependency for core operations. The system is being built as a custom product -- partly because it may become a reusable product for other restaurant clients later -- so the architecture should stay reasonably general even though this build is scoped to one restaurant.

## Architecture
Greenfield project -- no existing `cadence/architecture/` or `cadence/decisions/` notes to reconcile with (first ticket in a new vault). The system is a single self-hosted deployment on one on-premise machine at the restaurant (e.g. a mini PC/NUC), with all devices (owner's/cashier's terminal, server tablets, kitchen display) connecting to it over the restaurant's local network via browser. No cloud dependency for core operation.

Components:
- **Laravel API backend (PHP)** -- handles auth, orders, menu, inventory, table layout, and role-based access.
- **PostgreSQL** -- primary datastore.
- **React SPA frontend** -- decoupled from the backend, communicates over a REST/JSON API (chosen over Inertia+React or Blade+Livewire so a future mobile app could reuse the same API).
- **Laravel Reverb** -- first-party, self-hosted WebSocket server (bundled with Laravel 11+), pushes real-time order updates from server devices to the kitchen display without polling and without an external service like Pusher.
- **Local print agent** -- a small separate service that receives print requests from the web app and sends raw ESC/POS commands to the restaurant's thermal receipt printer, which also issues the cash-drawer kick command. Chosen over browser-native printing (`window.print()`) to avoid per-transaction dialog friction, keep full control over receipt formatting, and reliably drive the cash drawer -- the standard approach in production POS systems.

## Approach
A single Laravel + PostgreSQL backend exposes a REST API and a Reverb WebSocket channel, consumed by a React SPA that adapts its view per role. Four roles: **Owner** (full access -- table layout editor, menu, inventory, reports), **Cashier** (checkout, payment confirmation, order cancellation, receipts), **Server** (take orders, view table status), and **Kitchen** (view incoming orders on a live display, mark items ready). Only Owner and Cashier authenticate with individual login; Server and Kitchen are device-level views with no per-user login.

Orders placed by a server are written to PostgreSQL and pushed over a Reverb WebSocket channel to the kitchen display in real time; the kitchen client also fetches any unacknowledged orders on reconnect, so a brief network drop doesn't lose an order (durability comes from the DB write, not the WebSocket).

Payment is manual for v1: the cashier selects cash, QR Ph, or GCash, the customer pays outside the system, and the cashier confirms receipt of payment in the app, which triggers receipt generation through the local print agent (also opening the cash drawer). The payment-confirmation step is built as its own distinct unit so a future live payment gateway integration (e.g. a QR Ph API via an aggregator like PayMongo) can replace the manual-confirmation step without reworking the rest of the order/checkout flow.

## Trade-offs considered
- **Reuse an existing open-source POS platform (Odoo POS Community)** instead of building custom -- considered during brainstorm (scout pitch). Rejected: the client wants a custom-built product that could potentially be resold to other restaurants, and Odoo's restaurant module isn't natively wired to PH payment methods, so "just configure it" risked unraveling into custom module development anyway.
- **SQLite instead of PostgreSQL** -- proposed initially for zero-config, single-file simplicity on a single on-premise install. PostgreSQL was chosen instead, mainly for better concurrent-write handling and to avoid a future migration if this becomes a multi-restaurant hosted product.
- **RabbitMQ for order delivery** -- considered and rejected. The real-time need (order placed -> appears on kitchen screen) is fully served by WebSockets (Reverb) plus DB-backed durability and reconnect-triggered re-fetch; a message broker would add operational complexity (another service to run/monitor on the on-premise box) without solving a problem unique to this scale. Revisit if the system becomes genuinely distributed (multi-location sync, background jobs, async payment gateway integration).
- **Browser-native printing (`window.print()`)** instead of a local ESC/POS print agent -- rejected due to per-transaction dialog friction, unreliable browser-side control over receipt formatting/margins, and unreliable cash-drawer triggering via the print-job trick.
- **Cloud hosting instead of on-premise** -- not chosen; the client wants this to run entirely on a local machine at the restaurant with no cloud dependency for core operation, avoiding recurring hosting costs and internet-outage risk during service.

**Not yet resolved, flagged for the client rather than decided here:** the Philippines requires businesses to issue official receipts from a BIR-accredited cash register/POS system. Whether this build needs BIR accreditation is unclear and outside the scope of this design -- the client should confirm directly before launch.

## Acceptance criteria
- Owner can create and edit a table layout via a drag-and-drop editor, with custom table shapes, sizes, and capacities.
- Servers can take orders against tables via the web app (no login required); orders appear in real time on a kitchen display screen (no login required).
- Owner can manage menu items, categories, pricing, and availability.
- Inventory levels are tracked and tied to menu items.
- Owner and Cashier authenticate via login; Server and Kitchen interfaces do not require individual login.
- Cashier can check out an order, select a payment method (cash, QR Ph, or GCash), confirm payment received, and the system generates a receipt, printed via a local ESC/POS print agent that also opens the cash drawer.
- Cashier can cancel an order.
- Role-based access is enforced across Owner, Cashier, Server, and Kitchen.
- The entire system runs self-hosted on a local on-premise machine, with no cloud dependency for core operation.

## Estimate
30 points

## Assignee
claude
