---
type: decision
tags: [backend]
aliases: ["Custom build", "Odoo POS", "Build vs adapt"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-006: Custom Build Over Adapting Existing POS Platform

**Decision:** Build a custom POS system from scratch (Laravel + React + PostgreSQL); reject adapting Odoo POS Community.

## Context

The team considered using Odoo POS (open-source Community Edition) and customizing it for the restaurant's needs, rather than building from scratch.

## Rationale

**Product strategy:** The client wants a product they could later license to other independent restaurants. Starting with an Odoo fork creates ongoing maintenance burden (tracking Odoo's releases, managing local forks, licensing complexity). A clean, standalone codebase is a saleable product; Odoo customizations are not.

**Philippines payment methods:** Odoo POS is globally generic and assumes Western payment flows (Stripe, PayPal). It has no native support for QR Ph (Philippine QR standard) or GCash (Philippine e-wallet). Integrating these into Odoo would require deep module customization, and the changes would be at odds with Odoo's design (designed for add-on modules, not core payment path rewrites).

**Scope parity:** Adapting Odoo for a single restaurant's specific needs (table management, kitchen display real-time updates, role-based UX for Philippine POS context) would require as much custom code as building fresh. The benefit of starting with an existing platform is voided.

**Technical fit:** Odoo is monolithic and opinionated (server-rendered, XML-driven templates, heavy data model). The POS system is best served by a decoupled API + SPA (allows rich client-side UX, scales to future mobile apps). Building fresh with Laravel + React aligns with this architecture from day one.

## Alternatives Rejected

**Adapt Odoo POS Community:** Existing codebase, active community, but poor fit for Philippine payments, opinionated architecture, and unclear product ownership/licensing downstream.

**Other open-source POS (Square Register, Toast, Lightspeed clones):** Most are either cloud-only, unmaintained, or tightly coupled to a specific payment processor.

## Revisit Trigger

Never for this product line. If the customer base grows to 10+ restaurants, evaluate building a managed hosting layer around the custom codebase, but don't switch to Odoo.
