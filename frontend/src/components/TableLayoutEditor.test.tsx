import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableLayoutEditor } from './TableLayoutEditor'
import type { Table } from '../types/table'

const BASE_URL = 'http://api.test'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

function makeTable(overrides: Partial<Table> & Pick<Table, 'id'>): Table {
  return {
    label: `Table ${overrides.id}`,
    shape: 'round',
    capacity: 4,
    zone: null,
    is_occupied: false,
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    ...overrides,
  }
}

const availableTable = makeTable({ id: 1, label: 'Patio 1', shape: 'round', capacity: 4, zone: 'Patio' })
const occupiedTable = makeTable({
  id: 2,
  label: 'Bar 2',
  shape: 'square',
  capacity: 2,
  zone: 'Bar',
  is_occupied: true,
})
const unassignedTable = makeTable({ id: 3, label: 'Table 3', shape: 'rectangular', capacity: 6, zone: null })

describe('TableLayoutEditor', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and displays tables from the API on mount, under the Tables heading', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable, occupiedTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    expect(await screen.findByRole('heading', { level: 2, name: 'Tables' })).toBeInTheDocument()
    expect(screen.getByText('Patio 1')).toBeInTheDocument()
    expect(screen.getByText('Bar 2')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/tables`, expect.anything())
  })

  it('shows a stat row summarizing table count, seat count, and occupied count', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable, occupiedTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Patio 1')

    const stats = within(screen.getByTestId('table-stats'))
    expect(stats.getByText('Tables')).toBeInTheDocument()
    expect(stats.getByText('2')).toBeInTheDocument() // 2 tables
    expect(stats.getByText('6')).toBeInTheDocument() // 4 + 2 seats
    expect(stats.getByText('Seats')).toBeInTheDocument()
    expect(stats.getByText('Occupied')).toBeInTheDocument()
    expect(stats.getByText('1')).toBeInTheDocument() // 1 occupied
  })

  describe('zone grouping', () => {
    it('groups tables under a heading for their zone', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable, occupiedTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

      await screen.findByText('Patio 1')

      expect(screen.getByRole('heading', { level: 4, name: 'Patio' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Bar' })).toBeInTheDocument()
    })

    it('groups tables with no zone under an Unassigned heading', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([unassignedTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

      await screen.findByText('Table 3')

      expect(screen.getByRole('heading', { level: 4, name: 'Unassigned' })).toBeInTheDocument()
    })
  })

  describe('card color-coding', () => {
    it('marks an available table (no open order) with the available card class', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

      const card = await screen.findByTestId('table-card-1')
      expect(card).toHaveClass('table-layout-editor__card--available')
      expect(card).not.toHaveClass('table-layout-editor__card--occupied')
    })

    it('marks an occupied table (open order) with the occupied card class', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([occupiedTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

      const card = await screen.findByTestId('table-card-2')
      expect(card).toHaveClass('table-layout-editor__card--occupied')
      expect(card).not.toHaveClass('table-layout-editor__card--available')
    })

    it('renders available and occupied cards with different background colors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable, occupiedTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

      const availableCard = await screen.findByTestId('table-card-1')
      const occupiedCard = await screen.findByTestId('table-card-2')

      expect(availableCard.style.background).not.toBe('')
      expect(occupiedCard.style.background).not.toBe('')
      expect(availableCard.style.background).not.toBe(occupiedCard.style.background)
    })
  })

  it('does not render owner controls when no auth token is provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Patio 1')

    expect(screen.queryByRole('button', { name: /add table/i })).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByTestId('table-card-1'))
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^duplicate$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument()
  })

  it('lets the owner add a table with a zone, calling the create endpoint and rendering the result', async () => {
    const user = userEvent.setup()
    const createdTable = makeTable({ id: 3, label: 'New Table', shape: 'rectangular', capacity: 6, zone: 'Patio' })

    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(createdTable, { status: 201 }))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))

    await user.type(screen.getByLabelText(/label/i), 'New Table')
    await user.click(screen.getByLabelText(/shape/i))
    await user.click(await screen.findByTitle('Rectangular'))
    await user.clear(screen.getByLabelText(/capacity/i))
    await user.type(screen.getByLabelText(/capacity/i), '6')
    await user.type(screen.getByLabelText(/zone/i), 'Patio')
    await user.click(screen.getByRole('button', { name: /add table/i }))

    expect(await screen.findByText('New Table')).toBeInTheDocument()

    const [, createInit] = vi.mocked(fetch).mock.calls[1]
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe(`${BASE_URL}/api/tables`)
    expect(JSON.parse(createInit!.body as string)).toMatchObject({
      label: 'New Table',
      shape: 'rectangular',
      capacity: 6,
      zone: 'Patio',
    })
  })

  describe('detail panel', () => {
    it('shows shape, seats, zone, and a server placeholder when a card is selected', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([availableTable]))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

      await user.click(await screen.findByTestId('table-card-1'))

      const panel = await screen.findByTestId('table-detail-panel')
      expect(within(panel).getByText('Round')).toBeInTheDocument()
      expect(within(panel).getByText('4')).toBeInTheDocument()
      expect(within(panel).getByText('Patio')).toBeInTheDocument()
      expect(within(panel).getByText('--')).toBeInTheDocument()
    })

    it('lets the owner edit a table, calling the update endpoint and reflecting the result', async () => {
      const user = userEvent.setup()
      const updated = { ...availableTable, label: 'Patio 1 Renamed', zone: 'Deck' }

      vi.mocked(fetch)
        .mockResolvedValueOnce(jsonResponse([availableTable]))
        .mockResolvedValueOnce(jsonResponse(updated))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

      await user.click(await screen.findByTestId('table-card-1'))
      await user.click(screen.getByRole('button', { name: /^edit$/i }))

      const dialog = within(await screen.findByRole('dialog'))
      const labelInput = dialog.getByRole('textbox', { name: /^label$/i })
      await user.clear(labelInput)
      await user.type(labelInput, 'Patio 1 Renamed')
      await user.click(dialog.getByRole('button', { name: /^save$/i }))

      await waitFor(() => expect(screen.getByTestId('table-card-1')).toHaveTextContent('Patio 1 Renamed'))
      expect(screen.getByTestId('table-detail-panel')).toHaveTextContent('Patio 1 Renamed')
      expect(within(screen.getByTestId('table-detail-panel')).getByText('Deck')).toBeInTheDocument()

      const [updateUrl, updateInit] = vi.mocked(fetch).mock.calls[1]
      expect(updateUrl).toBe(`${BASE_URL}/api/tables/1`)
      expect(updateInit).toMatchObject({ method: 'PATCH' })
      expect(JSON.parse(updateInit!.body as string)).toMatchObject({ label: 'Patio 1 Renamed' })
    })

    it('lets the owner duplicate a table, calling the create endpoint with a distinguishing label', async () => {
      const user = userEvent.setup()
      const duplicated = makeTable({ id: 9, label: 'Patio 1 (Copy)', zone: 'Patio' })

      vi.mocked(fetch)
        .mockResolvedValueOnce(jsonResponse([availableTable]))
        .mockResolvedValueOnce(jsonResponse(duplicated, { status: 201 }))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

      await user.click(await screen.findByTestId('table-card-1'))
      await user.click(screen.getByRole('button', { name: /^duplicate$/i }))

      expect(await screen.findByText('Patio 1 (Copy)')).toBeInTheDocument()

      const [createUrl, createInit] = vi.mocked(fetch).mock.calls[1]
      expect(createUrl).toBe(`${BASE_URL}/api/tables`)
      const body = JSON.parse(createInit!.body as string)
      expect(body.label).toContain('Patio 1')
      expect(body.label).not.toBe('Patio 1')
    })

    it('lets the owner remove a table after confirming, calling the delete endpoint', async () => {
      const user = userEvent.setup()
      vi.mocked(fetch)
        .mockResolvedValueOnce(jsonResponse([availableTable]))
        .mockResolvedValueOnce(new Response(null, { status: 204 }))

      render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

      await user.click(await screen.findByTestId('table-card-1'))
      await user.click(screen.getByRole('button', { name: /^remove$/i }))
      await user.click(await screen.findByRole('button', { name: /yes, remove/i }))

      await waitFor(() => expect(screen.queryByText('Patio 1')).not.toBeInTheDocument())

      const [deleteUrl, deleteInit] = vi.mocked(fetch).mock.calls[1]
      expect(deleteUrl).toBe(`${BASE_URL}/api/tables/1`)
      expect(deleteInit).toMatchObject({ method: 'DELETE' })
      expect(screen.queryByTestId('table-detail-panel')).not.toBeInTheDocument()
    })
  })

  it('surfaces an error message when the initial fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('boom', { status: 500 }))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/500/)
  })
})
