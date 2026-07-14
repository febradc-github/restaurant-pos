/** A restock candidate as returned by `GET /api/inventory-items/restock` (C-25). */
export interface RestockItem {
  id: number
  name: string
  stock: number
  threshold: number
  suggested_threshold: number
  shortfall: number
}

/**
 * The base inventory item shape returned by
 * `PATCH /api/inventory-items/{id}/threshold` -- notably missing
 * `suggested_threshold`/`shortfall`, which only the restock list endpoint
 * computes. Callers must merge this into the existing RestockItem row
 * rather than replace it wholesale, or those two fields are lost until the
 * next full refetch.
 */
export interface InventoryItem {
  id: number
  name: string
  stock: number
  threshold: number
}
