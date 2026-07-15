import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

const roundTable: Table = {
  id: 1,
  label: 'Patio 1',
  shape: 'round',
  capacity: 4,
  x: 10,
  y: 20,
  width: 80,
  height: 80,
}

const squareTable: Table = {
  id: 2,
  label: 'Bar 2',
  shape: 'square',
  capacity: 2,
  x: 200,
  y: 40,
  width: 60,
  height: 60,
}

describe('TableLayoutEditor', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and displays tables from the API on mount', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([roundTable, squareTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    expect(await screen.findByText('Patio 1')).toBeInTheDocument()
    expect(screen.getByText('Bar 2')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/tables`, expect.anything())
  })

  it('reflects each table shape via a data-shape attribute', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([roundTable, squareTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Patio 1')

    expect(screen.getByTestId('table-1')).toHaveAttribute('data-shape', 'round')
    expect(screen.getByTestId('table-2')).toHaveAttribute('data-shape', 'square')
  })

  it('does not render owner controls when no auth token is provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([roundTable]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    await screen.findByText('Patio 1')

    expect(screen.queryByRole('button', { name: /add table/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('lets the owner add a table, calling the create endpoint and rendering the result', async () => {
    const user = userEvent.setup()
    const createdTable: Table = {
      id: 3,
      label: 'New Table',
      shape: 'rectangular',
      capacity: 6,
      x: 20,
      y: 20,
      width: 120,
      height: 80,
    }

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
    await user.click(screen.getByRole('button', { name: /add table/i }))

    expect(await screen.findByText('New Table')).toBeInTheDocument()

    const [, createInit] = vi.mocked(fetch).mock.calls[1]
    expect(vi.mocked(fetch).mock.calls[1][0]).toBe(`${BASE_URL}/api/tables`)
    expect(createInit).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer owner-token' }),
    })
    expect(JSON.parse(createInit!.body as string)).toMatchObject({
      label: 'New Table',
      shape: 'rectangular',
      capacity: 6,
    })
  })

  it('lets the owner delete a table, calling the delete endpoint and removing it from the canvas', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([roundTable]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

    await screen.findByText('Patio 1')

    await user.click(screen.getByRole('button', { name: /delete patio 1/i }))

    await waitFor(() => expect(screen.queryByText('Patio 1')).not.toBeInTheDocument())

    const [deleteUrl, deleteInit] = vi.mocked(fetch).mock.calls[1]
    expect(deleteUrl).toBe(`${BASE_URL}/api/tables/1`)
    expect(deleteInit).toMatchObject({ method: 'DELETE' })
  })

  it('lets the owner drag a table, calling the update endpoint with the new coordinates', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse([roundTable]))
      .mockResolvedValueOnce(jsonResponse({ ...roundTable, x: 60, y: 90 }))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken="owner-token" />)

    const tableEl = await screen.findByTestId('table-1')

    tableEl.setPointerCapture = vi.fn()
    tableEl.releasePointerCapture = vi.fn()

    tableEl.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100, pointerId: 1 }),
    )
    window.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, clientX: 150, clientY: 140, pointerId: 1 }),
    )
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 150, clientY: 140, pointerId: 1 }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))

    const [updateUrl, updateInit] = vi.mocked(fetch).mock.calls[1]
    expect(updateUrl).toBe(`${BASE_URL}/api/tables/1`)
    expect(updateInit).toMatchObject({ method: 'PATCH' })
    const body = JSON.parse(updateInit!.body as string)
    // origin (10,20) + delta (50,40) = (60,60)
    expect(body).toEqual({ x: 60, y: 60 })
  })

  it('renders the Floor Plan heading and an 800x600 canvas as normal DOM structure (post-C-29 shell fix)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    // A regression guard for the epic's origin bug: the app shell used to
    // force this page to shrink-to-fit, splitting "Floor Plan" one character
    // per line. Asserting the heading's accessible name is the single intact
    // string (not fragmented across sibling elements) plus the canvas's
    // explicit pixel dimensions is the DOM-structure-level check available
    // to a jsdom test -- true visual layout isn't rendered here.
    const heading = await screen.findByRole('heading', { level: 2, name: 'Floor Plan' })
    expect(heading.textContent).toBe('Floor Plan')

    const canvas = screen.getByTestId('floor-plan-canvas')
    expect(canvas).toHaveStyle({ width: '800px', height: '600px' })
  })

  it('surfaces an error message when the initial fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('boom', { status: 500 }))

    render(<TableLayoutEditor apiBaseUrl={BASE_URL} authToken={null} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/500/)
  })
})
