import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderTaking } from './OrderTaking'
import type { Table } from '../types/table'
import type { Category, MenuItem } from '../types/menu'
import type { Order } from '../types/order'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const table: Table = {
  id: 1,
  label: 'Table 1',
  shape: 'round',
  capacity: 4,
  zone: 'Main Floor',
  is_occupied: false,
  x: 0,
  y: 0,
  width: 80,
  height: 80,
}
const secondTable: Table = { ...table, id: 2, label: 'Table 2' }

const mains: Category = { id: 1, name: 'Mains' }
const drinks: Category = { id: 2, name: 'Drinks' }

const burger: MenuItem = { id: 1, name: 'Burger', price: '9.99', category_id: 1, available: true }
const soldOutSoup: MenuItem = { id: 2, name: 'Soup', price: '4.99', category_id: 1, available: false }
const soda: MenuItem = { id: 3, name: 'Soda', price: '2.00', category_id: 2, available: true }

/** Stubs the three mount-time fetches (tables, menu items, categories) in that order. */
function mockLoadResponses(
  tables: Table[] = [table],
  menuItems: MenuItem[] = [burger, soldOutSoup, soda],
  categories: Category[] = [mains, drinks],
) {
  vi.mocked(fetch)
    .mockResolvedValueOnce(jsonResponse(tables))
    .mockResolvedValueOnce(jsonResponse(menuItems))
    .mockResolvedValueOnce(jsonResponse(categories))
}

function stubNarrowViewport() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

describe('OrderTaking', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches tables, menu items, and categories on mount, showing only available items and no auth header', async () => {
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)

    expect(await screen.findByText('Burger')).toBeInTheDocument()
    expect(screen.queryByText('Soup')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(3)

    for (const [, init] of vi.mocked(fetch).mock.calls) {
      expect(init).toEqual(
        expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
      )
    }
  })

  it('groups the menu into category sections with headers', async () => {
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    const mainsSection = screen.getByTestId('category-section-1')
    expect(within(mainsSection).getByRole('heading', { name: 'Mains' })).toBeInTheDocument()
    expect(within(mainsSection).getByText('Burger')).toBeInTheDocument()
    expect(within(mainsSection).queryByText('Soda')).not.toBeInTheDocument()

    const drinksSection = screen.getByTestId('category-section-2')
    expect(within(drinksSection).getByRole('heading', { name: 'Drinks' })).toBeInTheDocument()
    expect(within(drinksSection).getByText('Soda')).toBeInTheDocument()
  })

  it('narrows visible items with the category filter chips', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')
    expect(screen.getByText('Soda')).toBeInTheDocument()

    // antd's Radio.Button hides the native input and relies on label-click
    // delegation (same pattern already used for Checkout's payment chips).
    await user.click(within(screen.getByTestId('category-chips')).getByText('Mains'))

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.queryByText('Soda')).not.toBeInTheDocument()
    expect(screen.queryByTestId('category-section-2')).not.toBeInTheDocument()

    await user.click(within(screen.getByTestId('category-chips')).getByText('All'))
    expect(screen.getByText('Soda')).toBeInTheDocument()
  })

  it('narrows visible items with the search box', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.type(screen.getByLabelText(/^search menu$/i), 'Soda')

    expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    expect(screen.getByText('Soda')).toBeInTheDocument()
  })

  it('selects a table via a tappable chip, highlighting it and showing the serving Server’s name', async () => {
    const user = userEvent.setup()
    mockLoadResponses([table, secondTable])

    render(<OrderTaking apiBaseUrl={BASE_URL} serverName="Alex Rivera" />)
    await screen.findByText('Burger')

    expect(screen.queryByText(/served by/i)).not.toBeInTheDocument()

    await user.click(within(screen.getByTestId('table-chips')).getByText('Table 1'))

    expect(within(screen.getByTestId('table-chips')).getByRole('radio', { name: 'Table 1' })).toBeChecked()
    expect(screen.getByTestId('serving-server')).toHaveTextContent('Served by Alex Rivera')
  })

  it('does not show a server tag when no serverName is supplied', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.click(within(screen.getByTestId('table-chips')).getByText('Table 1'))

    expect(screen.queryByTestId('serving-server')).not.toBeInTheDocument()
  })

  it('lets the waiter adjust an item quantity with the +/- controls, adding an accent border once selected', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    const card = screen.getByTestId('menu-item-1')
    expect(card.className).not.toMatch(/item-card--selected/)

    await user.click(within(card).getByRole('button', { name: /increase burger quantity/i }))
    await user.click(within(card).getByRole('button', { name: /increase burger quantity/i }))

    expect(screen.getByLabelText(/^burger quantity$/i)).toHaveValue('2')
    expect(card.className).toMatch(/item-card--selected/)

    await user.click(within(card).getByRole('button', { name: /decrease burger quantity/i }))
    expect(screen.getByLabelText(/^burger quantity$/i)).toHaveValue('1')
    expect(card.className).toMatch(/item-card--selected/)
  })

  it('shows selected items and a running total in the order-summary panel', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    const panel = screen.getByTestId('order-summary-panel')
    expect(within(panel).getByText(/no items selected yet/i)).toBeInTheDocument()

    const burgerCard = screen.getByTestId('menu-item-1')
    await user.click(within(burgerCard).getByRole('button', { name: /increase burger quantity/i }))
    await user.click(within(burgerCard).getByRole('button', { name: /increase burger quantity/i }))

    expect(within(panel).getByText(/2x Burger/i)).toBeInTheDocument()
    expect(within(panel).getByTestId('order-summary-total')).toHaveTextContent('Total: ₱19.98')
  })

  it('submits a new order with the selected table, item quantities, and a copied kitchen note on every line item, then confirms and resets', async () => {
    const user = userEvent.setup()
    const createdOrder: Order = {
      id: 5,
      table_id: 1,
      status: 'pending',
      created_at: '2026-07-16T12:00:00Z',
      table,
      items: [{ id: 1, order_id: 5, menu_item_id: 1, quantity: 2, notes: 'No onions', menu_item: burger }],
    }

    mockLoadResponses()
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(createdOrder, { status: 201 }))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.click(within(screen.getByTestId('table-chips')).getByText('Table 1'))
    await user.clear(screen.getByLabelText(/^burger quantity$/i))
    await user.type(screen.getByLabelText(/^burger quantity$/i), '2')
    await user.type(screen.getByLabelText(/^kitchen notes$/i), 'No onions')
    await user.click(screen.getByRole('button', { name: /send to kitchen/i }))

    const confirmation = await screen.findByRole('status')
    expect(confirmation).toHaveTextContent(/order #5/i)
    expect(confirmation.className).toMatch(/ant-alert-success/)

    const [url, init] = vi.mocked(fetch).mock.calls[3]
    expect(url).toBe(`${BASE_URL}/api/orders`)
    expect(init).toMatchObject({ method: 'POST' })
    expect(JSON.parse(init!.body as string)).toEqual({
      table_id: 1,
      items: [{ menu_item_id: 1, quantity: 2, notes: 'No onions' }],
    })

    // Form reset: no table chip remains checked, and the notes field clears.
    expect(within(screen.getByTestId('table-chips')).getByRole('radio', { name: 'Table 1' })).not.toBeChecked()
    expect(screen.getByLabelText(/^kitchen notes$/i)).toHaveValue('')
  })

  it('submits without a notes field when no kitchen note was entered', async () => {
    const user = userEvent.setup()
    const createdOrder: Order = {
      id: 6,
      table_id: 1,
      status: 'pending',
      created_at: '2026-07-16T12:00:00Z',
      table,
      items: [{ id: 1, order_id: 6, menu_item_id: 1, quantity: 1, notes: null, menu_item: burger }],
    }

    mockLoadResponses()
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(createdOrder, { status: 201 }))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.click(within(screen.getByTestId('table-chips')).getByText('Table 1'))
    await user.click(within(screen.getByTestId('menu-item-1')).getByRole('button', { name: /increase burger quantity/i }))
    await user.click(screen.getByRole('button', { name: /send to kitchen/i }))

    await screen.findByRole('status')

    const [, init] = vi.mocked(fetch).mock.calls[3]
    expect(JSON.parse(init!.body as string)).toEqual({
      table_id: 1,
      items: [{ menu_item_id: 1, quantity: 1 }],
    })
  })

  it('shows an error and does not submit when no table or items are selected', async () => {
    const user = userEvent.setup()
    mockLoadResponses()

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.click(screen.getByRole('button', { name: /send to kitchen/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/select a table/i)
    expect(alert.className).toMatch(/ant-alert-error/)
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  describe('responsive order-summary collapse (tablet breakpoint, C-39)', () => {
    it('shows the persistent summary panel (not the bottom bar) at desktop width', async () => {
      mockLoadResponses()

      render(<OrderTaking apiBaseUrl={BASE_URL} />)
      await screen.findByText('Burger')

      expect(screen.getByTestId('order-summary-panel')).toBeInTheDocument()
      expect(screen.queryByTestId('order-summary-bar')).not.toBeInTheDocument()
    })

    it('collapses into a compact bottom bar summarizing item count, total, and Send below the tablet breakpoint', async () => {
      const user = userEvent.setup()
      stubNarrowViewport()
      mockLoadResponses()

      render(<OrderTaking apiBaseUrl={BASE_URL} />)
      await screen.findByText('Burger')

      expect(screen.queryByTestId('order-summary-panel')).not.toBeInTheDocument()
      const bar = screen.getByTestId('order-summary-bar')
      expect(within(bar).getByText('0 items · ₱0.00')).toBeInTheDocument()
      expect(within(bar).getByRole('button', { name: /send to kitchen/i })).toBeInTheDocument()

      const burgerCard = screen.getByTestId('menu-item-1')
      await user.click(within(burgerCard).getByRole('button', { name: /increase burger quantity/i }))

      expect(within(bar).getByText('1 item · ₱9.99')).toBeInTheDocument()
    })

    it('expands the bottom bar into the full summary panel on tap, and back on Close', async () => {
      const user = userEvent.setup()
      stubNarrowViewport()
      mockLoadResponses()

      render(<OrderTaking apiBaseUrl={BASE_URL} />)
      await screen.findByText('Burger')

      await user.click(screen.getByTestId('order-summary-bar-toggle'))

      const panel = screen.getByTestId('order-summary-panel')
      expect(within(panel).getByLabelText(/^kitchen notes$/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(screen.queryByTestId('order-summary-panel')).not.toBeInTheDocument()
    })
  })
})
