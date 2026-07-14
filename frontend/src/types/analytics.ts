/**
 * Daily revenue as returned by `GET /api/analytics/sales` (C-24), sorted
 * ascending by date. `revenue` is a fixed-2-decimal string -- same
 * decimal-as-string convention as `MenuItem.price` -- parse with `Number()`
 * only where arithmetic/plotting actually needs it.
 */
export interface SalesMetric {
  date: string
  revenue: string
}

/**
 * Per-menu-item sales totals as returned by `GET /api/analytics/menu-items`
 * (C-24), sorted descending by revenue by default. Both `quantity_sold` and
 * `revenue` are present so the UI can re-sort by either.
 */
export interface MenuItemMetric {
  menu_item_id: number
  name: string
  quantity_sold: number
  revenue: string
}
