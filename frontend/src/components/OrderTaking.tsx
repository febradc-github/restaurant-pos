import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
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
      <h2>Take Order</h2>

      {error && (
        <p className="order-taking__error" role="alert">
          {error}
        </p>
      )}
      {confirmation && (
        <p className="order-taking__confirmation" role="status">
          {confirmation}
        </p>
      )}

      {tables === null || menuItems === null ? (
        <p>Loading…</p>
      ) : (
        <form className="order-taking__form" onSubmit={handleSubmit}>
          <label>
            Table
            <select value={selectedTableId} onChange={(event) => setSelectedTableId(event.target.value)}>
              <option value="" disabled>
                Select a table
              </option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.label}
                </option>
              ))}
            </select>
          </label>

          <ul className="order-taking__items">
            {availableItems.map((item) => (
              <li key={item.id} className="order-taking__item" data-testid={`menu-item-${item.id}`}>
                <span className="order-taking__item-name">{item.name}</span>
                <span className="order-taking__item-price">{item.price}</span>
                <input
                  type="number"
                  min={0}
                  aria-label={`${item.name} quantity`}
                  value={quantities[item.id] ?? 0}
                  onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                />
              </li>
            ))}
          </ul>

          <button type="submit" disabled={submitting}>
            Place order
          </button>
        </form>
      )}
    </div>
  )
}

export default OrderTaking
