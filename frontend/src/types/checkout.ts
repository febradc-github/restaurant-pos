import type { Order } from './order'

/**
 * How a Cashier recorded a payment as received during checkout. Mirrors the
 * backend's PaymentMethod enum (cash in person, a customer-scanned QR Ph
 * code, or a GCash e-wallet transfer -- see ADR-005).
 */
export type PaymentMethod = 'cash' | 'qr_ph' | 'gcash'

/**
 * Whether the receipt actually printed after checkout. A failed print never
 * undoes the payment -- the order is still marked paid either way -- but the
 * Cashier-facing UI needs to know so it can prompt a manual reprint.
 */
export type PrintStatus = 'printed' | 'failed'

/** The result of checking an order out: the now-paid order plus its print outcome. */
export interface CheckoutResult {
  order: Order
  print_status: PrintStatus
}
