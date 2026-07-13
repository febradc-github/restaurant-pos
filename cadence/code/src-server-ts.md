---
type: file
tags: [code/print-agent]
aliases: ["src/server.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-index-ts]]", "[[src-types-ts]]", "[[src-escpos-receiptbuilder-ts]]", "[[US-8]]", "[[US-7]]"]
sources: []
---

# src/server.ts

HTTP server factory (createServer): POST /print handler parses JSON body, validates shape, builds ESC/POS bytes, sends to printer transport. Returns 400 on invalid shape, 502 if printer unreachable/write fails, 200 on success. All other routes return 404. Unhandled errors return 500. Transport is injected for testability (tests use FakePrinterTransport, production uses TcpPrinterTransport).

## Exports
- `createServer(transport): http.Server` -- builds the HTTP server

## Imports
- [[src-types-ts|src/types.ts]] -- ReceiptRequest shape
- [[src-escpos-receiptbuilder-ts|src/escpos/receiptBuilder.ts]] -- buildReceiptBytes
- `src/transport/PrinterTransport.ts` -- PrinterTransport interface
- `src/validateReceiptRequest.ts` -- validateReceiptRequest + InvalidReceiptRequestError
- `node:http` -- stdlib
