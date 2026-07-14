---
type: architecture
tags: [pos, backend, infrastructure]
aliases: ["POS core system", "system shape"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[pos-launch-session-2026-07-14]]", "[[AR-print-agent-polyglot]]", "[[EP-10]]", "[[adr-008-server-login-kitchen-pin-attendance]]"]
sources: []
---

# POS Core Architecture

Single self-hosted on-premise deployment (one local machine at the restaurant, e.g. mini PC/NUC) with all restaurant devices connecting over local network. No cloud dependency for core operation.

## Components

**Laravel API backend (PHP):**
- Authentication: Owner/Cashier via Sanctum bearer tokens ([[adr-007-sanctum-bearer-tokens]]); Server via Sanctum (added in C-10, [[adr-008-server-login-kitchen-pin-attendance]]); Kitchen staff via lightweight 6-digit PIN endpoint for attendance only
- Orders CRUD with real-time push via WebSocket
- Menu and inventory management
- Table layout configuration
- Role-based access control
- Time entries tracking for attendance/payroll (new in C-10)

**PostgreSQL datastore:**
- Primary database for all persistent state
- Handles concurrent writes from multiple terminals on the live floor
- Enables future multi-tenant hosting if product is later offered to other restaurants

**React SPA frontend:**
- Decoupled from backend, communicates over REST/JSON API
- Authenticated terminals: Owner/Cashier login, Server login (added in C-10)
- Device-level instances: Kitchen order display (no auth, gate-free per [[adr-008-server-login-kitchen-pin-attendance]])
- Kitchen staff clock in/out via lightweight PIN-pad overlay (no session token)
- Responsive web app, runs in browser on any device (desktop terminal, tablet, kitchen display)

**Laravel Reverb (WebSocket server):**
- First-party, self-hosted, bundled with Laravel 11+
- Sole real-time channel: order placed by server appears on kitchen display with minimal latency
- Backed by PostgreSQL durability + reconnect-triggered re-fetch for fault tolerance

**Local ESC/POS print agent (separate service):**
- Receives print requests (receipts) and cash-drawer commands from web app
- Sends raw ESC/POS commands directly to thermal receipt printer
- Avoids per-transaction print dialogs, controls formatting, reliably triggers drawer
- See [[AR-print-agent-polyglot]] for implementation details and deployment implications

## Roles

| Role | Auth | Capabilities |
|------|------|--------------| 
| Owner | Yes (Sanctum) | Full access: config, staff, menu, inventory, reports, payments |
| Cashier | Yes (Sanctum) | Checkout, confirm/void payments, view orders; login/logout records attendance |
| Server | Yes (Sanctum) | Take orders, select tables/items, send to kitchen; login/logout records attendance |
| Kitchen | PIN only (no session) | View live order display (no auth required); clock in/out via 6-digit PIN for attendance tracking |

## Key Architectural Decisions

- **Attendance tracking (C-10):** Time-in/time-out is now tracked across all authenticated staff via a `time_entries` table. Server added real Sanctum login to support this. Kitchen order display remains gate-free, but Kitchen staff authenticate separately via PIN for clock-in/out only (no session issued). See [[adr-008-server-login-kitchen-pin-attendance]] for the reasoning on this partial reversal of the original "no login" design.

## Network & Durability

- All devices talk to backend over HTTP/WebSocket on local network
- Core operations (order-taking, checkout, kitchen display) work even if internet is down
- Live payment gateway (future feature, not v1) would require internet
- No external service dependencies in v1 (no cloud storage, no SMS gateway, no third-party auth)
