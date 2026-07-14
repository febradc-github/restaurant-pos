import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createKitchenClockApi } from './kitchenClock'
import type { ClockResult } from '../types/kitchenClock'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('createKitchenClockApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits a PIN and returns the clock action and employee, with no Authorization header', async () => {
    const result: ClockResult = { action: 'clocked_in', employee: { id: 1, name: 'Kitchen Kev' } }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(result))

    const api = createKitchenClockApi({ baseUrl: 'http://api.test' })
    const response = await api.clock('123456')

    expect(response).toEqual(result)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/kitchen/clock')
    expect(calledInit).toMatchObject({ method: 'POST' })
    expect(calledInit!.headers).not.toHaveProperty('Authorization')
    expect(JSON.parse(calledInit!.body as string)).toEqual({ pin: '123456' })
  })

  it('throws a generic error when the PIN is rejected', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid PIN.' }), { status: 422 }),
    )

    const api = createKitchenClockApi({ baseUrl: 'http://api.test' })

    await expect(api.clock('000000')).rejects.toThrow(/422/)
  })
})
