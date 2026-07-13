---
type: file
tags: [code/print-agent]
aliases: ["src/types.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-server-ts]]", "[[src-escpos-receiptbuilder-ts]]", "[[US-8]]", "[[US-7]]"]
sources: []
---

# src/types.ts

Defines the POST /print request body shape: ReceiptRequest (restaurantName, timestamp, items, total, openDrawer). ReceiptLineItem is {name, qty, price}. Optional fields: timestamp (defaults to server time), openDrawer (defaults true). This is the contract between Laravel's checkout flow (C-7) and this print service.

## Exports
- `ReceiptLineItem` -- single line item: name, qty, price
- `ReceiptRequest` -- receipt body: restaurant name, items, total, optional timestamp and drawer-open flag

## Imports
- (none)
