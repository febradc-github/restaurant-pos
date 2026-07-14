import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TakeOrdersPage } from './TakeOrdersPage'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('TakeOrdersPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse([]))))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the Take Order screen under page-level chrome', async () => {
    render(<TakeOrdersPage />)

    expect(await screen.findByRole('heading', { name: /take order/i })).toBeInTheDocument()
  })

  it('forwards apiBaseUrl to OrderTaking, fetching tables and menu items with no auth header', async () => {
    render(<TakeOrdersPage apiBaseUrl="http://api.test" />)

    await screen.findByRole('heading', { name: /take order/i })
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/tables', expect.anything())
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/menu-items', expect.anything())
  })
})
