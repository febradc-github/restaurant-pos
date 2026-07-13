import {
  ALIGN_CENTER,
  ALIGN_LEFT,
  BOLD_OFF,
  BOLD_ON,
  CUT,
  DRAWER_KICK,
  INIT,
  LF,
} from "./commands.js";
import type { ReceiptRequest } from "../types.js";

const RECEIPT_WIDTH = 32;

function text(value: string): Buffer {
  return Buffer.from(value, "latin1");
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

function formatLineItem(name: string, qty: number, price: number): string {
  const left = `${name} x${qty}`;
  const right = formatCurrency(price);
  const padding = Math.max(1, RECEIPT_WIDTH - left.length - right.length);
  return `${left}${" ".repeat(padding)}${right}`;
}

/**
 * Builds the exact ESC/POS byte sequence to send to the printer for a
 * given receipt: initialize, header, line items, total, feed, cut, and
 * (unless `openDrawer` is explicitly `false`) the cash-drawer-kick pulse.
 *
 * Pure and deterministic: the same `ReceiptRequest` always produces the
 * same bytes, which is what makes this unit-testable without any real
 * printer hardware.
 */
export function buildReceiptBytes(receipt: ReceiptRequest): Buffer {
  const timestamp = receipt.timestamp ?? new Date().toISOString();
  const divider = "-".repeat(RECEIPT_WIDTH);

  const chunks: Buffer[] = [
    INIT,
    ALIGN_CENTER,
    BOLD_ON,
    text(receipt.restaurantName),
    LF,
    BOLD_OFF,
    ALIGN_LEFT,
    text(timestamp),
    LF,
    text(divider),
    LF,
  ];

  for (const item of receipt.items) {
    chunks.push(text(formatLineItem(item.name, item.qty, item.price)), LF);
  }

  chunks.push(
    text(divider),
    LF,
    BOLD_ON,
    text(`TOTAL: ${formatCurrency(receipt.total)}`),
    LF,
    BOLD_OFF,
    LF,
    LF,
    LF,
    CUT,
  );

  if (receipt.openDrawer !== false) {
    chunks.push(DRAWER_KICK);
  }

  return Buffer.concat(chunks);
}
