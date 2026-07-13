import type { ReceiptLineItem, ReceiptRequest } from "./types.js";

/** Thrown when a `POST /print` body fails validation. `message` is safe to return to the caller. */
export class InvalidReceiptRequestError extends Error {}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateLineItem(value: unknown, index: number): ReceiptLineItem {
  if (typeof value !== "object" || value === null) {
    throw new InvalidReceiptRequestError(`items[${index}] must be an object`);
  }
  const item = value as Record<string, unknown>;

  if (!isNonEmptyString(item.name)) {
    throw new InvalidReceiptRequestError(`items[${index}].name is required and must be a non-empty string`);
  }
  if (!isFiniteNumber(item.qty) || item.qty <= 0) {
    throw new InvalidReceiptRequestError(`items[${index}].qty is required and must be a positive number`);
  }
  if (!isFiniteNumber(item.price) || item.price < 0) {
    throw new InvalidReceiptRequestError(`items[${index}].price is required and must be a non-negative number`);
  }

  return { name: item.name, qty: item.qty, price: item.price };
}

/**
 * Validates and normalizes an arbitrary parsed-JSON value into a
 * `ReceiptRequest`, throwing `InvalidReceiptRequestError` (with a message
 * describing exactly what's wrong) if it doesn't meet the required shape.
 */
export function validateReceiptRequest(value: unknown): ReceiptRequest {
  if (typeof value !== "object" || value === null) {
    throw new InvalidReceiptRequestError("Request body must be a JSON object");
  }
  const body = value as Record<string, unknown>;

  if (!isNonEmptyString(body.restaurantName)) {
    throw new InvalidReceiptRequestError("restaurantName is required and must be a non-empty string");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new InvalidReceiptRequestError("items is required and must be a non-empty array");
  }
  if (!isFiniteNumber(body.total) || body.total < 0) {
    throw new InvalidReceiptRequestError("total is required and must be a non-negative number");
  }
  if (body.timestamp !== undefined && !isNonEmptyString(body.timestamp)) {
    throw new InvalidReceiptRequestError("timestamp, if provided, must be a non-empty string");
  }
  if (body.openDrawer !== undefined && typeof body.openDrawer !== "boolean") {
    throw new InvalidReceiptRequestError("openDrawer, if provided, must be a boolean");
  }

  const items = body.items.map((item, index) => validateLineItem(item, index));

  return {
    restaurantName: body.restaurantName,
    items,
    total: body.total,
    timestamp: body.timestamp as string | undefined,
    openDrawer: body.openDrawer as boolean | undefined,
  };
}
