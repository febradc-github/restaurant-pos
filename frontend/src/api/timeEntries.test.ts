import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTimeEntriesApi } from './timeEntries'
import type { TimeEntry } from '../types/timeEntry'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const entry: TimeEntry = {
  id: 1,
  user_id: 4,
  role: 'cashier',
  clock_in: '2026-07-10T09:00:00Z',
  clock_out: '2026-07-10T17:00:00Z',
  auto_closed: false,
}

describe('createTimeEntriesApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists time entries with no query params when none are given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([entry]))

    const api = createTimeEntriesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.list()

    expect(result).toEqual([entry])
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/time-entries',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }) }),
    )
  })

  it('lists time entries with user_id/role/from/to query params when given', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([entry]))

    const api = createTimeEntriesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    await api.list({ user_id: 4, role: 'cashier', from: '2026-07-01', to: '2026-07-10' })

    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/time-entries?user_id=4&role=cashier&from=2026-07-01&to=2026-07-10',
      expect.anything(),
    )
  })

  it('surfaces the Laravel error message on a non-2xx response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated.' }, { status: 401 }))

    const api = createTimeEntriesApi({ baseUrl: 'http://api.test' })

    await expect(api.list()).rejects.toThrow(/unauthenticated/i)
  })
})
