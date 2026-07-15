import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { App as AntdApp, Button, ConfigProvider, theme as antdTheme, Typography } from 'antd'
import { OwnerPage } from './components/OwnerPage'
import { TakeOrdersPage } from './components/TakeOrdersPage'
import { KitchenPage } from './components/KitchenPage'
import { Login } from './components/Login'
import { CashierPage } from './components/CashierPage'
import { createAuthApi } from './api/auth'
import type { AuthRole, AuthSession } from './types/auth'
import { theme } from './theme'
import './App.css'

/** The route each role lands on -- both after login and as "their" gated route. */
const ROLE_HOME: Record<AuthRole, string> = {
  owner: '/owner',
  cashier: '/cashier',
  server: '/take-orders',
}

interface SessionBarProps {
  session: AuthSession
  onLogout: () => void
}

/**
 * Wraps its content in an explicit, theme-token-sourced background (C-34).
 * Originally this shielded the session text from index.css's OS-driven
 * dark-mode background bleeding through behind a backgroundless
 * `.app__session`; C-36 made `theme.ts`'s ConfigProvider dark-only and
 * removed that OS-driven CSS, but this is still load-bearing, not just
 * inherited insurance: `.app__session` has no background rule of its own in
 * App.css, so without this inline style it would show whatever `index.css`'s
 * `:root { background }` paints (`#16171d`) rather than antd's own
 * `colorBgContainer` (`#141414`) -- close, but a different token, and one
 * that would silently drift out of sync with future theme.ts tuning. Follows
 * this codebase's established pattern (see SalesTrendChart.tsx) of sourcing
 * runtime-theme colors from `theme.useToken()` in TSX rather than CSS custom
 * properties, since ConfigProvider doesn't enable antd's cssVar mode.
 */
function SessionBar({ session, onLogout }: SessionBarProps) {
  const { token } = antdTheme.useToken()

  return (
    <div className="app__session" style={{ background: token.colorBgContainer }}>
      <Typography.Text>
        Logged in as {session.user.name} ({session.user.role})
      </Typography.Text>
      <Button onClick={onLogout}>Log out</Button>
    </div>
  )
}

interface RoleRouteProps {
  session: AuthSession | null
  role: AuthRole
  onLogout: () => void
  children: (session: AuthSession) => ReactNode
}

/**
 * Redirects to /login unless the current session belongs to `role`. Mirrors
 * the `session?.user.role === '...'` conditionals this replaces -- same
 * gating rules as before (C-11 for Server), now expressed as routes instead
 * of inline JSX branches in one component.
 */
function RoleRoute({ session, role, onLogout, children }: RoleRouteProps) {
  if (session === null || session.user.role !== role) {
    return <Navigate to="/login" replace />
  }
  return (
    <>
      <SessionBar session={session} onLogout={onLogout} />
      {children(session)}
    </>
  )
}

interface LoginRouteProps {
  session: AuthSession | null
  onLogin: (session: AuthSession) => void
}

/** Sends an already-logged-in visitor straight to their role's home route. */
function LoginRoute({ session, onLogin }: LoginRouteProps) {
  const navigate = useNavigate()

  if (session !== null) {
    return <Navigate to={ROLE_HOME[session.user.role]} replace />
  }

  return (
    <Login
      onLogin={(next) => {
        onLogin(next)
        navigate(ROLE_HOME[next.user.role], { replace: true })
      }}
    />
  )
}

function App() {
  const [session, setSession] = useState<AuthSession | null>(null)

  async function handleLogout() {
    const current = session
    // Clear local session immediately regardless of whether the server-side
    // revoke succeeds -- a failed logout call shouldn't trap the Owner or
    // Cashier in a session they've asked to leave.
    setSession(null)
    if (current) {
      try {
        await createAuthApi().logout(current.token)
      } catch {
        // Best-effort revoke; the token will otherwise just expire.
      }
    }
  }

  return (
    <ConfigProvider theme={theme}>
      <AntdApp>
        <main className="app__main">
          <Routes>
            <Route path="/login" element={<LoginRoute session={session} onLogin={setSession} />} />

            <Route
              path="/owner/*"
              element={
                <RoleRoute session={session} role="owner" onLogout={handleLogout}>
                  {(active) => <OwnerPage authToken={active.token} />}
                </RoleRoute>
              }
            />

            <Route
              path="/cashier"
              element={
                <RoleRoute session={session} role="cashier" onLogout={handleLogout}>
                  {(active) => <CashierPage authToken={active.token} />}
                </RoleRoute>
              }
            />

            {/* Server requires login (C-11) -- gated the same way Checkout is
                gated behind Cashier above. The order-taking API calls
                themselves stay unauthenticated, only access to this screen
                is gated. */}
            <Route
              path="/take-orders"
              element={
                <RoleRoute session={session} role="server" onLogout={handleLogout}>
                  {(active) => <TakeOrdersPage serverName={active.user.name} />}
                </RoleRoute>
              }
            />

            {/* Kitchen still has no login per the C-6 design (PIN-based
                clock-in is a separate concern, C-12) -- deliberately
                ungated. See adr-008-server-login-kitchen-pin-attendance.
                KitchenPage (C-19) is a pure presentational wrapper with no
                RoleRoute, no session check of any kind -- do not add one. */}
            <Route path="/kitchen" element={<KitchenPage />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
