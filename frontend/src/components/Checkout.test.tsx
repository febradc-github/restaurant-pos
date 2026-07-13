import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkout } from './Checkout'
import type { Order } from '../types/order'
import type { Table } from '../types/table'
import type { MenuItem } from '../types/menu'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const table1: Table = { id: 1, label: 'Patio 1', shape: 'round', capacity: 4, x: 0, y: 0, width: 80, height: 80 }
const burger: MenuItem = { id: 1, name: 'Cheeseburger', price: '9.99', category_id: 1, available: true }

const pendingOrder: Order = {
  id: 1,
  table_id: 1,
  status: 'pending',
  table: table1,
  items: [{ id: 1, order_id: 1, menu_item_id: 1, quantity: 2, menu_item: burger }],
}

const paidOrder: Order = { ...pendingOrder, id: 2, status: 'paid' }

describe('Checkout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not fetch orders or render any checkout action without a Cashier token', () => {
    render(<Checkout apiBaseUrl={BASE_URL} authToken={null} />)

    expect(fetch).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /confirm payment/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cancel order/i })).not.toBeInTheDocument()
  })

  it('fetches and displays open orders, excluding paid/cancelled ones', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, paidOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    expect(await screen.findByText('Patio 1')).toBeInTheDocument()
    expect(screen.getByText(/2x Cheeseburger/i)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/orders`, expect.anything())
    expect(screen.getAllByTestId(/checkout-order-/)).toHaveLength(1)
  })

  it('confirms payment, calling the checkout endpoint with the chosen method and Bearer token', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'paid', print_status: 'printed' }))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    await user.selectOptions(within(orderRow).getByLabelText(/payment method/i), 'gcash')
    await user.click(within(orderRow).getByRole('button', { name: /confirm payment/i }))

    await waitFor(() => expect(within(orderRow).getByRole('status')).toHaveTextContent(/paid/i))
    expect(within(orderRow).queryByRole('alert')).not.toBeInTheDocument()

    const [checkoutUrl, checkoutInit] = vi.mocked(fetch).mock.calls[1]
    expect(checkoutUrl).toBe(`${BASE_URL}/api/orders/1/checkout`)
    expect(checkoutInit).toMatchObject({
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer cashier-token' }),
    })
    expect(JSON.parse(checkoutInit!.body as string)).toEqual({ payment_method: 'gcash' })
  })

  it('shows a print-failure warning, distinct from normal success, when print_status is failed', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'paid', print_status: 'failed' }))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    await user.click(within(orderRow).getByRole('button', { name: /confirm payment/i }))

    expect(await within(orderRow).findByRole('alert')).toHaveTextContent(/receipt failed to print/i)
    expect(within(orderRow).getByRole('status')).toHaveTextContent(/paid/i)
  })

  it('cancels an order, calling the cancel endpoint and removing it from the open list', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'cancelled' }))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    await user.click(screen.getByRole('button', { name: /cancel order/i }))

    await waitFor(() => expect(screen.queryByTestId('checkout-order-1')).not.toBeInTheDocument())

    const [cancelUrl, cancelInit] = vi.mocked(fetch).mock.calls[1]
    expect(cancelUrl).toBe(`${BASE_URL}/api/orders/1/cancel`)
    expect(cancelInit).toMatchObject({ method: 'POST' })
  })
})
