---
type: file
tags: [code/print-agent]
aliases: ["src/index.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-server-ts]]", "[[US-8]]"]
sources: []
---

# src/index.ts

Entry point: reads four environment variables (PRINT_AGENT_PORT, PRINTER_HOST, PRINTER_PORT, PRINTER_CONNECT_TIMEOUT_MS) with in-code defaults, wires TcpPrinterTransport to the HTTP server, and starts listening. No config files or .env parsing—consistent with the project's hard no-.env rule.

## Exports
- Server listener starts automatically; exports only via side effects (server.listen)

## Imports
- [[src-server-ts|src/server.ts]] -- createServer factory
- `src/transport/TcpPrinterTransport.ts` -- real printer connection (TCP socket to ESC/POS printer)
- `node:net` -- stdlib
