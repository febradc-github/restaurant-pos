import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, Input, InputNumber, Radio, Space, Tag, Typography, theme as antdTheme } from 'antd'
import { MinusOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { createTablesApi } from '../api/tables'
import { createMenuApi } from '../api/menu'
import { createOrdersApi } from '../api/orders'
import type { Table } from '../types/table'
import type { Category, MenuItem } from '../types/menu'
import { formatCurrency } from '../utils/currency'
import './OrderTaking.css'

export interface OrderTakingProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * The logged-in Server's name (C-39), shown beside the selected table
   * chip. Display-only -- OrderTaking's API calls stay unauthenticated
   * regardless of whether this is supplied.
   */
  serverName?: string
}

type CategoryFilter = 'all' | number

/**
 * Below this width the persistent order-summary panel collapses into a
 * compact bottom bar (C-39). Matches the tablet breakpoint antd's
 * Layout.Sider uses for its own "lg" breakpoint (see OwnerPage's `broken`
 * state, C-37) so this screen and the Owner console agree on what "tablet
 * width" means.
 */
const NARROW_VIEWPORT_QUERY = '(max-width: 991.98px)'

/**
 * Tracks whether the viewport is currently narrower than the tablet
 * breakpoint, via `matchMedia` rather than a CSS media query -- jsdom
 * doesn't apply real CSS (see the C-36 brain note), so the responsive
 * collapse below needs a JS-observable signal to be unit-testable, the same
 * way OwnerPage's Sider breakpoint is tested by stubbing `matchMedia`.
 */
function useIsNarrowViewport(): boolean {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(NARROW_VIEWPORT_QUERY).matches
      : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQueryList = window.matchMedia(NARROW_VIEWPORT_QUERY)
    setIsNarrow(mediaQueryList.matches)
    const listener = (event: MediaQueryListEvent) => setIsNarrow(event.matches)
    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [])

  return isNarrow
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Server-facing order taking screen: no login for the order-taking API
 * calls themselves (Server's screen access is gated, but the requests it
 * makes have never carried a token -- see App.tsx). Fetches tables, menu
 * items, and categories on mount, lets the Server pick a table, browse the
 * menu by category, adjust quantities, and submit the order with an
 * optional kitchen note.
 *
 * Redesign (C-39): table selection and category filtering are both tappable
 * chip rows (antd Radio.Group, `optionType="button"`) instead of a
 * dropdown, matching the touch-first, one-tap-per-action goal of this
 * tableside screen. The menu is grouped into category sections with
 * headers, narrowed by a search box and the category chips. Item cards are
 * compact -- name, price, and the +/- stepper stacked together rather than
 * spread across a wide row -- and gain a `colorPrimary` border once their
 * quantity is above zero, so a glance at the grid shows what's in the
 * order. A persistent right-hand summary panel lists selected items, a
 * running total, a kitchen-notes textarea, and the "Send to kitchen"
 * submit action; below the tablet breakpoint it collapses into a compact
 * bottom bar (item count, total, Send) that expands back to the full panel
 * on tap.
 *
 * Kitchen notes (C-39): `order_items` gained a real, persisted `notes`
 * column (backend), but this screen models it as a single order-level
 * textarea rather than one note field per menu item -- simpler for a
 * waiter to fill in once ("no onions, allergic to peanuts") than hunting
 * down which specific line it applies to. That shared text is copied onto
 * every submitted line item's `notes` field on send, so it still
 * round-trips through the real per-item column the backend persists.
 *
 * Guest count is deliberately not shown anywhere on this screen: no backing
 * field exists yet (see DS-39), and this pass doesn't invent one or fake a
 * placeholder number.
 */
export function OrderTaking({ apiBaseUrl, serverName }: OrderTakingProps) {
  const tablesApi = useMemo(() => createTablesApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const menuApi = useMemo(() => createMenuApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const ordersApi = useMemo(() => createOrdersApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])
  const { token } = antdTheme.useToken()
  const isNarrow = useIsNarrowViewport()

  const [tables, setTables] = useState<Table[] | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  const [selectedTableId, setSelectedTableId] = useState('')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(null)
    Promise.all([tablesApi.list(), menuApi.menuItems.list(), menuApi.categories.list()])
      .then(([fetchedTables, fetchedMenuItems, fetchedCategories]) => {
        if (cancelled) return
        setTables(fetchedTables)
        setMenuItems(fetchedMenuItems)
        setCategories(fetchedCategories)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load order form'))
      })
    return () => {
      cancelled = true
    }
  }, [tablesApi, menuApi])

  const availableItems = (menuItems ?? []).filter((item) => item.available)
  const searchedItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  )
  const filteredItems =
    categoryFilter === 'all' ? searchedItems : searchedItems.filter((item) => item.category_id === categoryFilter)
  const itemsByCategory = (categories ?? [])
    .map((category) => ({
      category,
      items: filteredItems.filter((item) => item.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0)

  const selectedLines = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([menuItemId, quantity]) => {
      const item = (menuItems ?? []).find((candidate) => candidate.id === Number(menuItemId))
      return item ? { item, quantity } : null
    })
    .filter((line): line is { item: MenuItem; quantity: number } => line !== null)
  const itemCount = selectedLines.reduce((sum, line) => sum + line.quantity, 0)
  const orderTotal = selectedLines.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0)

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
    setNotes('')
    setSummaryExpanded(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setConfirmation(null)

    const trimmedNotes = notes.trim()
    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({
        menu_item_id: Number(menuItemId),
        quantity,
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      }))

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

  const summaryBody = (
    <>
      {selectedLines.length === 0 ? (
        <Typography.Text type="secondary">No items selected yet.</Typography.Text>
      ) : (
        <ul className="order-taking__summary-list">
          {selectedLines.map(({ item, quantity }) => (
            <li key={item.id} className="order-taking__summary-line">
              <span>
                {quantity}x {item.name}
              </span>
              <span>{formatCurrency(Number(item.price) * quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <Typography.Text strong className="order-taking__summary-total" data-testid="order-summary-total">
        Total: {formatCurrency(orderTotal)}
      </Typography.Text>
      <Input.TextArea
        aria-label="Kitchen notes"
        className="order-taking__notes"
        placeholder="Kitchen notes (e.g. allergies, no onions)"
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <Button
        type="primary"
        size="large"
        block
        htmlType="submit"
        loading={submitting}
        disabled={submitting}
        className="order-taking__submit"
      >
        Send to kitchen
      </Button>
    </>
  )

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

      {tables === null || menuItems === null || categories === null ? (
        <Typography.Text>Loading…</Typography.Text>
      ) : (
        <form className="order-taking__layout" onSubmit={handleSubmit}>
          <div className="order-taking__main">
            <section className="order-taking__table-section">
              <Typography.Text strong className="order-taking__section-label">
                Table
              </Typography.Text>
              <div className="order-taking__table-row">
                <Radio.Group
                  aria-label="Table"
                  data-testid="table-chips"
                  buttonStyle="solid"
                  value={selectedTableId || undefined}
                  onChange={(event) => setSelectedTableId(event.target.value as string)}
                >
                  {tables.map((table) => (
                    <Radio.Button key={table.id} value={String(table.id)}>
                      {table.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
                {selectedTableId && serverName && (
                  <Tag className="order-taking__server-tag" data-testid="serving-server">
                    Served by {serverName}
                  </Tag>
                )}
              </div>
            </section>

            <section className="order-taking__menu-section">
              <Space className="order-taking__menu-toolbar" wrap>
                <Input
                  allowClear
                  aria-label="Search menu"
                  placeholder="Search items"
                  prefix={<SearchOutlined />}
                  className="order-taking__search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <Radio.Group
                  aria-label="Category filter"
                  data-testid="category-chips"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                >
                  <Radio.Button value="all">All</Radio.Button>
                  {categories.map((category) => (
                    <Radio.Button key={category.id} value={category.id}>
                      {category.name}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Space>

              {itemsByCategory.length === 0 ? (
                <Typography.Text type="secondary">No items match your search.</Typography.Text>
              ) : (
                itemsByCategory.map(({ category, items }) => (
                  <div
                    key={category.id}
                    className="order-taking__category-section"
                    data-testid={`category-section-${category.id}`}
                  >
                    <Typography.Title level={5} className="order-taking__category-heading">
                      {category.name}
                    </Typography.Title>
                    <div className="order-taking__items-grid">
                      {items.map((item) => {
                        const quantity = quantities[item.id] ?? 0
                        const isSelected = quantity > 0
                        return (
                          <Card
                            key={item.id}
                            size="small"
                            data-testid={`menu-item-${item.id}`}
                            className={`order-taking__item-card${isSelected ? ' order-taking__item-card--selected' : ''}`}
                            style={isSelected ? { borderColor: token.colorPrimary } : undefined}
                          >
                            <div className="order-taking__item-card-info">
                              <Typography.Text strong className="order-taking__item-name">
                                {item.name}
                              </Typography.Text>
                              <Typography.Text type="secondary" className="order-taking__item-price">
                                {formatCurrency(Number(item.price))}
                              </Typography.Text>
                            </div>
                            <Space.Compact className="order-taking__quantity-control">
                              <Button
                                aria-label={`Decrease ${item.name} quantity`}
                                icon={<MinusOutlined />}
                                disabled={quantity <= 0}
                                onClick={() => setQuantity(item.id, quantity - 1)}
                              />
                              <InputNumber
                                aria-label={`${item.name} quantity`}
                                className="order-taking__quantity-input"
                                min={0}
                                value={quantity}
                                onChange={(value) => setQuantity(item.id, Number(value) || 0)}
                              />
                              <Button
                                aria-label={`Increase ${item.name} quantity`}
                                icon={<PlusOutlined />}
                                onClick={() => setQuantity(item.id, quantity + 1)}
                              />
                            </Space.Compact>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          {isNarrow ? (
            <div className="order-taking__summary-mobile">
              {summaryExpanded && (
                <aside
                  className="order-taking__summary order-taking__summary--expanded"
                  data-testid="order-summary-panel"
                >
                  <div className="order-taking__summary-header">
                    <Typography.Title level={4} className="order-taking__summary-title">
                      Order Summary
                    </Typography.Title>
                    <Button type="text" size="small" onClick={() => setSummaryExpanded(false)}>
                      Close
                    </Button>
                  </div>
                  {summaryBody}
                </aside>
              )}
              <div className="order-taking__summary-bar" data-testid="order-summary-bar">
                <button
                  type="button"
                  className="order-taking__summary-bar-toggle"
                  data-testid="order-summary-bar-toggle"
                  aria-label={summaryExpanded ? 'Collapse order summary' : 'Expand order summary'}
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                >
                  {itemCount} item{itemCount === 1 ? '' : 's'} · {formatCurrency(orderTotal)}
                </button>
                {!summaryExpanded && (
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    Send to kitchen
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <aside className="order-taking__summary" data-testid="order-summary-panel">
              <Typography.Title level={4} className="order-taking__summary-title">
                Order Summary
              </Typography.Title>
              {summaryBody}
            </aside>
          )}
        </form>
      )}
    </div>
  )
}

export default OrderTaking
