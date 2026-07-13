import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTablesApi } from './tables'
import type { Table } from '../types/table'

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

describe('createTablesApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists tables without an Authorization header when no token is given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([sampleTable]))

    const api = createTablesApi({ baseUrl: 'http://api.test' })
    const result = await api.list()

    expect(result).toEqual([sampleTable])
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/tables',
      expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
    )
  })

  it('creates a table with a Bearer token and JSON body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleTable, { status: 201 }))

    const api = createTablesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.create({
      label: 'Table 1',
      shape: 'round',
      capacity: 4,
      x: 10,
      y: 20,
      width: 80,
      height: 80,
    })

    expect(result).toEqual(sampleTable)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/tables')
    expect(calledInit).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }),
    })
    expect(JSON.parse(calledInit!.body as string)).toMatchObject({ label: 'Table 1', shape: 'round' })
  })

  it('updates a table via PATCH to /api/tables/{id}', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...sampleTable, x: 999 }))

    const api = createTablesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    await api.update(1, { x: 999 })

    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/tables/1')
    expect(calledInit).toMatchObject({ method: 'PATCH' })
    expect(JSON.parse(calledInit!.body as string)).toEqual({ x: 999 })
  })

  it('deletes a table via DELETE to /api/tables/{id}', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    const api = createTablesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    await api.remove(1)

    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/tables/1')
    expect(calledInit).toMatchObject({ method: 'DELETE' })
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }))

    const api = createTablesApi({ baseUrl: 'http://api.test' })

    await expect(api.list()).rejects.toThrow(/500/)
  })
})
