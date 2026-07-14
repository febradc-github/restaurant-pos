import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { OwnerPage } from './OwnerPage'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

/** Answers every request either section's mount effect might issue. */
function stubFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/tables')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/categories')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/menu-items')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/employees')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/analytics/sales')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/analytics/menu-items')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/time-entries')) return Promise.resolve(jsonResponse([]))
      if (url.includes('/api/inventory-items/restock')) return Promise.resolve(jsonResponse([]))
      throw new Error(`Unexpected fetch in test: ${url}`)
    }),
  )
}

/** Renders OwnerPage the way App.tsx mounts it: under a wildcard /owner/* route. */
function renderOwnerPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/owner/*" element={<OwnerPage authToken="owner-token" />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OwnerPage', () => {
  beforeEach(() => {
    stubFetch()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a nav entry for Table Layout, Menu Management, Employees, and Analytics', async () => {
    renderOwnerPage('/owner')

    expect(await screen.findByRole('menuitem', { name: /table layout/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /menu management/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /employees/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /analytics/i })).toBeInTheDocument()
  })

  it('renders the Analytics section directly at /owner/analytics', async () => {
    renderOwnerPage('/owner/analytics')

    expect(await screen.findByRole('heading', { name: /analytics dashboard/i })).toBeInTheDocument()
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('switches to the Analytics section when its nav item is clicked', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /floor plan/i })

    await user.click(screen.getByRole('menuitem', { name: /analytics/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /analytics dashboard/i })).toBeInTheDocument())
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('renders the Employees section directly at /owner/employees', async () => {
    renderOwnerPage('/owner/employees')

    expect(await screen.findByRole('heading', { name: /employees/i })).toBeInTheDocument()
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('switches to the Employees section when its nav item is clicked', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /floor plan/i })

    await user.click(screen.getByRole('menuitem', { name: /employees/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /employees/i })).toBeInTheDocument())
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('defaults /owner to the Table Layout section', async () => {
    renderOwnerPage('/owner')

    expect(await screen.findByRole('heading', { name: /floor plan/i })).toBeInTheDocument()
    expect(screen.getByTestId('floor-plan-canvas')).toBeInTheDocument()
  })

  it('renders the Menu Management section directly at /owner/menu', async () => {
    renderOwnerPage('/owner/menu')

    expect(await screen.findByRole('heading', { name: /^menu$/i })).toBeInTheDocument()
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('switches sections when a nav item is clicked, without a full page reload', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /floor plan/i })

    await user.click(screen.getByRole('menuitem', { name: /menu management/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /^menu$/i })).toBeInTheDocument())
    expect(screen.queryByTestId('floor-plan-canvas')).not.toBeInTheDocument()
  })

  it('marks the active section as selected in the nav', async () => {
    renderOwnerPage('/owner/menu')

    await screen.findByRole('heading', { name: /^menu$/i })

    expect(screen.getByRole('menuitem', { name: /menu management/i })).toHaveClass('ant-menu-item-selected')
    expect(screen.getByRole('menuitem', { name: /table layout/i })).not.toHaveClass('ant-menu-item-selected')
  })
})
