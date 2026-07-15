import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { aggregateAttendance } from './attendanceAggregation'
import type { SalesMetric, MenuItemMetric } from '../types/analytics'
import type { RestockItem, InventoryItem } from '../types/restock'
import type { TimeEntry } from '../types/timeEntry'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const sales: SalesMetric[] = [
  { date: '2026-06-20', revenue: '10.00' },
  { date: '2026-06-21', revenue: '46.50' },
]

const menuItemMetrics: MenuItemMetric[] = [
  { menu_item_id: 3, name: 'Burger', quantity_sold: 3, revenue: '30.00' },
  { menu_item_id: 7, name: 'Fries', quantity_sold: 20, revenue: '15.00' },
]

const timeEntries: TimeEntry[] = [
  { id: 1, user_id: 4, role: 'cashier', clock_in: '2026-06-20T09:00:00Z', clock_out: '2026-06-20T17:00:00Z', auto_closed: false },
  { id: 2, user_id: 4, role: 'cashier', clock_in: '2026-06-21T09:00:00Z', clock_out: null, auto_closed: false },
  { id: 3, user_id: 5, role: 'kitchen', clock_in: '2026-06-20T08:00:00Z', clock_out: '2026-06-20T14:00:00Z', auto_closed: true },
]

const restockItems: RestockItem[] = [
  { id: 1, name: 'Beef Patty', stock: 42, threshold: 20, suggested_threshold: 7, shortfall: 0 },
  { id: 2, name: 'Bun', stock: 3, threshold: 20, suggested_threshold: 15, shortfall: 17 },
]

/** Routes every request AnalyticsDashboard's mount effects might issue. */
function mockAllEndpoints() {
  vi.mocked(fetch).mockImplementation((input) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/analytics/sales')) return Promise.resolve(jsonResponse(sales))
    if (url.includes('/api/analytics/menu-items')) return Promise.resolve(jsonResponse(menuItemMetrics))
    if (url.includes('/api/time-entries')) return Promise.resolve(jsonResponse(timeEntries))
    if (url.includes('/api/inventory-items/restock')) return Promise.resolve(jsonResponse(restockItems))
    throw new Error(`Unexpected fetch to ${url}`)
  })
}

describe('aggregateAttendance', () => {
  it('sums hours per employee/role, skipping still-open entries from the total but counting them', () => {
    const rows = aggregateAttendance(timeEntries)

    const cashier = rows.find((row) => row.user_id === 4 && row.role === 'cashier')
    expect(cashier?.totalHours).toBeCloseTo(8)
    expect(cashier?.openEntryCount).toBe(1)
  })

  it('counts auto-closed entries per employee/role', () => {
    const rows = aggregateAttendance(timeEntries)

    const kitchen = rows.find((row) => row.user_id === 5 && row.role === 'kitchen')
    expect(kitchen?.totalHours).toBeCloseTo(6)
    expect(kitchen?.autoClosedCount).toBe(1)
  })

  it('returns an empty list for no entries', () => {
    expect(aggregateAttendance([])).toEqual([])
  })
})

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the page heading with the antd Typography token, not a bare h2', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const heading = await screen.findByRole('heading', { level: 2, name: 'Analytics Dashboard' })
    expect(heading).toHaveClass('ant-typography')
  })

  it('renders a sales chart populated from the analytics sales endpoint', async () => {
    mockAllEndpoints()

    const { container } = render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    await waitFor(() => expect(container.querySelector('path.sales-trend-chart__line')).toBeInTheDocument())
    expect(screen.getByText('2026-06-21')).toBeInTheDocument()
    expect(screen.getByText('$46.50')).toBeInTheDocument()
  })

  it('shows a best/worst-seller table with both quantity_sold and revenue columns, sorted by revenue descending by default', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const burgerRow = await screen.findByTestId('menu-item-metric-3')
    expect(burgerRow).toHaveTextContent('Burger')
    expect(burgerRow).toHaveTextContent('3')
    expect(burgerRow).toHaveTextContent('$30.00')

    const friesRow = screen.getByTestId('menu-item-metric-7')
    expect(friesRow).toHaveTextContent('20')
    expect(friesRow).toHaveTextContent('$15.00')

    // Default sort is revenue descending -- Burger ($30) should render before Fries ($15).
    const rows = screen.getAllByRole('row')
    const burgerIndex = rows.findIndex((row) => row.textContent?.includes('Burger'))
    const friesIndex = rows.findIndex((row) => row.textContent?.includes('Fries'))
    expect(burgerIndex).toBeLessThan(friesIndex)
  })

  it('re-sorts the best/worst-seller table by quantity sold when that column header is clicked', async () => {
    const user = userEvent.setup()
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('menu-item-metric-3')

    await user.click(screen.getByRole('columnheader', { name: /quantity sold/i }))

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      const burgerIndex = rows.findIndex((row) => row.textContent?.includes('Burger'))
      const friesIndex = rows.findIndex((row) => row.textContent?.includes('Fries'))
      // Ascending by quantity_sold: Burger (3) before Fries (20).
      expect(burgerIndex).toBeLessThan(friesIndex)
    })
  })

  it('renders an attendance table with total hours, a distinct in-progress indicator, and an auto-closed flag', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const cashierRow = await screen.findByTestId('attendance-4-cashier')
    expect(cashierRow).toHaveTextContent('User #4')
    expect(cashierRow).toHaveTextContent('cashier')
    expect(cashierRow).toHaveTextContent('8.00')
    expect(cashierRow).toHaveTextContent(/in progress/i)

    const kitchenRow = screen.getByTestId('attendance-5-kitchen')
    expect(kitchenRow).toHaveTextContent('6.00')
    expect(kitchenRow).toHaveTextContent(/1 auto-closed/i)
  })

  it('renders an inventory restock table with a "Restock needed" indicator for shortfall > 0 and "Stocked" for shortfall = 0', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const stockedRow = await screen.findByTestId('restock-1')
    expect(stockedRow).toHaveTextContent(/stocked/i)
    expect(stockedRow).not.toHaveTextContent(/restock needed/i)

    const needsRestockRow = screen.getByTestId('restock-2')
    expect(needsRestockRow).toHaveTextContent(/restock needed/i)
  })

  it('does not render the threshold-override control when no auth token is provided', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByTestId('restock-1')
    expect(screen.queryByRole('button', { name: /edit threshold/i })).not.toBeInTheDocument()
  })

  it('lets the owner override a threshold, calling PATCH with { threshold } and merging the response so suggested_threshold/shortfall survive', async () => {
    const user = userEvent.setup()
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)
    const bunRow = await screen.findByTestId('restock-2')

    const patchResponse: InventoryItem = { id: 2, name: 'Bun', stock: 3, threshold: 40 }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(patchResponse))

    await user.click(within(bunRow).getByRole('button', { name: /edit threshold for bun/i }))
    const thresholdInput = within(bunRow).getByLabelText(/^threshold for bun$/i)
    await user.clear(thresholdInput)
    await user.type(thresholdInput, '40')
    await user.click(within(bunRow).getByRole('button', { name: /save/i }))

    await waitFor(() => {
      const patchCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(patchCall).toBeDefined()
    })
    const patchCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(patchCall?.[0]).toBe(`${BASE_URL}/api/inventory-items/2/threshold`)
    expect(JSON.parse(patchCall![1]!.body as string)).toEqual({ threshold: 40 })

    await waitFor(() => expect(screen.getByTestId('restock-2')).toHaveTextContent('40'))
    // suggested_threshold (15) and shortfall-derived "Restock needed" status
    // must survive the merge -- the PATCH response itself doesn't carry them.
    expect(screen.getByTestId('restock-2')).toHaveTextContent('15')
  })

  it('fetches sales/menu-items/time-entries with the same default from/to range on mount, and restock with none', async () => {
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)

    await waitFor(() => expect(fetch).toHaveBeenCalled())

    const salesCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('/api/analytics/sales'))
    const menuItemsCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('/api/analytics/menu-items'))
    const timeEntriesCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('/api/time-entries'))
    const restockCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('/api/inventory-items/restock'))

    const salesUrl = new URL(String(salesCall![0]))
    const menuItemsUrl = new URL(String(menuItemsCall![0]))
    const timeEntriesUrl = new URL(String(timeEntriesCall![0]))

    expect(salesUrl.searchParams.get('from')).toBeTruthy()
    expect(salesUrl.searchParams.get('to')).toBeTruthy()
    expect(menuItemsUrl.searchParams.get('from')).toBe(salesUrl.searchParams.get('from'))
    expect(menuItemsUrl.searchParams.get('to')).toBe(salesUrl.searchParams.get('to'))
    expect(timeEntriesUrl.searchParams.get('from')).toBe(salesUrl.searchParams.get('from'))
    expect(timeEntriesUrl.searchParams.get('to')).toBe(salesUrl.searchParams.get('to'))

    expect(String(restockCall![0])).toBe(`${BASE_URL}/api/inventory-items/restock`)
  })

  it('refetches sales/menu-items/time-entries with a new shared from/to when the date range changes, without refetching restock', async () => {
    const user = userEvent.setup()
    mockAllEndpoints()

    render(<AnalyticsDashboard apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('restock-1')

    const restockCallsBefore = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/restock')).length
    const salesCallsBefore = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/analytics/sales')).length

    await user.click(screen.getByPlaceholderText('Start date'))
    await user.click(await screen.findByText('Today'))

    await waitFor(() => {
      const salesCallsAfter = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/analytics/sales')).length
      expect(salesCallsAfter).toBeGreaterThan(salesCallsBefore)
    })

    const restockCallsAfter = vi.mocked(fetch).mock.calls.filter(([url]) => String(url).includes('/restock')).length
    expect(restockCallsAfter).toBe(restockCallsBefore)
  })
})
