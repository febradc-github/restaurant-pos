import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CashierPage } from './CashierPage'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('CashierPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse([]))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Checkout screen under page-level chrome', async () => {
    render(<CashierPage authToken="cashier-token" />)

    expect(await screen.findByRole('heading', { name: /checkout/i })).toBeInTheDocument()
  })

  it('forwards the Cashier auth token to Checkout, fetching open orders', async () => {
    render(<CashierPage apiBaseUrl="http://api.test" authToken="cashier-token" />)

    await screen.findByRole('heading', { name: /checkout/i })
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/api/orders',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer cashier-token' }) }),
    )
  })

  it('renders Checkout read-only fallback when there is no auth token', () => {
    render(<CashierPage authToken={null} />)

    expect(screen.getByText(/log in as a cashier/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
