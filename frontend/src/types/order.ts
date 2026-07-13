import type { MenuItem } from './menu'
import type { Table } from './table'

/** Where an order stands in the kitchen workflow. Mirrors the backend's OrderStatus enum. */
export type OrderStatus = 'pending' | 'ready'

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
