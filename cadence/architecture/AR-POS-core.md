---
type: architecture
tags: [pos, backend, infrastructure]
aliases: ["POS core system", "system shape"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[pos-launch-session-2026-07-14]]", "[[AR-print-agent-polyglot]]"]
---

# POS Core Architecture

Single self-hosted on-premise deployment (one local machine at the restaurant, e.g. mini PC/NUC) with all restaurant devices connecting over local network. No cloud dependency for core operation.

## Components

**Laravel API backend (PHP):**
- Authentication (Owner/Cashier only; Server/Kitchen are device-level, no login)
- Orders CRUD with real-time push via WebSocket
- Menu and inventory management
- Table layout configuration
- Role-based access control

**PostgreSQL datastore:**
- Primary database for all persistent state
- Handles concurrent writes from multiple terminals on the live floor
- Enables future multi-tenant hosting if product is later offered to other restaurants

**React SPA frontend:**
- Decoupled from backend, communicates over REST/JSON API
- Owned terminal (Owner/Cashier login) and device-level instances (Server/Kitchen, no auth)
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
| Owner | Yes (username/PIN) | Full access: config, staff, menu, inventory, reports, payments |
| Cashier | Yes (username/PIN) | Checkout, confirm/void payments, view orders |
| Server | No (device-level) | Take orders, select tables/items, send to kitchen |
| Kitchen | No (device-level) | View live order display, mark items ready |

## Network & Durability

- All devices talk to backend over HTTP/WebSocket on local network
- Core operations (order-taking, checkout, kitchen display) work even if internet is down
- Live payment gateway (future feature, not v1) would require internet
- No external service dependencies in v1 (no cloud storage, no SMS gateway, no third-party auth)
