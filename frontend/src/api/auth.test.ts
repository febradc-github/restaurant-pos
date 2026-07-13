import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuthApi } from './auth'
import type { AuthSession } from '../types/auth'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const sampleSession: AuthSession = {
  token: 'cashier-token',
  user: { id: 1, name: 'Cass Ashier', email: 'cashier@example.com', role: 'cashier' },
}

describe('createAuthApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs in with an identifier and password, returning the session', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleSession))

    const api = createAuthApi({ baseUrl: 'http://api.test' })
    const result = await api.login('cashier@example.com', 'secret')

    expect(result).toEqual(sampleSession)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/login')
    expect(calledInit).toMatchObject({ method: 'POST' })
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      identifier: 'cashier@example.com',
      password: 'secret',
    })
  })

  it('throws when login fails with invalid credentials', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 422 }),
    )

    const api = createAuthApi({ baseUrl: 'http://api.test' })

    await expect(api.login('cashier@example.com', 'wrong')).rejects.toThrow(/422/)
  })

  it('logs out with a Bearer token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Logged out successfully.' }))

    const api = createAuthApi({ baseUrl: 'http://api.test' })
    await api.logout('cashier-token')

    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/logout')
    expect(calledInit).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer cashier-token' }),
    })
  })
})
