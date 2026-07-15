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
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('switches to the Analytics section when its nav item is clicked', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /^tables$/i })

    await user.click(screen.getByRole('menuitem', { name: /analytics/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /analytics dashboard/i })).toBeInTheDocument())
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('renders the Employees section directly at /owner/employees', async () => {
    renderOwnerPage('/owner/employees')

    expect(await screen.findByRole('heading', { name: /employees/i })).toBeInTheDocument()
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('switches to the Employees section when its nav item is clicked', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /^tables$/i })

    await user.click(screen.getByRole('menuitem', { name: /employees/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /employees/i })).toBeInTheDocument())
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('defaults /owner to the Table Layout section', async () => {
    renderOwnerPage('/owner')

    expect(await screen.findByRole('heading', { name: /^tables$/i })).toBeInTheDocument()
    expect(screen.getByTestId('table-grid')).toBeInTheDocument()
  })

  it('renders the Menu Management section directly at /owner/menu', async () => {
    renderOwnerPage('/owner/menu')

    expect(await screen.findByRole('heading', { name: /^menu$/i })).toBeInTheDocument()
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('switches sections when a nav item is clicked, without a full page reload', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /^tables$/i })

    await user.click(screen.getByRole('menuitem', { name: /menu management/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /^menu$/i })).toBeInTheDocument())
    expect(screen.queryByTestId('table-grid')).not.toBeInTheDocument()
  })

  it('marks the active section as selected in the nav', async () => {
    renderOwnerPage('/owner/menu')

    await screen.findByRole('heading', { name: /^menu$/i })

    expect(screen.getByRole('menuitem', { name: /menu management/i })).toHaveClass('ant-menu-item-selected')
    expect(screen.getByRole('menuitem', { name: /table layout/i })).not.toHaveClass('ant-menu-item-selected')
  })

  it('collapses and expands the nav sider via an accessible, labeled button', async () => {
    const user = userEvent.setup()
    renderOwnerPage('/owner')

    await screen.findByRole('heading', { name: /^tables$/i })

    const collapseButton = screen.getByRole('button', { name: /collapse navigation/i })
    await user.click(collapseButton)

    expect(await screen.findByRole('button', { name: /expand navigation/i })).toBeInTheDocument()
  })

  // C-34: Layout.Sider defaulted to antd's built-in 200px width, sized for
  // antd's 14px baseline font. This app's theme.ts sets fontSize: 16, so
  // "Menu Management" (the longest nav label) no longer fit and antd's
  // built-in menu-item ellipsis truncated it to "Menu Manage...".
  describe('sidebar width (C-34 regression)', () => {
    it('renders the full "Menu Management" label, untruncated, with the sidebar expanded', async () => {
      renderOwnerPage('/owner')

      const menuLabel = await screen.findByRole('menuitem', { name: /menu management/i })

      expect(menuLabel.textContent).toBe('Menu Management')
    })

    it('widens the expanded sider beyond antd\'s 200px default so labels fit at this app\'s font size', async () => {
      const { container } = renderOwnerPage('/owner')

      await screen.findByRole('heading', { name: /^tables$/i })

      const sider = container.querySelector('.ant-layout-sider') as HTMLElement
      expect(sider).not.toBeNull()
      expect(Number.parseInt(sider.style.width, 10)).toBeGreaterThan(200)
    })

    it('still shrinks to the collapsed icon-only width when collapsed', async () => {
      const user = userEvent.setup()
      const { container } = renderOwnerPage('/owner')

      await screen.findByRole('heading', { name: /^tables$/i })

      await user.click(screen.getByRole('button', { name: /collapse navigation/i }))

      const sider = container.querySelector('.ant-layout-sider') as HTMLElement
      expect(sider.style.width).toBe('80px')
    })
  })

  // C-37: below antd's "lg" Layout.Sider breakpoint (991.98px), the sider
  // should collapse to a drawer/toggle pattern -- off-canvas (0 width)
  // rather than the desktop icon rail -- until the header toggle reveals it
  // as a full-width overlay. jsdom has no real viewport to resize, so these
  // stub matchMedia to report a match for every query, simulating a tablet-
  // width viewport the same way Layout.Sider's own responsive observer
  // would see one (see antd's Sider source: it queries
  // `screen and (max-width: 991.98px)` for breakpoint="lg" and calls
  // onBreakpoint/onCollapse synchronously on mount with the match result).
  describe('sidebar responsiveness (tablet breakpoint, C-37)', () => {
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

    it('auto-collapses the sider off-canvas below the tablet breakpoint', async () => {
      stubNarrowViewport()
      const { container } = renderOwnerPage('/owner')

      await screen.findByRole('heading', { name: /^tables$/i })

      const sider = container.querySelector('.ant-layout-sider') as HTMLElement
      expect(sider.style.width).toBe('0px')
      expect(screen.getByRole('button', { name: /expand navigation/i })).toBeInTheDocument()
    })

    it('lets the header toggle reveal the sider as a full-width drawer when narrow', async () => {
      stubNarrowViewport()
      const user = userEvent.setup()
      const { container } = renderOwnerPage('/owner')

      await screen.findByRole('heading', { name: /^tables$/i })

      await user.click(screen.getByRole('button', { name: /expand navigation/i }))

      const sider = container.querySelector('.ant-layout-sider') as HTMLElement
      expect(sider.style.width).toBe('230px')
      expect(await screen.findByRole('button', { name: /collapse navigation/i })).toBeInTheDocument()
    })

    it('does not affect desktop-width sider behavior (unbroken matchMedia stays false)', async () => {
      const { container } = renderOwnerPage('/owner')

      await screen.findByRole('heading', { name: /^tables$/i })

      const sider = container.querySelector('.ant-layout-sider') as HTMLElement
      expect(sider.style.width).toBe('230px')
      expect(screen.getByRole('button', { name: /collapse navigation/i })).toBeInTheDocument()
    })
  })
})
