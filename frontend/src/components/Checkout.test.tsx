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
    // antd's Radio.Button hides the native input (pointer-events: none) and
    // relies on label-click delegation, so the click target is the visible
    // label text rather than the `radio` role itself.
    await user.click(within(orderRow).getByText('GCash'))
    expect(within(orderRow).getByRole('radio', { name: /gcash/i })).toBeChecked()
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

  it('renders the print-failure notice as a warning, not an error, so it never reads as a failed payment', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'paid', print_status: 'failed' }))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    await user.click(within(orderRow).getByRole('button', { name: /confirm payment/i }))

    const printWarning = await within(orderRow).findByRole('alert')
    expect(printWarning.className).toMatch(/ant-alert-warning/)
    expect(printWarning.className).not.toMatch(/ant-alert-error/)
  })

  it('cancels an order, calling the cancel endpoint and removing it from the open list, after confirming', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'cancelled' }))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    await user.click(screen.getByRole('button', { name: /cancel order/i }))
    await user.click(await screen.findByRole('button', { name: /yes, cancel/i }))

    await waitFor(() => expect(screen.queryByTestId('checkout-order-1')).not.toBeInTheDocument())

    const [cancelUrl, cancelInit] = vi.mocked(fetch).mock.calls[1]
    expect(cancelUrl).toBe(`${BASE_URL}/api/orders/1/cancel`)
    expect(cancelInit).toMatchObject({ method: 'POST' })
  })

  it('requires confirmation before cancelling an order -- a bare tap does not cancel it', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    await user.click(screen.getByRole('button', { name: /cancel order/i }))

    expect(await screen.findByText(/cancel this order\?/i)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('checkout-order-1')).toBeInTheDocument()
  })

  it('renders a large Confirm payment button and payment method group for comfortable touch targets', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    expect(within(orderRow).getByRole('button', { name: /confirm payment/i })).toHaveClass('ant-btn-lg')
    expect(within(orderRow).getByRole('radiogroup')).toHaveClass('ant-radio-group-large')
  })

  it('shows loading feedback and disables checkout actions on this order while confirming payment', async () => {
    const user = userEvent.setup()
    let resolveCheckout: (response: Response) => void = () => {}
    const checkoutPromise = new Promise<Response>((resolve) => {
      resolveCheckout = resolve
    })
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder])).mockReturnValueOnce(checkoutPromise)

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    const confirmButton = within(orderRow).getByRole('button', { name: /confirm payment/i })
    const cancelButton = within(orderRow).getByRole('button', { name: /cancel order/i })
    await user.click(confirmButton)

    expect(confirmButton).toHaveClass('ant-btn-loading')
    expect(cancelButton).toBeDisabled()

    resolveCheckout!(jsonResponse({ ...pendingOrder, status: 'paid', print_status: 'printed' }))
    await waitFor(() => expect(within(orderRow).getByRole('status')).toHaveTextContent(/paid/i))
    expect(within(orderRow).queryByRole('button', { name: /confirm payment/i })).not.toBeInTheDocument()
  })
})
