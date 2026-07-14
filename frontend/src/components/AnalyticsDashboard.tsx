import { useEffect, useMemo, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { Alert, Button, Card, DatePicker, InputNumber, Space, Table, Tag } from 'antd'
import { CheckCircleOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { createAnalyticsApi } from '../api/analytics'
import { createRestockApi } from '../api/restock'
import { createTimeEntriesApi } from '../api/timeEntries'
import type { MenuItemMetric, SalesMetric } from '../types/analytics'
import type { RestockItem } from '../types/restock'
import type { TimeEntry } from '../types/timeEntry'
import { SalesTrendChart } from './SalesTrendChart'
import { aggregateAttendance } from './attendanceAggregation'
import type { AttendanceRow } from './attendanceAggregation'
import './AnalyticsDashboard.css'

export interface AnalyticsDashboardProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * Owner bearer token. When absent, the screen renders read-only: no
   * threshold-override control. Real enforcement happens server-side (every
   * endpoint this screen calls is auth:sanctum + role:owner) -- this only
   * gates the UI, same as EmployeeManager/MenuManager.
   */
  authToken?: string | null
}

const { RangePicker } = DatePicker

/** The shared date-range presets offered above the sales/sellers/attendance views. */
const RANGE_PRESETS: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'Last 7 days', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: 'Last 30 days', value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] },
  { label: 'Last 90 days', value: [dayjs().subtract(89, 'day').startOf('day'), dayjs().endOf('day')] },
]

const DEFAULT_RANGE: [Dayjs, Dayjs] = RANGE_PRESETS[2].value

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/** Displays a fixed-2-decimal revenue string with a currency prefix -- no Number() parse needed, it's already fixed-point. */
function formatRevenue(revenue: string): string {
  return `$${revenue}`
}

/**
 * Owner-facing analytics dashboard (C-26), the final story of epic C-23.
 * Consumes three already-merged read APIs -- analytics/sales,
 * analytics/menu-items (C-24), and inventory-items/restock (C-25) -- plus
 * the existing C-13 time-entries endpoint. No other data source feeds this
 * screen.
 *
 * Sales, best/worst sellers, and attendance share one date-range filter and
 * refetch together when it changes. Inventory restock is not date-scoped
 * (it's always "right now") and fetches once on mount, independent of the
 * shared filter -- mirrors this screen's own single responsibility split
 * more than any one prior Owner section, but the fetch-on-mount,
 * cancelled-flag, Alert-surfaced-error shape follows
 * EmployeeManager/MenuManager throughout.
 */
export function AnalyticsDashboard({ apiBaseUrl, authToken = null }: AnalyticsDashboardProps) {
  const isOwner = Boolean(authToken)
  const analyticsApi = useMemo(() => createAnalyticsApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])
  const restockApi = useMemo(() => createRestockApi({ baseUrl: apiBaseUrl, token: authToken }), [apiBaseUrl, authToken])
  const timeEntriesApi = useMemo(
    () => createTimeEntriesApi({ baseUrl: apiBaseUrl, token: authToken }),
    [apiBaseUrl, authToken],
  )

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(DEFAULT_RANGE)
  const from = dateRange[0].format('YYYY-MM-DD')
  const to = dateRange[1].format('YYYY-MM-DD')

  const [sales, setSales] = useState<SalesMetric[] | null>(null)
  const [menuItemMetrics, setMenuItemMetrics] = useState<MenuItemMetric[] | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [restockItems, setRestockItems] = useState<RestockItem[] | null>(null)
  const [restockError, setRestockError] = useState<string | null>(null)
  const [editingRestockId, setEditingRestockId] = useState<number | null>(null)
  const [editThreshold, setEditThreshold] = useState<number | null>(null)

  // Sales, best/worst sellers, and attendance are date-scoped and share the
  // one filter above -- they refetch together whenever from/to changes.
  useEffect(() => {
    let cancelled = false
    setError(null)
    Promise.all([analyticsApi.sales(from, to), analyticsApi.menuItems(from, to), timeEntriesApi.list({ from, to })])
      .then(([salesResult, menuItemsResult, timeEntriesResult]) => {
        if (cancelled) return
        setSales(salesResult)
        setMenuItemMetrics(menuItemsResult)
        setTimeEntries(timeEntriesResult)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Failed to load analytics'))
      })
    return () => {
      cancelled = true
    }
  }, [analyticsApi, timeEntriesApi, from, to])

  // Restock is always "right now" -- it fetches once on mount (or when the
  // owner-gated API client itself changes) and deliberately does not depend
  // on the shared date range.
  useEffect(() => {
    let cancelled = false
    setRestockError(null)
    restockApi
      .list()
      .then((items) => {
        if (!cancelled) setRestockItems(items)
      })
      .catch((err: unknown) => {
        if (!cancelled) setRestockError(errorMessage(err, 'Failed to load restock data'))
      })
    return () => {
      cancelled = true
    }
  }, [restockApi])

  function startEditRestock(item: RestockItem) {
    setRestockError(null)
    setEditingRestockId(item.id)
    setEditThreshold(item.threshold)
  }

  async function handleSaveRestockThreshold(id: number) {
    if (editThreshold === null) return
    try {
      const updated = await restockApi.updateThreshold(id, editThreshold)
      // The PATCH response is the base InventoryItem shape only -- it has no
      // suggested_threshold/shortfall. Merge into the existing row instead
      // of replacing it, or those two fields vanish until the next refetch.
      setRestockItems((prev) => (prev ?? []).map((item) => (item.id === id ? { ...item, ...updated } : item)))
      setEditingRestockId(null)
    } catch (err) {
      setRestockError(errorMessage(err, 'Failed to update threshold'))
    }
  }

  const attendanceRows = useMemo(() => aggregateAttendance(timeEntries ?? []), [timeEntries])

  const salesColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Revenue', key: 'revenue', render: (_: unknown, row: SalesMetric) => formatRevenue(row.revenue) },
  ]

  const menuItemColumns = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    {
      title: 'Quantity sold',
      dataIndex: 'quantity_sold',
      key: 'quantity_sold',
      sorter: (a: MenuItemMetric, b: MenuItemMetric) => a.quantity_sold - b.quantity_sold,
    },
    {
      title: 'Revenue',
      key: 'revenue',
      sorter: (a: MenuItemMetric, b: MenuItemMetric) => Number(a.revenue) - Number(b.revenue),
      defaultSortOrder: 'descend' as const,
      render: (_: unknown, row: MenuItemMetric) => formatRevenue(row.revenue),
    },
  ]

  const attendanceColumns = [
    { title: 'Employee', key: 'employee', render: (_: unknown, row: AttendanceRow) => `User #${row.user_id}` },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Total hours',
      key: 'totalHours',
      render: (_: unknown, row: AttendanceRow) => (
        <Space>
          <span>{row.totalHours.toFixed(2)}</span>
          {row.openEntryCount > 0 && (
            <Tag color="processing">
              {row.openEntryCount} {row.openEntryCount === 1 ? 'entry' : 'entries'} in progress
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Auto-closed',
      key: 'autoClosed',
      render: (_: unknown, row: AttendanceRow) =>
        row.autoClosedCount > 0 ? (
          <Tag color="warning" icon={<WarningOutlined />}>
            {row.autoClosedCount} auto-closed
          </Tag>
        ) : (
          <Tag color="default">None</Tag>
        ),
    },
  ]

  const restockColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Threshold',
      key: 'threshold',
      render: (_: unknown, item: RestockItem) =>
        editingRestockId === item.id ? (
          <InputNumber
            aria-label={`Threshold for ${item.name}`}
            min={0}
            value={editThreshold ?? undefined}
            onChange={(value) => setEditThreshold(typeof value === 'number' ? value : 0)}
          />
        ) : (
          <span>{item.threshold}</span>
        ),
    },
    { title: 'Suggested threshold', dataIndex: 'suggested_threshold', key: 'suggested_threshold' },
    { title: 'Shortfall', dataIndex: 'shortfall', key: 'shortfall' },
    {
      title: 'Status',
      key: 'status',
      render: (_: unknown, item: RestockItem) =>
        item.shortfall > 0 ? (
          <Tag color="warning" icon={<WarningOutlined />}>
            Restock needed
          </Tag>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Stocked
          </Tag>
        ),
    },
    ...(isOwner
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, item: RestockItem) =>
              editingRestockId === item.id ? (
                <Space>
                  <Button size="small" type="primary" onClick={() => handleSaveRestockThreshold(item.id)}>
                    Save
                  </Button>
                  <Button size="small" onClick={() => setEditingRestockId(null)}>
                    Cancel
                  </Button>
                </Space>
              ) : (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  aria-label={`Edit threshold for ${item.name}`}
                  onClick={() => startEditRestock(item)}
                >
                  Edit
                </Button>
              ),
          },
        ]
      : []),
  ]

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>

      {error && <Alert className="analytics-dashboard__error" type="error" message={error} showIcon closable onClose={() => setError(null)} />}

      <Card className="analytics-dashboard__filters">
        <RangePicker
          value={dateRange}
          presets={RANGE_PRESETS}
          allowClear={false}
          onChange={(values) => {
            if (values && values[0] && values[1]) setDateRange([values[0], values[1]])
          }}
        />
      </Card>

      <Card title="Sales" className="analytics-dashboard__section">
        <SalesTrendChart data={sales ?? []} />
        <Table<SalesMetric>
          className="analytics-dashboard__sales-table"
          columns={salesColumns}
          dataSource={sales ?? []}
          rowKey="date"
          loading={sales === null}
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="Best & Worst Sellers" className="analytics-dashboard__section">
        <Table<MenuItemMetric>
          columns={menuItemColumns}
          dataSource={menuItemMetrics ?? []}
          rowKey="menu_item_id"
          loading={menuItemMetrics === null}
          pagination={false}
          onRow={(item) => ({ 'data-testid': `menu-item-metric-${item.menu_item_id}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>

      <Card title="Attendance & Hours" className="analytics-dashboard__section">
        <Table<AttendanceRow>
          columns={attendanceColumns}
          dataSource={attendanceRows}
          rowKey="key"
          loading={timeEntries === null}
          pagination={false}
          onRow={(row) => ({ 'data-testid': `attendance-${row.key}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>

      <Card title="Inventory Restock" className="analytics-dashboard__section">
        {restockError && (
          <Alert
            className="analytics-dashboard__error"
            type="error"
            message={restockError}
            showIcon
            closable
            onClose={() => setRestockError(null)}
          />
        )}
        <Table<RestockItem>
          columns={restockColumns}
          dataSource={restockItems ?? []}
          rowKey="id"
          loading={restockItems === null}
          pagination={false}
          onRow={(item) => ({ 'data-testid': `restock-${item.id}` }) as HTMLAttributes<HTMLElement>}
        />
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
