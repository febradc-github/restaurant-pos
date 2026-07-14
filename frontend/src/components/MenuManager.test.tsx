import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuManager } from './MenuManager'
import type { Category, MenuItem } from '../types/menu'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

const appetizers: Category = { id: 1, name: 'Appetizers' }
const drinks: Category = { id: 2, name: 'Drinks' }

const springRolls: MenuItem = {
  id: 1,
  name: 'Spring Rolls',
  price: '5.99',
  category_id: 1,
  available: true,
}

/** Mocks the initial GET /api/categories + GET /api/menu-items pair fired on mount. */
function mockInitialLoad(categories: Category[], menuItems: MenuItem[]) {
  vi.mocked(fetch).mockImplementation((input) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/categories')) return Promise.resolve(jsonResponse(categories))
    if (url.includes('/api/menu-items')) return Promise.resolve(jsonResponse(menuItems))
    throw new Error(`Unexpected fetch to ${url}`)
  })
}

/** Selects an antd Select option by opening its dropdown then clicking the option's text. */
async function selectAntOption(user: ReturnType<typeof userEvent.setup>, combobox: HTMLElement, optionText: string) {
  await user.click(combobox)
  const option = await screen.findByTitle(optionText)
  await user.click(option)
}

describe('MenuManager', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and displays categories and menu items on mount', async () => {
    mockInitialLoad([appetizers, drinks], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken={null} />)

    expect(await screen.findByTestId('category-1')).toHaveTextContent('Appetizers')
    expect(screen.getByTestId('category-2')).toHaveTextContent('Drinks')
    expect(screen.getByTestId('item-1')).toHaveTextContent('Spring Rolls')
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/categories`, expect.anything())
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/menu-items`, expect.anything())
  })

  it('does not render mutating controls when no auth token is provided', async () => {
    mockInitialLoad([appetizers], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Spring Rolls')

    expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add item/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^delete/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('lets the owner create a category, calling the API and rendering the result', async () => {
    const user = userEvent.setup()
    const created: Category = { id: 3, name: 'Desserts' }
    mockInitialLoad([appetizers], [])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('category-1')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created, { status: 201 }))

    await user.type(screen.getByLabelText(/category name/i), 'Desserts')
    await user.click(screen.getByRole('button', { name: /add category/i }))

    expect(await screen.findByTestId('category-3')).toHaveTextContent('Desserts')
    const createCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'POST')
    expect(createCall?.[0]).toBe(`${BASE_URL}/api/categories`)
    expect(JSON.parse(createCall![1]!.body as string)).toEqual({ name: 'Desserts' })
  })

  it('lets the owner edit and save a category name', async () => {
    const user = userEvent.setup()
    mockInitialLoad([appetizers], [])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('category-1')

    const updated: Category = { id: 1, name: 'Starters' }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    await user.click(screen.getByRole('button', { name: /edit appetizers/i }))
    const nameInput = within(screen.getByTestId('category-1')).getByRole('textbox')
    await user.clear(nameInput)
    await user.type(nameInput, 'Starters')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByTestId('category-1')).toHaveTextContent('Starters')
    const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(updateCall?.[0]).toBe(`${BASE_URL}/api/categories/1`)
    expect(JSON.parse(updateCall![1]!.body as string)).toEqual({ name: 'Starters' })
  })

  it('lets the owner create a menu item with name/price/category, calling the API and rendering the result', async () => {
    const user = userEvent.setup()
    const created: MenuItem = { id: 2, name: 'Soda', price: '2.5', category_id: 2, available: true }
    mockInitialLoad([appetizers, drinks], [])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('category-1')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created, { status: 201 }))

    await user.type(screen.getByLabelText(/^name$/i), 'Soda')
    await user.type(screen.getByLabelText(/^price$/i), '2.50')
    await selectAntOption(user, screen.getByLabelText(/^category$/i), 'Drinks')
    await user.click(screen.getByRole('button', { name: /add item/i }))

    expect(await screen.findByTestId('item-2')).toHaveTextContent('Soda')
    const createCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'POST')
    expect(createCall?.[0]).toBe(`${BASE_URL}/api/menu-items`)
    expect(JSON.parse(createCall![1]!.body as string)).toEqual({
      name: 'Soda',
      price: '2.5',
      category_id: 2,
      available: true,
    })
  })

  it('lets the owner edit and save a menu item, calling the update endpoint', async () => {
    const user = userEvent.setup()
    mockInitialLoad([appetizers, drinks], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByText('Spring Rolls')

    const updated: MenuItem = { id: 1, name: 'Egg Rolls', price: '6.50', category_id: 2, available: true }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))

    await user.click(screen.getByRole('button', { name: /edit spring rolls/i }))
    const row = screen.getByTestId('item-1')
    const nameInput = within(row).getByLabelText(/edit name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Egg Rolls')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByTestId('item-1')).toHaveTextContent('Egg Rolls')
    const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(updateCall?.[0]).toBe(`${BASE_URL}/api/menu-items/1`)
    expect(JSON.parse(updateCall![1]!.body as string)).toEqual({
      name: 'Egg Rolls',
      price: '5.99',
      category_id: 1,
    })
  })

  it('lets the owner toggle availability, calling the update endpoint', async () => {
    const user = userEvent.setup()
    mockInitialLoad([appetizers], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByText('Spring Rolls')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ...springRolls, available: false }))

    await user.click(screen.getByLabelText(/spring rolls available/i))

    await waitFor(() => {
      const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(updateCall).toBeDefined()
    })
    const updateCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(updateCall?.[0]).toBe(`${BASE_URL}/api/menu-items/1`)
    expect(JSON.parse(updateCall![1]!.body as string)).toEqual({ available: false })
  })

  it('lets the owner delete a menu item, calling the delete endpoint and removing it', async () => {
    const user = userEvent.setup()
    mockInitialLoad([appetizers], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByText('Spring Rolls')

    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await user.click(screen.getByRole('button', { name: /delete spring rolls/i }))

    await waitFor(() => expect(screen.queryByText('Spring Rolls')).not.toBeInTheDocument())

    const deleteCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'DELETE')
    expect(deleteCall?.[0]).toBe(`${BASE_URL}/api/menu-items/1`)
  })

  it('surfaces a 409 error when deleting a category that still has menu items, without crashing', async () => {
    const user = userEvent.setup()
    mockInitialLoad([appetizers], [springRolls])

    render(<MenuManager apiBaseUrl={BASE_URL} authToken="owner-token" />)
    await screen.findByTestId('category-1')

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Cannot delete a category that still has menu items assigned to it.', { status: 409 }),
    )

    await user.click(screen.getByRole('button', { name: /delete appetizers/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/appetizers/i)
    // The category must still be present -- the delete was rejected, not applied.
    expect(screen.getByTestId('category-1')).toBeInTheDocument()
  })
})
