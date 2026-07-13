import type { NewOrder, Order, OrderStatus } from '../types/order'
import type { CheckoutResult, PaymentMethod, PrintStatus } from '../types/checkout'
import { getApiBaseUrl } from './tables'

export interface OrdersApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
  /**
   * Bearer token. Omit (or pass null) for unauthenticated access -- the
   * Server (order taking) and Kitchen (order status) views use this
   * endpoint with no login. Checkout and cancel (C-7) require a Cashier's
   * token; markReady and list remain open to any device.
   */
  token?: string | null
}

function buildHeaders(token: string | null | undefined, hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request to ${response.url} failed with status ${response.status}: ${body}`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * Thin fetch wrapper around the /api/orders endpoints. Parameterized by base
 * URL and an optional owner token, mirroring createTablesApi/createMenuApi --
 * though in practice both callers (Server order taking, Kitchen Display) are
 * unauthenticated by design.
 */
export function createOrdersApi(options: OrdersApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async list(status?: OrderStatus): Promise<Order[]> {
      const path = status === undefined ? '/api/orders' : `/api/orders?status=${status}`
      const response = await fetch(url(path), { headers: buildHeaders(token, false) })
      return handleResponse<Order[]>(response)
    },

    async create(order: NewOrder): Promise<Order> {
      const response = await fetch(url('/api/orders'), {
        method: 'POST',
        headers: buildHeaders(token, true),
        body: JSON.stringify(order),
      })
      return handleResponse<Order>(response)
    },

    async markReady(id: number): Promise<Order> {
      const response = await fetch(url(`/api/orders/${id}/ready`), {
        method: 'PATCH',
        headers: buildHeaders(token, false),
      })
      return handleResponse<Order>(response)
    },

    /**
     * Cashier checks an order out: confirms a payment method was received.
     * Requires a Cashier bearer token (C-7). The backend response merges
     * `print_status` into the order's own fields rather than nesting it, so
     * this splits that flat shape back into `{ order, print_status }` for
     * callers.
     */
    async checkout(id: number, paymentMethod: PaymentMethod): Promise<CheckoutResult> {
      const response = await fetch(url(`/api/orders/${id}/checkout`), {
        method: 'PATCH',
        headers: buildHeaders(token, true),
        body: JSON.stringify({ payment_method: paymentMethod }),
      })
      const { print_status, ...order } = await handleResponse<Order & { print_status: PrintStatus }>(response)
      return { order: order as Order, print_status }
    },

    /** Cashier cancels an order. Requires a Cashier bearer token (C-7). */
    async cancel(id: number): Promise<Order> {
      const response = await fetch(url(`/api/orders/${id}/cancel`), {
        method: 'POST',
        headers: buildHeaders(token, false),
      })
      return handleResponse<Order>(response)
    },
  }
}

export type OrdersApi = ReturnType<typeof createOrdersApi>
