import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmployeesApi } from './employees'
import type { Employee } from '../types/employee'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const owner: Employee = {
  id: 1,
  name: 'Olive Owner',
  email: 'owner@example.com',
  role: 'owner',
  active: true,
  has_pin: false,
}

const cook: Employee = {
  id: 2,
  name: 'Casey Cook',
  email: null,
  role: 'kitchen',
  active: true,
  has_pin: true,
}

describe('createEmployeesApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lists employees with a Bearer token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([owner, cook]))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.list()

    expect(result).toEqual([owner, cook])
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/employees',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }) }),
    )
  })

  it('creates a login-role employee with name/role/email/password', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(owner, { status: 201 }))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.create({
      name: 'Olive Owner',
      role: 'owner',
      email: 'owner@example.com',
      password: 'secret123',
    })

    expect(result).toEqual(owner)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/employees')
    expect(calledInit).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }),
    })
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      name: 'Olive Owner',
      role: 'owner',
      email: 'owner@example.com',
      password: 'secret123',
    })
  })

  it('creates a kitchen employee with name/role/pin', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(cook, { status: 201 }))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    await api.create({ name: 'Casey Cook', role: 'kitchen', pin: '123456' })

    const [, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      name: 'Casey Cook',
      role: 'kitchen',
      pin: '123456',
    })
  })

  it('updates an employee via PATCH to /api/employees/{id}', async () => {
    const updated: Employee = { ...owner, role: 'cashier' }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.update(1, { role: 'cashier', password: 'newpassword1' })

    expect(result).toEqual(updated)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/employees/1')
    expect(calledInit).toMatchObject({ method: 'PATCH' })
    expect(JSON.parse(calledInit!.body as string)).toEqual({ role: 'cashier', password: 'newpassword1' })
  })

  it('deactivates an employee via PATCH to /api/employees/{id}/deactivate with no body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...owner, active: false }))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.deactivate(1)

    expect(result.active).toBe(false)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/employees/1/deactivate')
    expect(calledInit).toMatchObject({ method: 'PATCH' })
    expect(calledInit!.body).toBeUndefined()
  })

  it('reactivates an employee via PATCH to /api/employees/{id}/reactivate with no body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...owner, active: true }))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })
    const result = await api.reactivate(1)

    expect(result.active).toBe(true)
    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe('http://api.test/api/employees/1/reactivate')
    expect(calledInit).toMatchObject({ method: 'PATCH' })
    expect(calledInit!.body).toBeUndefined()
  })

  it('surfaces the backend validation message when deactivation is refused (422)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        { message: 'The given data was invalid.', errors: { user: ['You cannot deactivate your own account.'] } },
        { status: 422 },
      ),
    )

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })

    await expect(api.deactivate(1)).rejects.toMatchObject({
      status: 422,
      message: 'You cannot deactivate your own account.',
    })
  })

  it('throws with a status property on a generic error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }))

    const api = createEmployeesApi({ baseUrl: 'http://api.test', token: 'owner-token' })

    await expect(api.list()).rejects.toMatchObject({ status: 500 })
  })
})
