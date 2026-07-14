---
type: architecture
tags: [frontend, pos]
aliases: ["Frontend routing", "Ant Design integration"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-14]]", "[[AR-POS-core]]", "[[adr-008-server-login-kitchen-pin-attendance]]", "[[adr-009-frontend-redesign-before-digital-transformation]]", "[[deploy-static-server-js]]"]
sources: []
---

# Frontend Design System & Routing Architecture

Introduced in C-14 as the project's first unified design system and page routing framework. Replaces `frontend/src/App.tsx`'s inline role-based conditional rendering with real page routes and Ant Design component library.

## Routing

**Framework:** `react-router-dom`

**Routes and role-based auth gates:**

| Route | Auth Gate | Role | Purpose |
|-------|-----------|------|---------|
| `/login` | None | Any | Session entry point (Sanctum bearer token exchange) |
| `/owner` | Sanctum token (Owner role) | Owner | Configuration, staff management, menu/inventory, reports, payments |
| `/cashier` | Sanctum token (Cashier role) | Cashier | Checkout, payment confirmation/void, order review |
| `/take-orders` | Sanctum token (Server role) | Server | Order taking, table selection, item selection, send to kitchen |
| `/kitchen` | None (PIN-only attendance) | Kitchen staff | Live order display (no auth required); clock in/out via 6-digit PIN overlay |

Auth gates follow the session model established in [[adr-008-server-login-kitchen-pin-attendance]]: Owner/Cashier/Server receive Sanctum bearer tokens on login; Kitchen display remains gate-free to enable instant availability on restart. Kitchen staff authenticate separately via PIN for time-entry tracking only.

## Design System

**Library:** Ant Design (antd)

**Implementation pattern:** Shared `ConfigProvider` wrapper at app root with:
- Custom brand color palette (chosen per-page/story via the ui-ux-pro-max design skill during implementation, not unified up front)
- Typography configuration aligned to brand
- Theme applied globally to all page components

**Coverage:** Every existing screen (Login, TableLayoutEditor, MenuManager, Checkout, OrderTaking, KitchenDisplay, KitchenClockPad) rebuilt with Ant Design components. Exception: TableLayoutEditor's drag/resize canvas interaction logic retained as-is (domain-specific logic, not a typical form/table UI); only surrounding chrome (headers, controls, panels) restyled.

## SPA Fallback Compatibility

**Static server:** `[[deploy-static-server-js|deploy/static-server.js]]` already implements SPA fallback (404 → index.html), confirmed safe for routing. No server-side route handling required; all routing resolved client-side.

## Key Architectural Decisions

- **Routing replaces presentation mechanism, not auth logic:** The gating model from [[AR-POS-core]] and [[adr-008-server-login-kitchen-pin-attendance]] is explicitly preserved. Routes are a presentation layer reorganization; auth enforcement remains at the API level (Sanctum middleware on backend, token validation on frontend).
- **Design system per-page:** Ant Design theme and palette choices are made during each page's implementation story (e.g., US-N for the Owner page design). This defers unanimous brand alignment to stories that have design input, rather than pre-committing to a palette that may need revision as pages land. The ConfigProvider umbrella ensures consistency despite per-story choices.
- **Sequencing:** C-14 is intentionally sequenced ahead of future digital transformation epics (Owner Employee Management, Analytics Dashboard) to establish the design system foundation first. See [[adr-009-frontend-redesign-before-digital-transformation]] for the reasoning.
