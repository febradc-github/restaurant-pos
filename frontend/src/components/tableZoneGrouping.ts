import type { Table } from '../types/table'

/** Heading used for tables with no zone set (or a zone that's just whitespace). */
export const UNASSIGNED_ZONE = 'Unassigned'

/** One zone heading and the tables that belong under it. */
export interface TableZoneGroup {
  zone: string
  tables: Table[]
}

/**
 * Groups tables by their `zone` field for the card-grid layout (C-37).
 * Tables keep their original (id/creation) order within a zone -- there's
 * no drag-to-reorder, per this ticket's scope. Zones appear in the order
 * their first table appears in `tables`, except the Unassigned catch-all
 * (tables with a null/blank zone), which always sorts last regardless of
 * where it first occurs, so real zones read first.
 */
export function groupTablesByZone(tables: Table[]): TableZoneGroup[] {
  const groups = new Map<string, Table[]>()

  for (const table of tables) {
    const zone = table.zone?.trim() ? table.zone.trim() : UNASSIGNED_ZONE
    const existing = groups.get(zone)
    if (existing) {
      existing.push(table)
    } else {
      groups.set(zone, [table])
    }
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === UNASSIGNED_ZONE) return 1
      if (b === UNASSIGNED_ZONE) return -1
      return 0
    })
    .map(([zone, zoneTables]) => ({ zone, tables: zoneTables }))
}
