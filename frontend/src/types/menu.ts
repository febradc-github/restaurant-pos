/** A named group that menu items are organized under (e.g. "Appetizers"). */
export interface Category {
  id: number
  name: string
}

/** Fields needed to create a new category. */
export type NewCategory = Omit<Category, 'id'>

/** Partial fields for renaming an existing category. */
export type CategoryUpdate = Partial<NewCategory>

/**
 * An item the restaurant sells, as returned by the API.
 *
 * `price` is a string, not a number: the backend stores it as a
 * `decimal:2` column and Laravel serializes decimal casts to JSON as a
 * fixed-point string (e.g. "9.99") to avoid floating-point rounding.
 */
export interface MenuItem {
  id: number
  name: string
  price: string
  category_id: number
  available: boolean
}

/** Fields needed to create a new menu item. */
export type NewMenuItem = Omit<MenuItem, 'id'>

/** Partial fields for updating an existing menu item (including availability). */
export type MenuItemUpdate = Partial<NewMenuItem>
