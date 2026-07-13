---
type: file
tags: [code/print-agent]
aliases: ["src/escpos/receiptBuilder.ts"]
created: 2026-07-14
updated: 2026-07-14
related: ["[[src-types-ts]]", "[[US-8]]"]
sources: []
---

# src/escpos/receiptBuilder.ts

Pure function: buildReceiptBytes(receipt: ReceiptRequest) → Buffer. Transforms a receipt request into the exact deterministic ESC/POS byte sequence: INIT, header (restaurant name), line items (name x qty, right-aligned price), divider, total, footer, paper feed, cut. Appends cash-drawer-kick pulse (DRAWER_KICK) unless openDrawer is explicitly false. Determinism is load-bearing: same input always produces same bytes, enabling unit testing without hardware.

## Exports
- `buildReceiptBytes(receipt): Buffer` -- builds ESC/POS byte sequence

## Imports
- [[src-types-ts|src/types.ts]] -- ReceiptRequest
- `src/escpos/commands.ts` -- ESC/POS byte constants (INIT, LF, BOLD_ON/OFF, ALIGN_LEFT/CENTER, CUT, DRAWER_KICK)
