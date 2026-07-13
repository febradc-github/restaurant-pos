/** The set of shapes a floor-plan table can be drawn as on the layout canvas. */
export type TableShape = 'round' | 'square' | 'rectangular'

/** A table on the restaurant's floor-plan layout, as returned by the API. */
export interface Table {
  id: number
  label: string
  shape: TableShape
  capacity: number
  x: number
  y: number
  width: number
  height: number
}

/** Fields needed to create a new table. */
export type NewTable = Omit<Table, 'id'>

/** Partial fields for updating an existing table (position, size, etc). */
export type TableUpdate = Partial<NewTable>
