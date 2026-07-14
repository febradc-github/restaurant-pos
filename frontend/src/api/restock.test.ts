import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRestockApi } from './restock'
import type { InventoryItem, RestockItem } from '../types/restock'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const restockItem: RestockItem = {
  id: 1,
  name: 'Beef Patty',
  stock: 42,
  threshold: 20,
  suggested_threshold: 7,
  shortfall: 0,
}

describe('createRestockApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists restock candidates with a Bearer token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([restockItem]))

    const api = createRestockApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.list()

    expect(result).toEqual([restockItem])
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/inventory-items/restock',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }) }),
    )
  })

  it('updates a threshold via PATCH with a JSON body', async () => {
    const updated: InventoryItem = { id: 1, name: 'Beef Patty', stock: 42, threshold: 40 }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    const api = createRestockApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.updateThreshold(1, 40)

    expect(result).toEqual(updated)
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/inventory-items/1/threshold', {
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer owner-token', 'Content-Type': 'application/json' }),
      body: JSON.stringify({ threshold: 40 }),
    })
  })

  it('surfaces the Laravel error message on a non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: 'The given data was invalid.', errors: { threshold: ['The threshold must be at least 0.'] } }, { status: 422 }),
    )

    const api = createRestockApi({ baseUrl: 'http://api.test', token: 'owner-token' })

    await expect(api.updateThreshold(1, -5)).rejects.toThrow(/threshold must be at least 0/i)
  })
})
