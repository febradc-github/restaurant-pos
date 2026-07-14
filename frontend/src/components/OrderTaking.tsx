import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, InputNumber, Select, Space, Typography } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { createTablesApi } from '../api/tables'
import { createMenuApi } from '../api/menu'
import { createOrdersApi } from '../api/orders'
import type { Table } from '../types/table'
import type { MenuItem } from '../types/menu'
import './OrderTaking.css'

export interface OrderTakingProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Server-facing order taking screen: no login (Server has none, per the C-6
 * design), so it never sends an auth token. Fetches tables and available
 * menu items on mount, lets the Server pick a table and quantities per menu
 * item, then submits the order and resets the form on success.
 *
 * Rebuilt on Ant Design (C-18): a waiter uses this tableside on a tablet, so
 * speed and large touch targets matter more than density. Table selection
 * -- the first thing the waiter does -- is a searchable Select up top (there
 * could be many tables). Each menu item gets a +/- Button pair flanking an
 * InputNumber for fast, accurate tap-to-adjust quantity, with generous
 * spacing between rows instead of a cramped list.
 */
export function OrderTaking({ apiBaseUrl }: OrderTakingProps) {
  const tablesApi = useMemo(() => createTablesApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const menuApi = useMemo(() => createMenuApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const ordersApi = useMemo(() => createOrdersApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [tables, setTables] = useState<Table[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  const [selectedTableId, setSelectedTableId] = useState('')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(null)
    Promise.all([tablesApi.list(), menuApi.menuItems.list()])
      .then(([fetchedTables, fetchedMenuItems]) => {
        if (cancelled) return
        setTables(fetchedTables)
        setMenuItems(fetchedMenuItems)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load order form'))
      })
    return () => {
      cancelled = true
    }
  }, [tablesApi, menuApi])

  const availableItems = (menuItems ?? []).filter((item) => item.available)
  const tableOptions = (tables ?? []).map((table) => ({ value: String(table.id), label: table.label }))

  function setQuantity(itemId: number, quantity: number) {
    setQuantities((prev) => {
      if (!quantity || quantity <= 0) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: quantity }
    })
  }

  function resetForm() {
    setSelectedTableId('')
    setQuantities({})
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setConfirmation(null)

    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menu_item_id: Number(menuItemId), quantity }))

    if (!selectedTableId || items.length === 0) {
      setError('Select a table and at least one item before placing the order.')
      return
    }

    setSubmitting(true)
    try {
      const order = await ordersApi.create({ table_id: Number(selectedTableId), items })
      setConfirmation(`Order #${order.id} placed for ${order.table.label}.`)
      resetForm()
    } catch (err) {
      setError(errorMessage(err, 'Failed to place order'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="order-taking">
      <Typography.Title level={2}>Take Order</Typography.Title>

      {error && <Alert type="error" showIcon message={error} className="order-taking__error" />}
      {confirmation && (
        <Alert
          type="success"
          showIcon
          role="status"
          message={confirmation}
          className="order-taking__confirmation"
        />
      )}

      {tables === null || menuItems === null ? (
        <Typography.Text>Loading…</Typography.Text>
      ) : (
        <form className="order-taking__form" onSubmit={handleSubmit}>
          <Select
            aria-label="Table"
            data-testid="table-select"
            className="order-taking__table-select"
            size="large"
            showSearch
            placeholder="Select a table"
            value={selectedTableId || undefined}
            onChange={(value) => setSelectedTableId(value)}
            optionFilterProp="label"
            options={tableOptions}
          />

          <Card title="Menu" className="order-taking__menu-card">
            <div className="order-taking__items">
              {availableItems.map((item) => {
                const quantity = quantities[item.id] ?? 0
                return (
                  <div key={item.id} data-testid={`menu-item-${item.id}`} className="order-taking__item">
                    <div className="order-taking__item-info">
                      <Typography.Text strong className="order-taking__item-name">
                        {item.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" className="order-taking__item-price">
                        {item.price}
                      </Typography.Text>
                    </div>
                    <Space.Compact className="order-taking__quantity-control">
                      <Button
                        aria-label={`Decrease ${item.name} quantity`}
                        icon={<MinusOutlined />}
                        size="large"
                        disabled={quantity <= 0}
                        onClick={() => setQuantity(item.id, quantity - 1)}
                      />
                      <InputNumber
                        aria-label={`${item.name} quantity`}
                        className="order-taking__quantity-input"
                        size="large"
                        min={0}
                        value={quantity}
                        onChange={(value) => setQuantity(item.id, Number(value) || 0)}
                      />
                      <Button
                        aria-label={`Increase ${item.name} quantity`}
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setQuantity(item.id, quantity + 1)}
                      />
                    </Space.Compact>
                  </div>
                )
              })}
            </div>
          </Card>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={submitting}
            disabled={submitting}
            className="order-taking__submit"
          >
            Place order
          </Button>
        </form>
      )}
    </div>
  )
}

export default OrderTaking
