import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  LINE_ITEM_PREVIEW_COUNT,
  formatElapsed,
  isToday,
  orderMatchesSearch,
  orderTotalAmount,
  sortOrdersByCreatedAt,
} from './checkoutHelpers'
import type { Order } from '../types/order'
import type { Table } from '../types/table'
import type { MenuItem } from '../types/menu'

const table: Table = {
  id: 1,
  label: 'Patio 1',
  shape: 'round',
  capacity: 4,
  zone: 'Patio',
  is_occupied: true,
  x: 0,
  y: 0,
  width: 80,
  height: 80,
}

const burger: MenuItem = { id: 1, name: 'Cheeseburger', price: '9.99', category_id: 1, available: true }
const fries: MenuItem = { id: 2, name: 'Fries', price: '3.50', category_id: 1, available: true }

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    table_id: 1,
    status: 'pending',
    created_at: '2026-07-16T12:00:00Z',
    table,
    items: [{ id: 1, order_id: 1, menu_item_id: 1, quantity: 2, notes: null, menu_item: burger }],
    ...overrides,
  }
}

describe('orderTotalAmount', () => {
  it('sums quantity x price across every line item', () => {
    const order = makeOrder({
      items: [
        { id: 1, order_id: 1, menu_item_id: 1, quantity: 2, notes: null, menu_item: burger },
        { id: 2, order_id: 1, menu_item_id: 2, quantity: 3, notes: null, menu_item: fries },
      ],
    })
    expect(orderTotalAmount(order)).toBeCloseTo(2 * 9.99 + 3 * 3.5)
  })
})

describe('formatElapsed', () => {
  it('reports "just now" for an order placed seconds ago', () => {
    const now = new Date('2026-07-16T12:00:30Z')
    expect(formatElapsed('2026-07-16T12:00:00Z', now)).toBe('just now')
  })

  it('reports whole minutes under an hour', () => {
    const now = new Date('2026-07-16T12:12:00Z')
    expect(formatElapsed('2026-07-16T12:00:00Z', now)).toBe('12 min')
  })

  it('reports hours once past 60 minutes', () => {
    const now = new Date('2026-07-16T13:00:00Z')
    expect(formatElapsed('2026-07-16T12:00:00Z', now)).toBe('1 hr')
  })

  it('reports hours and minutes together', () => {
    const now = new Date('2026-07-16T13:05:00Z')
    expect(formatElapsed('2026-07-16T12:00:00Z', now)).toBe('1 hr 5 min')
  })
})

describe('isToday', () => {
  // Timestamps are derived relative to `now` (rather than fixed UTC
  // strings) so this test is stable regardless of the system's local
  // timezone -- "calendar day" is inherently local-time-dependent.
  it('is true for a timestamp on the same calendar day', () => {
    const now = new Date('2026-07-16T12:00:00Z')
    const earlierToday = dayjs(now).startOf('day').add(1, 'hour').toISOString()
    expect(isToday(earlierToday, now)).toBe(true)
  })

  it('is false for a timestamp on a different calendar day', () => {
    const now = new Date('2026-07-16T12:00:00Z')
    const yesterday = dayjs(now).subtract(1, 'day').toISOString()
    expect(isToday(yesterday, now)).toBe(false)
  })
})

describe('orderMatchesSearch', () => {
  it('matches on table label, case-insensitively', () => {
    expect(orderMatchesSearch(makeOrder(), 'patio')).toBe(true)
    expect(orderMatchesSearch(makeOrder(), 'PATIO 1')).toBe(true)
  })

  it('matches on a line item menu item name', () => {
    expect(orderMatchesSearch(makeOrder(), 'cheese')).toBe(true)
  })

  it('does not match an unrelated query', () => {
    expect(orderMatchesSearch(makeOrder(), 'sushi')).toBe(false)
  })

  it('matches everything for a blank query', () => {
    expect(orderMatchesSearch(makeOrder(), '   ')).toBe(true)
  })
})

describe('sortOrdersByCreatedAt', () => {
  const older = makeOrder({ id: 1, created_at: '2026-07-16T10:00:00Z' })
  const newer = makeOrder({ id: 2, created_at: '2026-07-16T11:00:00Z' })

  it('sorts oldest first', () => {
    expect(sortOrdersByCreatedAt([newer, older], 'oldest').map((o) => o.id)).toEqual([1, 2])
  })

  it('sorts newest first', () => {
    expect(sortOrdersByCreatedAt([older, newer], 'newest').map((o) => o.id)).toEqual([2, 1])
  })

  it('does not mutate the input array', () => {
    const input = [newer, older]
    sortOrdersByCreatedAt(input, 'oldest')
    expect(input).toEqual([newer, older])
  })
})

describe('LINE_ITEM_PREVIEW_COUNT', () => {
  it('is small enough that a 12-item order overflows it', () => {
    expect(LINE_ITEM_PREVIEW_COUNT).toBeLessThan(12)
  })
})
