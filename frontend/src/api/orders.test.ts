import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createOrdersApi } from './orders'
import type { Order } from '../types/order'
import type { Table } from '../types/table'
import type { MenuItem } from '../types/menu'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const sampleTable: Table = {
  id: 1,
  label: 'Table 1',
  shape: 'round',
  capacity: 4,
  x: 10,
  y: 20,
  width: 80,
  height: 80,
}

const sampleMenuItem: MenuItem = {
  id: 1,
  name: 'Cheeseburger',
  price: '9.99',
  category_id: 1,
  available: true,
}

const sampleOrder: Order = {
  id: 1,
  table_id: 1,
  status: 'pending',
  table: sampleTable,
  items: [{ id: 1, order_id: 1, menu_item_id: 1, quantity: 2, menu_item: sampleMenuItem }],
}

describe('createOrdersApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists orders without a status filter or Authorization header by default', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleOrder]))

    const api = createOrdersApi({ baseUrl: 'http://api.test' })
    const result = await api.list()

    expect(result).toEqual([sampleOrder])
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/orders',
      expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
    )
  })

  it('lists orders filtered by status when given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleOrder]))

    const api = createOrdersApi({ baseUrl: 'http://api.test' })
    await api.list('pending')

    expect(fetch).toHaveBeenCalledWith('http://api.test/api/orders?status=pending', expect.anything())
  })

  it('creates an order with a JSON body and no Authorization header when no token is given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleOrder, { status: 201 }))

    const api = createOrdersApi({ baseUrl: 'http://api.test' })
    const result = await api.create({ table_id: 1, items: [{ menu_item_id: 1, quantity: 2 }] })

    expect(result).toEqual(sampleOrder)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/orders')
    expect(calledInit).toMatchObject({
      method: 'POST',
      headers: expect.not.objectContaining({ Authorization: expect.anything() }),
    })
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      table_id: 1,
      items: [{ menu_item_id: 1, quantity: 2 }],
    })
  })

  it('marks an order ready via PATCH to /api/orders/{id}/ready', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...sampleOrder, status: 'ready' }))

    const api = createOrdersApi({ baseUrl: 'http://api.test' })
    const result = await api.markReady(1)

    expect(result.status).toBe('ready')
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/orders/1/ready')
    expect(calledInit).toMatchObject({ method: 'PATCH' })
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }))

    const api = createOrdersApi({ baseUrl: 'http://api.test' })

    await expect(api.list()).rejects.toThrow(/500/)
  })
})
