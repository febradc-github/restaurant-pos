import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KitchenDisplay } from './KitchenDisplay'
import type { Order } from '../types/order'
import type { KitchenChannelHandlers } from '../realtime/echo'

const BASE_URL = 'http://api.test'

let capturedHandlers: KitchenChannelHandlers | null = null
const unsubscribe = vi.fn()

vi.mock('../realtime/echo', () => ({
  subscribeToKitchenChannel: vi.fn((handlers: KitchenChannelHandlers) => {
    capturedHandlers = handlers
    return unsubscribe
  }),
}))

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const pendingOrder: Order = {
  id: 1,
  table_id: 1,
  status: 'pending',
  created_at: '2026-07-16T12:00:00Z',
  table: {
    id: 1,
    label: 'Table 1',
    shape: 'round',
    capacity: 4,
    zone: 'Main Floor',
    is_occupied: true,
    x: 0,
    y: 0,
    width: 80,
    height: 80,
  },
  items: [
    {
      id: 1,
      order_id: 1,
      menu_item_id: 1,
      quantity: 2,
      menu_item: { id: 1, name: 'Burger', price: '9.99', category_id: 1, available: true },
    },
  ],
}

const secondOrder: Order = {
  id: 2,
  table_id: 2,
  status: 'pending',
  created_at: '2026-07-16T12:05:00Z',
  table: {
    id: 2,
    label: 'Table 2',
    shape: 'square',
    capacity: 2,
    zone: 'Main Floor',
    is_occupied: true,
    x: 100,
    y: 0,
    width: 60,
    height: 60,
  },
  items: [
    {
      id: 2,
      order_id: 2,
      menu_item_id: 2,
      quantity: 1,
      menu_item: { id: 2, name: 'Fries', price: '3.99', category_id: 1, available: true },
    },
  ],
}

describe('KitchenDisplay', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    capturedHandlers = null
    unsubscribe.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches pending orders on mount and renders them, with no Authorization header', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)

    expect(await screen.findByText('Table 1')).toBeInTheDocument()
    expect(screen.getByText(/2x Burger/)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/orders?status=pending`,
      expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
    )
  })

  it('adds a new order when an order.placed WebSocket event arrives, without re-fetching', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)

    await screen.findByText('Table 1')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(capturedHandlers).not.toBeNull()

    capturedHandlers!.onOrderPlaced(secondOrder)

    expect(await screen.findByText('Table 2')).toBeInTheDocument()
    expect(screen.getByText('Table 1')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('removes an order when an order.updated WebSocket event marks it ready', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder, secondOrder]))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    await screen.findByText('Table 1')
    await screen.findByText('Table 2')

    capturedHandlers!.onOrderUpdated({ ...pendingOrder, status: 'ready' })

    await waitFor(() => expect(screen.queryByText('Table 1')).not.toBeInTheDocument())
    expect(screen.getByText('Table 2')).toBeInTheDocument()
  })

  it('lets the kitchen mark an order ready, calling the PATCH endpoint and removing it from the pending view', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ ...pendingOrder, status: 'ready' }))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    await screen.findByText('Table 1')

    await user.click(screen.getByRole('button', { name: /mark ready/i }))

    await waitFor(() => expect(screen.queryByText('Table 1')).not.toBeInTheDocument())

    const [url, init] = vi.mocked(fetch).mock.calls[1]
    expect(url).toBe(`${BASE_URL}/api/orders/1/ready`)
    expect(init).toMatchObject({ method: 'PATCH' })
  })

  it('shows loading feedback on the specific order being marked ready, without disabling other orders', async () => {
    const user = userEvent.setup()
    let resolveMarkReady: (response: Response) => void = () => {}
    const markReadyPromise = new Promise<Response>((resolve) => {
      resolveMarkReady = resolve
    })
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder, secondOrder]))
      .mockReturnValueOnce(markReadyPromise)

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    const order1 = await screen.findByTestId('order-1')
    const order2 = screen.getByTestId('order-2')
    const markReadyButton1 = within(order1).getByRole('button', { name: /mark ready/i })
    const markReadyButton2 = within(order2).getByRole('button', { name: /mark ready/i })

    await user.click(markReadyButton1)

    expect(markReadyButton1).toHaveClass('ant-btn-loading')
    expect(markReadyButton2).toBeEnabled()

    resolveMarkReady!(jsonResponse({ ...pendingOrder, status: 'ready' }))
    await waitFor(() => expect(screen.queryByTestId('order-1')).not.toBeInTheDocument())
    expect(screen.getByTestId('order-2')).toBeInTheDocument()
  })

  it('re-fetches pending orders on every mount, so a remount after a reconnect catches up on missed orders', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))
    const { unmount } = render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    await screen.findByText('Table 1')
    unmount()

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([secondOrder]))
    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)

    expect(await screen.findByText('Table 2')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes from the kitchen channel on unmount', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([pendingOrder]))

    const { unmount } = render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    await screen.findByText('Table 1')

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })

  it('surfaces an error message when the initial fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('boom', { status: 500 }))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/500/)
  })

  // C-12: the PIN clock-in/out overlay is an independent addition to this
  // screen. This is the explicit regression check that it coexists with the
  // order list -- it doesn't replace it, navigate away from it, or require
  // any change to how orders are fetched or updated.
  it('renders the PIN clock-in/out overlay alongside the live order list, and a successful PIN entry does not disturb it', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([pendingOrder]))
      .mockResolvedValueOnce(jsonResponse({ action: 'clocked_in', employee: { id: 9, name: 'Kitchen Kev' } }))

    render(<KitchenDisplay apiBaseUrl={BASE_URL} />)
    await screen.findByText('Table 1')

    await user.click(screen.getByRole('button', { name: /clock in.*out/i }))
    for (const digit of '123456') {
      await user.click(screen.getByRole('button', { name: digit }))
    }
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/Kitchen Kev.*clocked in/i)
    // The order list is untouched -- still there, no navigation, no re-fetch.
    expect(screen.getByText('Table 1')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
