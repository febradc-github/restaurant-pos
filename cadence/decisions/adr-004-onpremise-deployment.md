---
type: decision
tags: [infrastructure, deployment]
aliases: ["Self-hosted", "On-premise vs cloud"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[AR-print-agent-polyglot]]", "[[US-9]]", "[[pos-launch-session-2026-07-14]]"]
---

# ADR-004: On-Premise Self-Hosted Deployment Over Cloud

**Decision:** Deploy the system on-premise on a single local machine at the restaurant (e.g., mini PC/NUC); reject cloud-hosted deployment.

## Context

The client is a single restaurant in the Philippines, opening soon. They need the system to run with zero recurring cloud hosting costs and with core operations (order-taking, checkout, kitchen display) continuing to work even if internet is down.

## Rationale

**Cost:** No recurring cloud hosting fees (EC2, RDS, managed databases). Client buys one mini PC/NUC once, deploys PostgreSQL + Laravel + React locally, and that's the capex. This appeals to the target market (independent restaurants, cost-sensitive operations).

**Internet independence:** Live payment gateway integration (future, not v1) can be optional. Core operations -- taking orders, checking out, printing receipts, syncing kitchen display -- work entirely over the restaurant's local network. If the internet connection drops at 8 PM, the restaurant can still run dinner service.

**Data sovereignty:** Customer data (orders, staff, menu, inventory) lives on equipment they own and control. No data leaves the restaurant network. Valuable for client trust and simplifies compliance.

**Network simplicity:** No VPN, no IP whitelisting, no egress firewall rules. Devices on the local network talk directly to the backend over HTTP/WebSocket.

## Alternatives Rejected

**Cloud hosting (AWS, GCP, Azure):** Recurring costs, internet dependency for core operations, data leaves the restaurant, simpler scaling if product grows to multi-restaurant chains (future consideration, not v1). Rejected because client's stated priority is cost + independence.

## Deployment Note

As of C-8 ([[US-8]]), the on-premise deployment now runs THREE separate processes: Laravel backend, Laravel Reverb WebSocket server, and print-agent (Node.js). See [[AR-print-agent-polyglot]] for the polyglot implications and [[US-9]] for the integration work needed.

## Revisit Trigger

If the product is later offered as a SaaS for multiple restaurants, cloud-hosted variants become necessary. The codebase should be architected (stateless API, no local file storage, environment-based config) to enable a cloud-hosted fork later without rework.
