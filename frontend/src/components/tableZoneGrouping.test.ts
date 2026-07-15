import { describe, expect, it } from 'vitest'
import { groupTablesByZone, UNASSIGNED_ZONE } from './tableZoneGrouping'
import type { Table } from '../types/table'

function makeTable(overrides: Partial<Table> & Pick<Table, 'id'>): Table {
  return {
    label: `Table ${overrides.id}`,
    shape: 'round',
    capacity: 4,
    zone: null,
    is_occupied: false,
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    ...overrides,
  }
}

describe('groupTablesByZone', () => {
  it('groups tables under their zone heading', () => {
    const patio1 = makeTable({ id: 1, zone: 'Patio' })
    const bar1 = makeTable({ id: 2, zone: 'Bar' })
    const patio2 = makeTable({ id: 3, zone: 'Patio' })

    const groups = groupTablesByZone([patio1, bar1, patio2])

    expect(groups).toEqual([
      { zone: 'Patio', tables: [patio1, patio2] },
      { zone: 'Bar', tables: [bar1] },
    ])
  })

  it('puts tables with a null zone under the Unassigned heading', () => {
    const noZone = makeTable({ id: 1, zone: null })

    const groups = groupTablesByZone([noZone])

    expect(groups).toEqual([{ zone: UNASSIGNED_ZONE, tables: [noZone] }])
  })

  it('treats a blank/whitespace-only zone the same as no zone', () => {
    const blankZone = makeTable({ id: 1, zone: '   ' })

    const groups = groupTablesByZone([blankZone])

    expect(groups).toEqual([{ zone: UNASSIGNED_ZONE, tables: [blankZone] }])
  })

  it('sorts the Unassigned group last regardless of where it first appears', () => {
    const noZone = makeTable({ id: 1, zone: null })
    const patio = makeTable({ id: 2, zone: 'Patio' })

    const groups = groupTablesByZone([noZone, patio])

    expect(groups.map((g) => g.zone)).toEqual(['Patio', UNASSIGNED_ZONE])
  })

  it('preserves each table\'s original order within its zone', () => {
    const first = makeTable({ id: 1, zone: 'Patio' })
    const second = makeTable({ id: 2, zone: 'Patio' })
    const third = makeTable({ id: 3, zone: 'Patio' })

    const groups = groupTablesByZone([third, first, second].sort((a, b) => a.id - b.id))

    expect(groups[0]!.tables.map((t) => t.id)).toEqual([1, 2, 3])
  })

  it('returns an empty array for no tables', () => {
    expect(groupTablesByZone([])).toEqual([])
  })
})
