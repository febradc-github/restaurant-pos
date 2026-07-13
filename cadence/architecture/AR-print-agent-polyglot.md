---
type: architecture
tags: [backend, infrastructure]
aliases: ["Print agent architecture", "Polyglot system", "Three-process deployment"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[AR-POS-core]]", "[[adr-003-local-escpos-print-agent]]", "[[US-8]]", "[[US-7]]", "[[US-9]]"]
sources: []
---

# Print Agent as Polyglot Service

The print-agent (C-8, [[US-8]]) is the first genuinely polyglot component of the POS system—a standalone Node.js/TypeScript service running as a separate local process, with no dependency on Laravel or React.

## Architecture

**Standalone process:** print-agent is a separate Node.js/TypeScript service bundled in print-agent/ at the project root, not inside backend/ or frontend/. It runs as its own HTTP server (default port 4000) on the same local machine as Laravel and Reverb.

**Stateless HTTP API:** Single endpoint `POST /print` accepts a ReceiptRequest JSON body (restaurantName, items, total, openDrawer flag). Returns 200 on success, 400 on invalid body, 502 if the configured printer is unreachable/unreliable, 500 on unexpected error. No persistent state; no database connection.

**Transport abstraction:** Pluggable transport interface allows tests to inject FakePrinterTransport (records writes, simulates failure) and production to use TcpPrinterTransport (connects to printer on configurable host:port, default 127.0.0.1:9100). Opens a fresh TCP socket per print job; no persistent session.

**Configuration via process.env:** No .env file or config framework. Reads PRINT_AGENT_PORT (default 4000), PRINTER_HOST (default 127.0.0.1), PRINTER_PORT (default 9100), PRINTER_CONNECT_TIMEOUT_MS (default 5000) directly from process.env with in-code defaults. Consistent with the rest of the project.

## Integration with C-7 (Checkout)

C-7 (Checkout, [[US-7]]) calls this service's HTTP API when a payment is confirmed: `POST http://127.0.0.1:4000/print` (port configurable via PRINT_AGENT_PORT) with a ReceiptRequest body. Laravel's HTTP client (or similar) makes the call from the checkout flow. Success (200) triggers receipt printing and drawer open; non-2xx should surface an error to the Cashier instead of treating as success (400 = bad request shape, 502 = printer unreachable).

## Deployment Implication for US-9

The system now runs THREE separate processes on the on-premise local machine:
1. Laravel backend (PHP)
2. Laravel Reverb WebSocket server
3. Print-agent (Node.js)

C-9 (On-Premise Deployment Setup, [[US-9]]) must account for all three when packaging the self-hosted deployment, startup order, restart recovery, and process supervision (systemd services, Docker orchestration, or equivalent).

## Technology Choice

Isolated as a separate process (not baked into Laravel) because:
- ESC/POS formatting is orthogonal to order/inventory/auth logic
- TCP socket handling is simpler in Node.js stdlib than in PHP
- Allows independent testing, deployment, and scaling (future: could run on a separate RaspberryPi if needed)
- Zero runtime dependencies; Vitest for tests, tsx for dev, TypeScript for build—minimal build footprint
