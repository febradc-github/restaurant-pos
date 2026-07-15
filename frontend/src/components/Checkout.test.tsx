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

const table1: Table = {
  id: 1,
  label: 'Patio 1',
  shape: 'round',
  capacity: 4,
  zone: 'Patio',
  is_occupied: true,
  x: 0,
  y: 0,
  width: 80,
  height: 80,
}
const burger: MenuItem = { id: 1, name: 'Cheeseburger', price: '9.99', category_id: 1, available: true }

const table2: Table = { ...table1, id: 2, label: 'Bar 3' }
const fries: MenuItem = { id: 2, name: 'Fries', price: '3.50', category_id: 1, available: true }

const pendingOrder: Order = {
  id: 1,
  table_id: 1,
  status: 'pending',
  created_at: '2026-07-16T12:00:00Z',
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
    vi.useRealTimers()
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

  it('shows the order number and elapsed time since the order was placed', async () => {
    vi.setSystemTime(new Date('2026-07-16T12:12:00Z'))
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    expect(within(orderRow).getByText('#1')).toBeInTheDocument()
    expect(within(orderRow).getByText('12 min')).toBeInTheDocument()
  })

  it('distinguishes two open orders for the same table by order number', async () => {
    const secondOrderSameTable: Order = { ...pendingOrder, id: 9 }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, secondOrderSameTable]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    expect(await screen.findByTestId('checkout-order-1')).toBeInTheDocument()
    expect(screen.getByTestId('checkout-order-9')).toBeInTheDocument()
    expect(within(screen.getByTestId('checkout-order-1')).getByText('#1')).toBeInTheDocument()
    expect(within(screen.getByTestId('checkout-order-9')).getByText('#9')).toBeInTheDocument()
  })

  it('shows a right-aligned price per line item and a total footer that the confirm button label repeats', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    expect(within(orderRow).getByText('₱19.98')).toBeInTheDocument()
    expect(within(orderRow).getByText(/Total: ₱19\.98/)).toBeInTheDocument()
    expect(within(orderRow).getByRole('button', { name: /confirm payment ₱19\.98/i })).toBeInTheDocument()
  })

  it('truncates a long order to the preview count and expands it via "+N more items"', async () => {
    const user = userEvent.setup()
    const bigOrder: Order = {
      ...pendingOrder,
      id: 3,
      items: Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        order_id: 3,
        menu_item_id: 1,
        quantity: 1,
        menu_item: { ...burger, name: `Item ${index + 1}` },
      })),
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([bigOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-3')
    expect(within(orderRow).getByText(/^1x Item 1$/)).toBeInTheDocument()
    expect(within(orderRow).queryByText(/^1x Item 12$/)).not.toBeInTheDocument()

    await user.click(within(orderRow).getByRole('button', { name: /\+7 more items/i }))

    expect(within(orderRow).getByText(/^1x Item 12$/)).toBeInTheDocument()
    expect(within(orderRow).getByRole('button', { name: /show less/i })).toBeInTheDocument()
  })

  it('does not truncate an order at or under the preview count', async () => {
    const smallOrder: Order = {
      ...pendingOrder,
      id: 4,
      items: Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        order_id: 4,
        menu_item_id: 1,
        quantity: 1,
        menu_item: { ...burger, name: `Item ${index + 1}` },
      })),
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([smallOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-4')
    expect(within(orderRow).getByText(/^1x Item 5$/)).toBeInTheDocument()
    expect(within(orderRow).queryByText(/more items/i)).not.toBeInTheDocument()
  })

  it('shows a shift-summary header with open order count, pending total, and paid-today total', async () => {
    const paidToday: Order = {
      ...pendingOrder,
      id: 5,
      status: 'paid',
      created_at: '2026-07-16T09:00:00Z',
      items: [{ id: 10, order_id: 5, menu_item_id: 1, quantity: 1, menu_item: burger }],
    }
    vi.setSystemTime(new Date('2026-07-16T15:00:00Z'))
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, paidToday]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    const stats = screen.getByTestId('checkout-stats')
    expect(within(stats).getByText('Open orders')).toBeInTheDocument()
    expect(within(stats).getByText('1')).toBeInTheDocument()
    expect(within(stats).getByText('Pending total')).toBeInTheDocument()
    expect(within(stats).getByText('₱19.98')).toBeInTheDocument()
    expect(within(stats).getByText('Paid today')).toBeInTheDocument()
    expect(within(stats).getByText('₱9.99')).toBeInTheDocument()
  })

  it('filters visible orders by table label via the search input', async () => {
    const user = userEvent.setup()
    const orderOnTable2: Order = { ...pendingOrder, id: 2, table: table2 }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, orderOnTable2]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    expect(screen.getByTestId('checkout-order-2')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /search orders/i }), 'Bar 3')

    expect(screen.queryByTestId('checkout-order-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('checkout-order-2')).toBeInTheDocument()
  })

  it('filters visible orders by line item name via the search input', async () => {
    const user = userEvent.setup()
    const friesOrder: Order = {
      ...pendingOrder,
      id: 2,
      table: table2,
      items: [{ id: 20, order_id: 2, menu_item_id: 2, quantity: 1, menu_item: fries }],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, friesOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    expect(screen.getByTestId('checkout-order-2')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /search orders/i }), 'fries')

    expect(screen.queryByTestId('checkout-order-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('checkout-order-2')).toBeInTheDocument()
  })

  it('reorders orders via the sort control, defaulting to oldest first', async () => {
    const user = userEvent.setup()
    const older: Order = { ...pendingOrder, id: 1, created_at: '2026-07-16T10:00:00Z' }
    const newer: Order = { ...pendingOrder, id: 2, table: table2, created_at: '2026-07-16T11:00:00Z' }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([newer, older]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    await screen.findByTestId('checkout-order-1')
    const orderedIds = () => screen.getAllByTestId(/checkout-order-/).map((card) => card.dataset.testid)
    expect(orderedIds()).toEqual(['checkout-order-1', 'checkout-order-2'])

    await user.click(screen.getByRole('combobox', { name: /sort orders/i }))
    await user.click(await screen.findByText('Newest first'))

    expect(orderedIds()).toEqual(['checkout-order-2', 'checkout-order-1'])
  })

  it('keeps Cancel order visually demoted to a quiet text-style button', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<Checkout apiBaseUrl={BASE_URL} authToken="cashier-token" />)

    const orderRow = await screen.findByTestId('checkout-order-1')
    const cancelButton = within(orderRow).getByRole('button', { name: /cancel order/i })
    expect(cancelButton).toHaveClass('ant-btn-text')
    expect(cancelButton).not.toHaveClass('ant-btn-primary')
  })
})
