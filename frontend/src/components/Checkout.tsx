import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Popconfirm, Radio, Row, Space, Tag, Typography } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { createOrdersApi } from '../api/orders'
import type { Order } from '../types/order'
import type { PaymentMethod, PrintStatus } from '../types/checkout'
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

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

function orderTotal(order: Order): string {
  const total = order.items.reduce((sum, item) => sum + item.quantity * Number(item.menu_item.price), 0)
  return total.toFixed(2)
}

/**
 * Cashier-facing checkout screen: fetches every order on mount and narrows
 * it to the "open" ones (pending or ready -- not yet paid or cancelled),
 * lets the Cashier confirm a payment method per order or cancel it outright
 * (C-7). A confirmed payment that failed to print is flagged distinctly
 * from a normal success so the Cashier knows to check the printer.
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

  useEffect(() => {
    if (!isCashier) return
    let cancelled = false
    setError(null)
    api
      .list()
      .then((fetched) => {
        if (!cancelled) setOrders(fetched.filter((order) => OPEN_STATUSES.has(order.status)))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load orders'))
      })
    return () => {
      cancelled = true
    }
  }, [api, isCashier])

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

      {orders === null ? (
        <Typography.Text>Loading…</Typography.Text>
      ) : orders.length === 0 ? (
        <Typography.Text>No open orders.</Typography.Text>
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((order) => {
            const isPaid = order.status === 'paid'
            const printStatus = printStatusByOrderId[order.id]
            const isBusy = pendingOrderId === order.id
            const isConfirming = isBusy && pendingAction === 'confirm'
            const isCancelling = isBusy && pendingAction === 'cancel'
            return (
              <Col key={order.id} xs={24} md={12} lg={8}>
                <Card data-testid={`checkout-order-${order.id}`}>
                  <Typography.Title level={4}>{order.table.label}</Typography.Title>
                  <ul className="checkout__line-items">
                    {order.items.map((lineItem) => (
                      <li key={lineItem.id}>
                        {lineItem.quantity}x {lineItem.menu_item.name}
                      </li>
                    ))}
                  </ul>
                  <Typography.Text strong className="checkout__total">
                    Total: {orderTotal(order)}
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
                        Confirm payment
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
