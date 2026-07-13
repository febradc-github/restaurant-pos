---
type: domain
tags: [pos, process]
aliases: ["POS project status", "session context"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[US-2]]", "[[US-3]]", "[[US-4]]", "[[US-5]]", "[[US-6]]", "[[US-7]]", "[[US-8]]", "[[US-9]]", "[[AR-POS-core]]", "[[adr-001-postgresql-over-sqlite]]", "[[adr-002-no-message-broker]]", "[[adr-003-local-escpos-print-agent]]", "[[adr-004-onpremise-deployment]]", "[[adr-005-manual-payment-confirmation]]", "[[adr-006-custom-build-vs-odoo]]"]
---

# POS Launch Session Context

Baseline snapshot for resuming work on the Restaurant POS System project.

## Client & Timeline

Real client: independent restaurant in the Philippines, opening soon. Original deadline was very tight (weeks), but client approved extension, so schedule risk is no longer a hard constraint.

## Current Status

- Epic C-1 "Restaurant POS System" is refined, approved, and broken down into 8 user stories (all approved on first proposal)
  - Design doc: [[DS-1]]
  - Item note: [[EP-1]]
  - Backlog entry: cadence/backlog.yml (status: idea)

**Children (dependency-driven order for natural build sequence):**

1. [[US-2]]: Authentication & Role-Based Access (5pts) — foundational; enables RBAC for role-gated stories
2. [[US-3]]: Table Layout Editor (5pts) — prerequisite for Order Taking
3. [[US-4]]: Menu Management (3pts) — prerequisite for Inventory and Order Taking
4. [[US-5]]: Inventory Tracking (3pts) — depends on Menu
5. [[US-6]]: Order Taking & Kitchen Display (6pts) — depends on Tables and Menu
6. [[US-7]]: Checkout, Payment & Cancellation (4pts) — depends on Order Taking; handoff to Print Agent
7. [[US-8]]: Local Print Agent & Hardware Integration (5pts) — buildable in parallel; needed by Checkout
8. [[US-9]]: On-Premise Deployment Setup (3pts) — buildable in parallel; integrates all others

- Next step: `/cadence:spec <id>` on each story before implementation

## Why Key Alternatives Were Rejected

From the brainstorm panel (for context if these resurface):

- **Minimalist scope cut:** Rejected once deadline extended; full scope is now acceptable.
- **Payment gateway risk:** Acknowledged as a real timeline risk (merchant onboarding outside dev control), but mitigated by choosing manual payment confirmation in v1 ([[adr-005-manual-payment-confirmation]]).
- **Reuse Odoo POS:** Rejected because client wants a custom product potentially resellable to other restaurants, and Odoo lacks native support for Philippine payment methods (QR Ph, GCash).

## Open Item: BIR Compliance

**Status:** Not blocking technical work, but must be resolved before launch.

**Issue:** The Philippines Bureau of Internal Revenue (BIR) has accreditation and receipting requirements for cash registers and POS systems used to issue official receipts. It is unclear whether this build must meet those requirements or if the client plans to handle official receipting separately.

**Action:** Raise with client directly before launch. If BIR accreditation is required, it may impose constraints on receipt format, audit trails, or integration with BIR systems (outside the current v1 scope). If the client is issuing receipts outside the system or has a separate process, v1 can proceed as scoped.

## Architecture & Decisions

All technical choices documented:
- [[AR-POS-core]] – system shape, components, roles, network
- [[adr-001-postgresql-over-sqlite]] – database choice
- [[adr-002-no-message-broker]] – no RabbitMQ in v1
- [[adr-003-local-escpos-print-agent]] – local print agent over browser printing
- [[adr-004-onpremise-deployment]] – self-hosted over cloud
- [[adr-005-manual-payment-confirmation]] – manual payment in v1
- [[adr-006-custom-build-vs-odoo]] – custom build rationale
