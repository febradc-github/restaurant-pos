---
type: decision
tags: [infrastructure, deployment]
aliases: ["Self-hosted", "On-premise vs cloud"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[EP-1]]", "[[AR-POS-core]]", "[[AR-print-agent-polyglot]]", "[[US-9]]", "[[pos-launch-session-2026-07-14]]", "[[deploy-ecosystem-config-js]]", "[[reverb-env-config-no-dotenv]]"]
sources: []
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

## Implementation (C-9, US-9)

Deployment strategy finalized: PM2-based process supervision for all three processes (Laravel backend, Laravel Reverb WebSocket, Node.js print-agent, Node.js static frontend server) defined in `ecosystem.config.js` with:
- Environment variable injection at startup (no .env files)
- Restart recovery via pm2 startup (Unix/Linux) and pm2-windows-startup (Windows)
- LAN access confirmed (tested on loopback 127.0.0.1 and machine's actual LAN IP 192.168.31.5)
- Full print-agent pipeline verified end-to-end

See [[deploy-ecosystem-config-js]] for ecosystem config, [[deploy-setup-sh]] for fresh-install script, and [[deploy-readme-md]] for full deployment documentation (including critical troubleshooting notes about PM2's daemon PATH caching and VITE build-time env vars).

Blocker resolved: [[reverb-env-config-no-dotenv]] (how to configure Reverb env vars without .env files) now answered by PM2's native environment mechanism.

## Revisit Trigger

If the product is later offered as a SaaS for multiple restaurants, cloud-hosted variants become necessary. The codebase should be architected (stateless API, no local file storage, environment-based config) to enable a cloud-hosted fork later without rework.
