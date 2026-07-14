import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAnalyticsApi } from './analytics'
import type { MenuItemMetric, SalesMetric } from '../types/analytics'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const sales: SalesMetric[] = [{ date: '2026-07-10', revenue: '46.50' }]
const menuItems: MenuItemMetric[] = [{ menu_item_id: 3, name: 'Burger', quantity_sold: 3, revenue: '30.00' }]

describe('createAnalyticsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches sales with no query params when from/to are omitted', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sales))

    const api = createAnalyticsApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.sales()

    expect(result).toEqual(sales)
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/analytics/sales',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }) }),
    )
  })

  it('fetches sales with from/to query params when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sales))

    const api = createAnalyticsApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    await api.sales('2026-07-01', '2026-07-10')

    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/analytics/sales?from=2026-07-01&to=2026-07-10',
      expect.anything(),
    )
  })

  it('fetches menu item metrics with from/to query params when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(menuItems))

    const api = createAnalyticsApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.menuItems('2026-07-01', '2026-07-10')

    expect(result).toEqual(menuItems)
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/analytics/menu-items?from=2026-07-01&to=2026-07-10',
      expect.anything(),
    )
  })

  it('surfaces the Laravel error message on a non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }),
    )

    const api = createAnalyticsApi({ baseUrl: 'http://api.test' })

    await expect(api.sales()).rejects.toThrow(/unauthenticated/i)
  })
})
