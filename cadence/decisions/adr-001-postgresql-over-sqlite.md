---
type: decision
tags: [database]
aliases: ["PostgreSQL vs SQLite"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-001: PostgreSQL Chosen Over SQLite

**Decision:** Use PostgreSQL as the primary datastore; reject SQLite.

## Context

Restaurant POS system requires a database for order, menu, inventory, table layout, and staff data. The system will start as single on-premise deployment but is being architected as a reusable product that may later be offered to multiple restaurants.

## Rationale

**Concurrent write handling:** Live restaurant floor has multiple simultaneous users (cashier, servers on tablets, kitchen staff). PostgreSQL is built for concurrent write workloads with proper locking, ACID guarantees, and transaction isolation. SQLite serializes writes at the file level, creating contention under live floor traffic.

**Multi-tenant future:** If the product is later offered to multiple restaurants (different self-hosted instances, or a hosted SaaS), multi-tenancy patterns (row-level security, schema isolation) are mature in PostgreSQL but require significant rework from SQLite. Choosing PostgreSQL now avoids an expensive database migration later.

**Operational simplicity:** PostgreSQL is industry-standard, well-documented, and familiar to any future ops/DevOps team. SQLite ties you to file-based backups and replication workarounds.

## Alternatives Rejected

**SQLite:** Simpler setup and zero external service on the on-premise box, but poor concurrent-write handling and poor upgrade path to multi-tenant.

## Revisit Trigger

Never, unless the product is permanently scoped to single-restaurant, single-user deployments (unlikely given initial product strategy).
