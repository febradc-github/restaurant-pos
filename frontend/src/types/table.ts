/** The set of shapes a floor-plan table can be drawn as on the layout canvas. */
export type TableShape = 'round' | 'square' | 'rectangular'

/** A table on the restaurant's floor-plan layout, as returned by the API. */
export interface Table {
  id: number
  label: string
  shape: TableShape
  capacity: number
  /** The floor-plan area this table belongs to (e.g. "Patio"), or null if unassigned. */
  zone: string | null
  /**
   * Whether the table currently has an open order (Pending/Ready) against
   * it, computed server-side (C-37). Never sent on create/update -- it's a
   * read-only derived field, not stored on the table itself.
   */
  is_occupied: boolean
  x: number
  y: number
  width: number
  height: number
}

/** Fields needed to create a new table. `is_occupied` is server-derived, never client-supplied. */
export type NewTable = Omit<Table, 'id' | 'is_occupied'>

/** Partial fields for updating an existing table (label, shape, zone, etc). */
export type TableUpdate = Partial<NewTable>
