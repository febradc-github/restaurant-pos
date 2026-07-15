import dayjs from 'dayjs'
import type { Order } from '../types/order'

/**
 * Line items beyond this count are hidden behind a "+N more items"
 * expander instead of letting a card grow unbounded (C-38) -- comfortably
 * below the 12-item worst case observed in practice, so a busy order still
 * gets truncated while a typical short order never shows the expander.
 */
export const LINE_ITEM_PREVIEW_COUNT = 5

/** Sum of quantity x menu item price across an order's line items. */
export function orderTotalAmount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * Number(item.menu_item.price), 0)
}

/**
 * Minutes (and hours, once past 60) elapsed since an order was placed,
 * formatted for a glance on a busy floor ("just now", "12 min", "1 hr 5
 * min"). Recomputed fresh from `created_at` on every render -- no live
 * ticking timer, which is precise enough for this use.
 */
export function formatElapsed(createdAt: string, now: Date = new Date()): string {
  const minutes = Math.max(0, dayjs(now).diff(dayjs(createdAt), 'minute'))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`
}

/** Whether an order's `created_at` falls on the same calendar day as `now`. */
export function isToday(createdAt: string, now: Date = new Date()): boolean {
  return dayjs(createdAt).isSame(dayjs(now), 'day')
}

/**
 * Case-insensitive substring match against an order's table label or any of
 * its line items' menu item names -- backs the Checkout search box. An
 * empty/whitespace query matches everything.
 */
export function orderMatchesSearch(order: Order, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  if (order.table.label.toLowerCase().includes(needle)) return true
  return order.items.some((item) => item.menu_item.name.toLowerCase().includes(needle))
}

export type OrderSortOrder = 'oldest' | 'newest'

/** Sorts orders by `created_at`, oldest- or newest-first. Does not mutate. */
export function sortOrdersByCreatedAt(orders: Order[], sortOrder: OrderSortOrder): Order[] {
  const sorted = [...orders].sort((a, b) => dayjs(a.created_at).diff(dayjs(b.created_at)))
  return sortOrder === 'oldest' ? sorted : sorted.reverse()
}
