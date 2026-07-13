---
type: decision
tags: [backend, infrastructure]
aliases: ["Message broker", "RabbitMQ rejection"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-002: No Message Broker (RabbitMQ) in v1

**Decision:** Use WebSockets + PostgreSQL for real-time order communication; do not introduce a message broker (e.g., RabbitMQ) in v1.

## Context

The only real-time requirement in v1 is: when a server places an order, it must appear on the kitchen display with minimal latency. RabbitMQ was considered to decouple components and enable async job processing.

## Rationale

**Problem doesn't exist at this scale:** A single on-premise deployment with one restaurant's staff communicating over a local network does not need a message broker. The architectural benefits (decoupling, resilience to cascading failures, job queue) only apply at larger scale (multi-location, distributed teams, high-volume background jobs).

**WebSocket + PostgreSQL is sufficient:** Laravel Reverb (WebSocket server) can push order updates to the kitchen client instantly. PostgreSQL (with durable writes and transaction guarantees) ensures no orders are lost. If the kitchen client disconnects, it re-fetches on reconnect. This pattern is proven and simple.

**Operational burden:** Running RabbitMQ on a single restaurant's on-premise box adds:
- Another always-on service to monitor, patch, and restart
- Connection/queue management code
- Debugging complexity when messages are lost or redelivered

On a single box, this cost is not paid back.

## Alternatives Rejected

**RabbitMQ or similar broker:** Cleaner separation of concerns, but adds unnecessary complexity and operational burden for a single-restaurant on-premise system. Revisit only if system scales to genuinely distributed architecture (e.g., multi-location order sync, background payment processing with guarantees, live inventory feeds from suppliers).

## Revisit Trigger

If the product scope changes to multi-location deployments, high-volume background jobs, or async payment gateway integrations that require guaranteed delivery and replay.
