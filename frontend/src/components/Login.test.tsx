import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'
import type { AuthSession } from '../types/auth'

const BASE_URL = 'http://api.test'

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

describe('Login', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs in with valid credentials, calling the API and invoking onLogin with the session', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(sampleSession))

    render(<Login apiBaseUrl={BASE_URL} onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(sampleSession))

    const [calledUrl, calledInit] = vi.mocked(fetch).mock.calls[0]
    expect(calledUrl).toBe(`${BASE_URL}/api/login`)
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      identifier: 'cashier@example.com',
      password: 'secret',
    })
  })

  it('shows an error and does not call onLogin when credentials are invalid', async () => {
    const user = userEvent.setup()
    const onLogin = vi.fn()
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 422 }),
    )

    render(<Login apiBaseUrl={BASE_URL} onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/email/i), 'cashier@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })
})
