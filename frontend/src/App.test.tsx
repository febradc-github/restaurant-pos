import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { AuthSession } from './types/auth'
import type { KitchenChannelHandlers } from './realtime/echo'

vi.mock('./realtime/echo', () => ({
  subscribeToKitchenChannel: vi.fn((_handlers: KitchenChannelHandlers) => vi.fn()),
}))

const serverSession: AuthSession = {
  token: 'server-token',
  user: { id: 1, name: 'Sam Erver', email: 'server@example.com', role: 'server' },
}

const cashierSession: AuthSession = {
  token: 'cashier-token',
  user: { id: 2, name: 'Cass Ashier', email: 'cashier@example.com', role: 'cashier' },
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

/** Answers every request the always-mounted screens might issue, keyed by path suffix. */
function stubFetch(loginSession: AuthSession) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/api/login')) return Promise.resolve(jsonResponse(loginSession))
      if (url.endsWith('/api/logout')) return Promise.resolve(jsonResponse({ message: 'Logged out successfully.' }))
      if (url.endsWith('/api/orders')) return Promise.resolve(jsonResponse([]))
      if (url.endsWith('/api/tables')) return Promise.resolve(jsonResponse([]))
      if (url.endsWith('/api/menu-items')) return Promise.resolve(jsonResponse([]))
      throw new Error(`Unexpected fetch in test: ${init?.method ?? 'GET'} ${url}`)
    }),
  )
}

async function logIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), 'someone@example.com')
  await user.type(screen.getByLabelText(/password/i), 'secret-password')
  await user.click(screen.getByRole('button', { name: /log in/i }))
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the login screen and no Take-Orders or Checkout screen when logged out', () => {
    stubFetch(serverSession)

    render(<App />)

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /checkout/i })).not.toBeInTheDocument()
  })

  it('reveals the Take-Orders screen after a Server logs in, and logging out returns to the login screen', async () => {
    stubFetch(serverSession)
    const user = userEvent.setup()

    render(<App />)
    await logIn(user)

    expect(await screen.findByRole('heading', { name: /take order/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /log in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /checkout/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
  })

  it('still reveals Checkout (not Take-Orders) after a Cashier logs in', async () => {
    stubFetch(cashierSession)
    const user = userEvent.setup()

    render(<App />)
    await logIn(user)

    expect(await screen.findByRole('heading', { name: /checkout/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
  })
})
