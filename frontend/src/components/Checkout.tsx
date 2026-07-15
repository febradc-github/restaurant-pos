import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Input, Popconfirm, Radio, Row, Select, Space, Statistic, Tag, Typography } from 'antd'
import { CheckCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { createOrdersApi } from '../api/orders'
import type { Order } from '../types/order'
import type { PaymentMethod, PrintStatus } from '../types/checkout'
import { formatCurrency } from '../utils/currency'
import {
  LINE_ITEM_PREVIEW_COUNT,
  formatElapsed,
  isToday,
  orderMatchesSearch,
  orderTotalAmount,
  sortOrdersByCreatedAt,
} from './checkoutHelpers'
import type { OrderSortOrder } from './checkoutHelpers'
import './Checkout.css'

export interface CheckoutProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Cashier bearer token. When absent, the screen renders no order list and
   * no actions -- checkout and cancel are real transactions the Cashier is
   * accountable for, so unlike the Owner screens' read-only fallback, there
   * is nothing sensible to show without a Cashier logged in.
   */
  authToken?: string | null
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'qr_ph', label: 'QR Ph' },
  { value: 'gcash', label: 'GCash' },
]

const OPEN_STATUSES = new Set(['pending', 'ready'])

const SORT_OPTIONS: { value: OrderSortOrder; label: string }[] = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'newest', label: 'Newest first' },
]

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Cashier-facing checkout screen: fetches every order on mount, lets the
 * Cashier confirm a payment method per order or cancel it outright (C-7).
 * A confirmed payment that failed to print is flagged distinctly from a
 * normal success so the Cashier knows to check the printer.
 *
 * Rebuilt on Ant Design (C-17): one Card per open order in a responsive
 * grid -- cards scan faster than table rows for a "scan and act" checkout
 * flow, and give the payment buttons room for comfortable touch targets.
 * Confirm is a full-width, large primary button (this is a frontline,
 * time-pressured screen, so it follows the same `size="large"` touch-target
 * convention as OrderTaking/Login); Cancel is deliberately smaller and
 * visually subordinate (destructive-action separation) so it never competes
 * with Confirm.
 *
 * UI audit (C-32): Confirm/Cancel now track a per-order in-flight state so
 * the acting button shows a spinner and both buttons on that order disable
 * while the request is outstanding -- checkout and cancellation are real
 * transactions, so a double-tap must not be able to fire the request twice.
 * Cancel also sits behind a Popconfirm, matching the confirm-before-destroy
 * pattern used for Deactivate in EmployeeManager, since cancelling a live
 * order is destructive and irreversible from this screen.
 *
 * Redesign (C-38): fetches every order (not just open ones) so the
 * shift-summary header can total today's paid orders alongside the open
 * ones; the card grid itself still only ever shows open orders (plus, for
 * continuity, whichever order the Cashier just confirmed payment on this
 * session -- see `visibleOrders` below). Cards now identify orders
 * unambiguously by number (`#id`) since two open orders can share a table
 * label, show elapsed time, a right-aligned price per line item truncated
 * past `LINE_ITEM_PREVIEW_COUNT`, and a total footer the Confirm button's
 * label repeats. A search box and sort control help a Cashier find one
 * order on a busy floor.
 */
export function Checkout({ apiBaseUrl, authToken = null }: CheckoutProps) {
  const isCashier = Boolean(authToken)
  const api = useMemo(() => createOrdersApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<Record<number, PaymentMethod>>({})
  const [printStatusByOrderId, setPrintStatusByOrderId] = useState<Record<number, PrintStatus>>({})
  // Tracks which order (and which of its two actions) is mid-flight, so the
  // Confirm/Cancel buttons can show a spinner and refuse a second tap while
  // the request is in the air -- checkout is a real transaction, not
  // something a double-tap should be able to fire twice.
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<'confirm' | 'cancel' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<OrderSortOrder>('oldest')
  // Orders whose line-item list is expanded past the truncated preview.
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isCashier) return
    let cancelled = false
    setError(null)
    api
      .list()
      .then((fetched) => {
        if (!cancelled) setOrders(fetched)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load orders'))
      })
    return () => {
      cancelled = true
    }
  }, [api, isCashier])

  // True "currently open" orders -- drives the shift-summary header's open
  // count and pending total. Deliberately not the same list the grid
  // renders (see `visibleOrders` below): a just-confirmed order stays
  // pictured in the grid a moment longer than it counts as "open" here.
  const openOrders = useMemo(() => (orders ?? []).filter((order) => OPEN_STATUSES.has(order.status)), [orders])
  const openOrderCount = openOrders.length
  const pendingTotal = useMemo(
    () => openOrders.reduce((sum, order) => sum + orderTotalAmount(order), 0),
    [openOrders],
  )
  const paidTodayTotal = useMemo(
    () =>
      (orders ?? [])
        .filter((order) => order.status === 'paid' && isToday(order.created_at))
        .reduce((sum, order) => sum + orderTotalAmount(order), 0),
    [orders],
  )

  // The grid's actual display list: open orders, plus any order that was
  // just paid this session (so the card doesn't vanish out from under the
  // Cashier the instant checkout succeeds -- it stays to show the Paid tag
  // and print status until the next fetch).
  const visibleOrders = useMemo(
    () => (orders ?? []).filter((order) => OPEN_STATUSES.has(order.status) || order.id in printStatusByOrderId),
    [orders, printStatusByOrderId],
  )
  const searchedOrders = useMemo(
    () => visibleOrders.filter((order) => orderMatchesSearch(order, searchQuery)),
    [visibleOrders, searchQuery],
  )
  const sortedOrders = useMemo(
    () => sortOrdersByCreatedAt(searchedOrders, sortOrder),
    [searchedOrders, sortOrder],
  )

  function toggleExpanded(orderId: number) {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  async function handleConfirmPayment(order: Order) {
    setError(null)
    const method = paymentMethods[order.id] ?? 'cash'
    setPendingOrderId(order.id)
    setPendingAction('confirm')
    try {
      const { order: updated, print_status } = await api.checkout(order.id, method)
      setOrders((prev) => (prev ?? []).map((existing) => (existing.id === updated.id ? updated : existing)))
      setPrintStatusByOrderId((prev) => ({ ...prev, [order.id]: print_status }))
    } catch (err) {
      setError(errorMessage(err, 'Failed to confirm payment'))
    } finally {
      setPendingOrderId(null)
      setPendingAction(null)
    }
  }

  async function handleCancel(order: Order) {
    setError(null)
    setPendingOrderId(order.id)
    setPendingAction('cancel')
    try {
      await api.cancel(order.id)
      setOrders((prev) => (prev ?? []).filter((existing) => existing.id !== order.id))
    } catch (err) {
      setError(errorMessage(err, 'Failed to cancel order'))
    } finally {
      setPendingOrderId(null)
      setPendingAction(null)
    }
  }

  if (!isCashier) {
    return (
      <div className="checkout">
        <Typography.Title level={2}>Checkout</Typography.Title>
        <Typography.Paragraph>Log in as a Cashier to confirm payments or cancel orders.</Typography.Paragraph>
      </div>
    )
  }

  return (
    <div className="checkout">
      <Typography.Title level={2}>Checkout</Typography.Title>

      {error && <Alert type="error" showIcon message={error} className="checkout__error" />}

      <div className="checkout__stats" data-testid="checkout-stats">
        <Card size="small">
          <Statistic title="Open orders" value={openOrderCount} />
        </Card>
        <Card size="small">
          <Statistic title="Pending total" value={formatCurrency(pendingTotal)} />
        </Card>
        <Card size="small">
          <Statistic title="Paid today" value={formatCurrency(paidTodayTotal)} />
        </Card>
      </div>

      <Space className="checkout__toolbar" wrap>
        <Input
          allowClear
          aria-label="Search orders"
          placeholder="Search by table or item"
          prefix={<SearchOutlined />}
          className="checkout__search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Select<OrderSortOrder>
          aria-label="Sort orders"
          className="checkout__sort"
          value={sortOrder}
          onChange={setSortOrder}
          options={SORT_OPTIONS}
        />
      </Space>

      {orders === null ? (
        <Typography.Text>Loading…</Typography.Text>
      ) : visibleOrders.length === 0 ? (
        <Typography.Text>No open orders.</Typography.Text>
      ) : sortedOrders.length === 0 ? (
        <Typography.Text>No orders match your search.</Typography.Text>
      ) : (
        <Row gutter={[16, 16]}>
          {sortedOrders.map((order) => {
            const isPaid = order.status === 'paid'
            const printStatus = printStatusByOrderId[order.id]
            const isBusy = pendingOrderId === order.id
            const isConfirming = isBusy && pendingAction === 'confirm'
            const isCancelling = isBusy && pendingAction === 'cancel'
            const total = orderTotalAmount(order)
            const isExpanded = expandedOrderIds.has(order.id)
            const hasOverflow = order.items.length > LINE_ITEM_PREVIEW_COUNT
            const visibleItems = hasOverflow && !isExpanded ? order.items.slice(0, LINE_ITEM_PREVIEW_COUNT) : order.items
            const hiddenCount = order.items.length - LINE_ITEM_PREVIEW_COUNT
            return (
              <Col key={order.id} xs={24} sm={24} md={12} lg={8}>
                <Card data-testid={`checkout-order-${order.id}`}>
                  <div className="checkout__card-header">
                    <Typography.Title level={4} className="checkout__table-label">
                      {order.table.label}
                    </Typography.Title>
                    <Space size="small" className="checkout__meta">
                      <Typography.Text type="secondary">#{order.id}</Typography.Text>
                      <Typography.Text type="secondary">{formatElapsed(order.created_at)}</Typography.Text>
                    </Space>
                  </div>
                  <ul className="checkout__line-items">
                    {visibleItems.map((lineItem) => (
                      <li key={lineItem.id} className="checkout__line-item">
                        <span className="checkout__line-item-name">
                          {lineItem.quantity}x {lineItem.menu_item.name}
                        </span>
                        <span className="checkout__line-item-price">
                          {formatCurrency(lineItem.quantity * Number(lineItem.menu_item.price))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {hasOverflow && (
                    <Button
                      type="link"
                      size="small"
                      className="checkout__more-items"
                      onClick={() => toggleExpanded(order.id)}
                    >
                      {isExpanded ? 'Show less' : `+${hiddenCount} more items`}
                    </Button>
                  )}
                  <Typography.Text strong className="checkout__total">
                    Total: {formatCurrency(total)}
                  </Typography.Text>

                  {isPaid ? (
                    <Space orientation="vertical" size="small" className="checkout__paid-block">
                      <Tag icon={<CheckCircleOutlined />} color="success" role="status">
                        Paid
                      </Tag>
                      {printStatus === 'failed' && (
                        <Alert
                          type="warning"
                          showIcon
                          message="Payment confirmed, but the receipt failed to print -- check the printer."
                        />
                      )}
                    </Space>
                  ) : (
                    <Space orientation="vertical" size="middle" className="checkout__actions">
                      <Radio.Group
                        aria-label={`Payment method for ${order.table.label}`}
                        optionType="button"
                        size="large"
                        disabled={isBusy}
                        value={paymentMethods[order.id] ?? 'cash'}
                        onChange={(event) =>
                          setPaymentMethods((prev) => ({
                            ...prev,
                            [order.id]: event.target.value as PaymentMethod,
                          }))
                        }
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <Radio.Button key={method.value} value={method.value}>
                            {method.label}
                          </Radio.Button>
                        ))}
                      </Radio.Group>
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={isConfirming}
                        disabled={isBusy}
                        onClick={() => handleConfirmPayment(order)}
                      >
                        {`Confirm payment ${formatCurrency(total)}`}
                      </Button>
                      <Popconfirm
                        title="Cancel this order?"
                        okText="Yes, cancel"
                        cancelText="No"
                        onConfirm={() => handleCancel(order)}
                      >
                        <Button
                          danger
                          type="text"
                          size="small"
                          className="checkout__cancel"
                          loading={isCancelling}
                          disabled={isBusy}
                        >
                          Cancel order
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}

export default Checkout
