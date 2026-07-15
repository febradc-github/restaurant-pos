import type { MenuItem } from './menu'
import type { Table } from './table'

/**
 * Where an order stands in the kitchen/checkout workflow. Mirrors the
 * backend's OrderStatus enum. Pending/Ready are C-6's kitchen states; Paid/
 * Cancelled are C-7's checkout states.
 */
export type OrderStatus = 'pending' | 'ready' | 'paid' | 'cancelled'

/** A single line item on an order, as returned by the API with its menu item loaded. */
export interface OrderLineItem {
  id: number
  order_id: number
  menu_item_id: number
  quantity: number
  menu_item: MenuItem
}

/**
 * An order a Server placed for a table, as returned by the API with its
 * table and line items loaded.
 */
export interface Order {
  id: number
  table_id: number
  status: OrderStatus
  /**
   * When the order was placed, as an ISO 8601 string (Eloquent's default
   * timestamp serialization -- `OrderController` doesn't hide it, so it's
   * already present on every order response; just wasn't typed here until
   * C-38 needed it for elapsed-time and shift-summary display).
   */
  created_at: string
  table: Table
  items: OrderLineItem[]
}

/** A line item as submitted when placing a new order. */
export interface NewOrderItem {
  menu_item_id: number
  quantity: number
}

/** Fields needed to place a new order. */
export interface NewOrder {
  table_id: number
  items: NewOrderItem[]
}
