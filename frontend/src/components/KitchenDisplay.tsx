import { useEffect, useMemo, useState } from 'react'
import { createOrdersApi } from '../api/orders'
import { subscribeToKitchenChannel } from '../realtime/echo'
import type { Order } from '../types/order'
import './KitchenDisplay.css'

export interface KitchenDisplayProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/** Removes any existing copy of `order` from the list, then re-adds it only if still pending. */
function upsertPendingOrder(orders: Order[], order: Order): Order[] {
  const withoutThisOrder = orders.filter((existing) => existing.id !== order.id)
  return order.status === 'pending' ? [...withoutThisOrder, order] : withoutThisOrder
}

/**
 * Kitchen-facing display: no login (Kitchen has none, per the C-6 design).
 * Fetches every currently-pending order on mount -- this doubles as the
 * reconnect-catch-up path, since mounting always re-fetches regardless of
 * whether any WebSocket messages were missed while offline -- then
 * subscribes to the public `kitchen` channel for live updates. No polling:
 * after the initial fetch, the list is driven entirely by order.placed /
 * order.updated broadcasts (plus the local update applied right after a
 * "mark ready" click).
 */
export function KitchenDisplay({ apiBaseUrl }: KitchenDisplayProps) {
  const api = useMemo(() => createOrdersApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    api
      .list('pending')
      .then((fetched) => {
        if (!cancelled) setOrders(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load orders'))
      })
    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    const unsubscribe = subscribeToKitchenChannel({
      onOrderPlaced: (order) => {
        setOrders((prev) => upsertPendingOrder(prev ?? [], order))
      },
      onOrderUpdated: (order) => {
        setOrders((prev) => upsertPendingOrder(prev ?? [], order))
      },
    })
    return unsubscribe
  }, [])

  async function handleMarkReady(order: Order) {
    setError(null)
    try {
      const updated = await api.markReady(order.id)
      setOrders((prev) => upsertPendingOrder(prev ?? [], updated))
    } catch (err) {
      setError(errorMessage(err, 'Failed to mark order ready'))
    }
  }

  return (
    <div className="kitchen-display">
      <h2>Kitchen Display</h2>

      {error && (
        <p className="kitchen-display__error" role="alert">
          {error}
        </p>
      )}

      {orders === null ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <ul className="kitchen-display__list">
          {orders.map((order) => (
            <li key={order.id} className="kitchen-display__order" data-testid={`order-${order.id}`}>
              <h3>{order.table.label}</h3>
              <ul className="kitchen-display__line-items">
                {order.items.map((lineItem) => (
                  <li key={lineItem.id}>
                    {lineItem.quantity}x {lineItem.menu_item.name}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => handleMarkReady(order)}>
                Mark ready
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default KitchenDisplay
