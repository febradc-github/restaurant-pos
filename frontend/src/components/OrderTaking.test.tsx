import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderTaking } from './OrderTaking'
import type { Table } from '../types/table'
import type { MenuItem } from '../types/menu'
import type { Order } from '../types/order'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const table: Table = { id: 1, label: 'Table 1', shape: 'round', capacity: 4, x: 0, y: 0, width: 80, height: 80 }
const burger: MenuItem = { id: 1, name: 'Burger', price: '9.99', category_id: 1, available: true }
const soldOutSoup: MenuItem = { id: 2, name: 'Soup', price: '4.99', category_id: 1, available: false }

/** Selects an antd Select option by opening its dropdown then clicking the option's text. */
async function selectAntOption(user: ReturnType<typeof userEvent.setup>, combobox: HTMLElement, optionText: string) {
  await user.click(combobox)
  const option = await screen.findByTitle(optionText)
  await user.click(option)
}

describe('OrderTaking', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches tables and menu items on mount, showing only available items and no auth header', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([table]))
      .mockResolvedValueOnce(jsonResponse([burger, soldOutSoup]))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)

    expect(await screen.findByText('Burger')).toBeInTheDocument()
    expect(screen.queryByText('Soup')).not.toBeInTheDocument()

    for (const [, init] of vi.mocked(fetch).mock.calls) {
      expect(init).toEqual(
        expect.objectContaining({ headers: expect.not.objectContaining({ Authorization: expect.anything() }) }),
      )
    }
  })

  it('lets the waiter pick a table and adjust an item quantity with the +/- controls', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([table]))
      .mockResolvedValueOnce(jsonResponse([burger]))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await selectAntOption(user, screen.getByLabelText(/^table$/i), 'Table 1')
    expect(within(screen.getByTestId('table-select')).getByText('Table 1')).toBeInTheDocument()

    const row = screen.getByTestId('menu-item-1')
    await user.click(within(row).getByRole('button', { name: /increase burger quantity/i }))
    await user.click(within(row).getByRole('button', { name: /increase burger quantity/i }))

    expect(screen.getByLabelText(/^burger quantity$/i)).toHaveValue('2')

    await user.click(within(row).getByRole('button', { name: /decrease burger quantity/i }))
    expect(screen.getByLabelText(/^burger quantity$/i)).toHaveValue('1')
  })

  it('submits a new order with the selected table and item quantities, then confirms and resets', async () => {
    const user = userEvent.setup()
    const createdOrder: Order = {
      id: 5,
      table_id: 1,
      status: 'pending',
      table,
      items: [{ id: 1, order_id: 5, menu_item_id: 1, quantity: 2, menu_item: burger }],
    }

    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([table]))
      .mockResolvedValueOnce(jsonResponse([burger]))
      .mockResolvedValueOnce(jsonResponse(createdOrder, { status: 201 }))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)

    await screen.findByText('Burger')

    await selectAntOption(user, screen.getByLabelText(/^table$/i), 'Table 1')
    await user.clear(screen.getByLabelText(/^burger quantity$/i))
    await user.type(screen.getByLabelText(/^burger quantity$/i), '2')
    await user.click(screen.getByRole('button', { name: /place order/i }))

    const confirmation = await screen.findByRole('status')
    expect(confirmation).toHaveTextContent(/order #5/i)
    expect(confirmation.className).toMatch(/ant-alert-success/)

    const [url, init] = vi.mocked(fetch).mock.calls[2]
    expect(url).toBe(`${BASE_URL}/api/orders`)
    expect(init).toMatchObject({ method: 'POST' })
    expect(JSON.parse(init!.body as string)).toEqual({
      table_id: 1,
      items: [{ menu_item_id: 1, quantity: 2 }],
    })

    // Form reset: the table select shows its placeholder again, not "Table 1".
    expect(within(screen.getByTestId('table-select')).queryByText('Table 1')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('table-select')).getByText(/select a table/i)).toBeInTheDocument()
  })

  it('shows an error and does not submit when no table or items are selected', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([table]))
      .mockResolvedValueOnce(jsonResponse([burger]))

    render(<OrderTaking apiBaseUrl={BASE_URL} />)
    await screen.findByText('Burger')

    await user.click(screen.getByRole('button', { name: /place order/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/select a table/i)
    expect(alert.className).toMatch(/ant-alert-error/)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
