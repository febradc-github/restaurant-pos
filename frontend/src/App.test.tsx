/// <reference types="node" />
// The above brings in ambient Node types (process, node:fs/node:path module
// shapes) for this file only -- tsconfig.app.json's `types` is deliberately
// scoped to `vite/client` for browser app code, so a project-wide addition
// isn't warranted just for this test's use of the filesystem (see the
// indexCssOnDisk comment below). @types/node is already a project
// devDependency (used by tsconfig.node.json for vite.config.ts), so this
// adds no new dependency.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import appCssSource from './App.css?raw'
import indexCssSource from './index.css?raw'
import type { AuthSession } from './types/auth'
import type { KitchenChannelHandlers } from './realtime/echo'

// C-36: `?raw` CSS imports (used by appCssSource/indexCssSource above)
// currently resolve to an empty string under this project's vitest config
// (`test.css: false` appears to disable Vite's CSS pipeline for raw
// queries too, not just style injection -- pre-existing, unrelated to this
// ticket). That makes the `?raw`-sourced assertions below vacuous, so the
// C-36 test reads the file straight off disk instead.
const indexCssOnDisk = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8')

vi.mock('./realtime/echo', () => ({
  subscribeToKitchenChannel: vi.fn((_handlers: KitchenChannelHandlers) => vi.fn()),
}))

const serverSession: AuthSession = {
  token: 'server-token',
  user: { id: 1, name: 'Sam Erver', email: 'server@example.com', role: 'server' },
}

const cashierSession: AuthSession = {
  token: 'cashier-token',
  user: { id: 2, name: 'Cass Ashier', email: 'cashier@example.com', role: 'cashier' },
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

/** Answers every request the routed screens might issue, keyed by path suffix. */
function stubFetch(loginSession: AuthSession) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/api/login')) return Promise.resolve(jsonResponse(loginSession))
      if (url.endsWith('/api/logout')) return Promise.resolve(jsonResponse({ message: 'Logged out successfully.' }))
      if (url.endsWith('/api/orders')) return Promise.resolve(jsonResponse([]))
      if (url.endsWith('/api/tables')) return Promise.resolve(jsonResponse([]))
      if (url.endsWith('/api/menu-items')) return Promise.resolve(jsonResponse([]))
      throw new Error(`Unexpected fetch in test: ${init?.method ?? 'GET'} ${url}`)
    }),
  )
}

/** Renders the full app router tree starting at `initialEntry`, the way main.tsx's BrowserRouter would. */
function renderApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  )
}

async function logIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), 'someone@example.com')
  await user.type(screen.getByLabelText(/password/i), 'secret-password')
  await user.click(screen.getByRole('button', { name: /log in/i }))
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the login screen and no Take-Orders or Checkout screen when logged out', () => {
    stubFetch(serverSession)

    renderApp('/login')

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /checkout/i })).not.toBeInTheDocument()
  })

  it('reveals the Take-Orders screen after a Server logs in, and logging out returns to the login screen', async () => {
    stubFetch(serverSession)
    const user = userEvent.setup()

    renderApp('/login')
    await logIn(user)

    expect(await screen.findByRole('heading', { name: /take order/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /log in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /checkout/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
  })

  it('still reveals Checkout (not Take-Orders) after a Cashier logs in', async () => {
    stubFetch(cashierSession)
    const user = userEvent.setup()

    renderApp('/login')
    await logIn(user)

    expect(await screen.findByRole('heading', { name: /checkout/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /take order/i })).not.toBeInTheDocument()
  })

  describe('route gating', () => {
    // Regression check against adr-008-server-login-kitchen-pin-attendance:
    // Kitchen must stay reachable with no session at all.
    it('renders the Kitchen Display at /kitchen with no session, with no redirect to /login', () => {
      stubFetch(serverSession)

      renderApp('/kitchen')

      expect(screen.getByRole('heading', { name: /kitchen display/i })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /log in/i })).not.toBeInTheDocument()
    })

    it.each(['/owner', '/cashier', '/take-orders'])(
      'redirects %s to /login when there is no session',
      (path) => {
        stubFetch(serverSession)

        renderApp(path)

        expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
      },
    )
  })

  // C-29: the app shell used to wrap every routed page in <main id="center">,
  // and App.css set `place-items: center` on #center. That forced the routed
  // page's root element (e.g. an antd <Layout>) to shrink-to-fit instead of
  // stretching to fill the available width, collapsing nested text (like the
  // Owner Table Layout page's "Floor Plan" heading) down to near-zero width.
  // vitest is configured with `css: false` (see vite.config.ts), so computed
  // styles from the real stylesheet aren't observable via jsdom -- these
  // checks instead assert directly on the rendered DOM and the stylesheet
  // source, which is what actually caused (and now prevents) the collapse.
  describe('app shell layout (C-29 regression)', () => {
    it('does not wrap the routed page in the old shrink-to-fit centering container', () => {
      stubFetch(serverSession)

      const { container } = renderApp('/kitchen')

      expect(container.querySelector('#center')).not.toBeInTheDocument()
    })

    it('keeps App.css free of the dead Vite-starter rules that caused the collapse', () => {
      expect(appCssSource).not.toMatch(/place-items\s*:\s*center/)
      for (const deadSelector of ['#center', '.hero', '.base', '.framework', '.vite', '#next-steps', '#docs', '#spacer', '.ticks']) {
        expect(appCssSource).not.toContain(deadSelector)
      }
    })

    it('keeps #root free of the dead landing-page width constraint', () => {
      expect(indexCssSource).not.toMatch(/width:\s*1126px/)
    })
  })

  // C-34: index.css still carries a pre-C-29 `@media (prefers-color-scheme:
  // dark)` block that repaints `:root`'s background near-black whenever the
  // OS is in dark mode. .app__session had no background of its own, so that
  // near-black bled through behind antd's light-theme (dark) session text,
  // making "Logged in as ..." unreadable in dark-mode OSes. vitest runs with
  // `css: false` so the real dark-mode media query never fires in jsdom --
  // this instead asserts the session bar carries its own explicit,
  // theme-token-sourced background (an inline style, which IS observable in
  // jsdom) so it no longer depends on whatever index.css paints behind it.
  describe('session bar contrast (C-34 regression)', () => {
    it('gives the session bar its own opaque background instead of relying on the page background', async () => {
      stubFetch(serverSession)
      const user = userEvent.setup()

      renderApp('/login')
      await logIn(user)

      const logoutButton = await screen.findByRole('button', { name: /log out/i })
      const sessionBar = logoutButton.closest('.app__session')

      expect(sessionBar).not.toBeNull()
      const background = (sessionBar as HTMLElement).style.backgroundColor
      expect(background).not.toBe('')
      expect(background).not.toBe('transparent')
    })
  })

  // C-36: theme.ts's ConfigProvider is now dark-only (antd `darkAlgorithm`),
  // so index.css's leftover pre-C-29 `@media (prefers-color-scheme: dark)`
  // block is redundant at best -- and actively conflicting at worst, since
  // it flips :root's background based on OS preference independent of the
  // app's actual (always-dark) theme, rather than a light OS reverting to a
  // stray light `:root` background behind app content.
  describe('index.css theme reconciliation (C-36)', () => {
    it('no longer flips the page background based on OS color-scheme preference', () => {
      expect(indexCssOnDisk).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/)
    })
  })
})
