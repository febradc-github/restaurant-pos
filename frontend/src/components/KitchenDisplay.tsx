import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Row, Tag, Typography } from 'antd'
import { createOrdersApi } from '../api/orders'
import { subscribeToKitchenChannel } from '../realtime/echo'
import { KitchenClockPad } from './KitchenClockPad'
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
 *
 * Also renders the PIN clock-in/out overlay (C-12) as an independent,
 * fixed-position panel -- it owns its own PIN entry/confirmation state and
 * never touches the order list's fetch, WebSocket subscription, or
 * mark-ready logic above.
 *
 * Rebuilt on Ant Design (C-19): this screen is a wall/counter display read
 * from a few feet away in a busy kitchen, the opposite design pressure from
 * a tablet-in-hand screen -- so it favors large type and high-contrast
 * components over density. One large Card per pending order in a responsive
 * grid, a big `Typography.Title` for the table label (not small text), a
 * status Tag, and a full-width `size="large"` Mark ready button.
 *
 * C-33 audit: Mark ready tracks its in-flight order via `markingReadyId`, so
 * only the card actually submitting shows the loading spinner and disables
 * itself -- other pending orders stay fully tappable, since blocking the
 * whole board on one in-flight request would slow down a busy kitchen. No
 * confirmation dialog on Mark ready: unlike Checkout's Cancel or
 * EmployeeManager's Deactivate, it advances an order forward through its
 * normal workflow rather than destroying anything, and a Popconfirm on every
 * tap would fight the at-speed design intent of this screen.
 */
export function KitchenDisplay({ apiBaseUrl }: KitchenDisplayProps) {
  const api = useMemo(() => createOrdersApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [markingReadyId, setMarkingReadyId] = useState<number | null>(null)

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
    setMarkingReadyId(order.id)
    try {
      const updated = await api.markReady(order.id)
      setOrders((prev) => upsertPendingOrder(prev ?? [], updated))
    } catch (err) {
      setError(errorMessage(err, 'Failed to mark order ready'))
    } finally {
      setMarkingReadyId(null)
    }
  }

  return (
    <div className="kitchen-display">
      <Typography.Title level={2}>Kitchen Display</Typography.Title>

      {error && <Alert type="error" showIcon message={error} className="kitchen-display__error" />}

      {orders === null ? (
        <Typography.Text className="kitchen-display__status-text">Loading…</Typography.Text>
      ) : orders.length === 0 ? (
        <Typography.Text className="kitchen-display__status-text">No pending orders.</Typography.Text>
      ) : (
        <Row gutter={[24, 24]}>
          {orders.map((order) => (
            <Col key={order.id} xs={24} sm={12} lg={8}>
              <Card className="kitchen-display__card" data-testid={`order-${order.id}`}>
                <Typography.Title level={3} className="kitchen-display__table-label">
                  {order.table.label}
                </Typography.Title>
                <Tag color="warning" className="kitchen-display__status-tag">
                  Pending
                </Tag>
                <ul className="kitchen-display__line-items">
                  {order.items.map((lineItem) => (
                    <li key={lineItem.id}>
                      {lineItem.quantity}x {lineItem.menu_item.name}
                    </li>
                  ))}
                </ul>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={markingReadyId === order.id}
                  disabled={markingReadyId === order.id}
                  onClick={() => handleMarkReady(order)}
                >
                  Mark ready
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <KitchenClockPad apiBaseUrl={apiBaseUrl} />
    </div>
  )
}

export default KitchenDisplay
