import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KitchenPage } from './KitchenPage'
import type { KitchenChannelHandlers } from '../realtime/echo'

vi.mock('../realtime/echo', () => ({
  subscribeToKitchenChannel: vi.fn((_handlers: KitchenChannelHandlers) => vi.fn()),
}))

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('KitchenPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse([]))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Kitchen Display screen under page-level chrome', async () => {
    render(<KitchenPage />)

    expect(await screen.findByRole('heading', { name: /kitchen display/i })).toBeInTheDocument()
  })

  // Critical regression check against adr-008-server-login-kitchen-pin-attendance:
  // this page must never require a session, and must never send an auth header.
  it('renders with no session/token of any kind, and issues no Authorization header on its fetch', async () => {
    render(<KitchenPage apiBaseUrl="http://api.test" />)

    await screen.findByRole('heading', { name: /kitchen display/i })
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/orders?status=pending',
      expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
    )
  })
})
