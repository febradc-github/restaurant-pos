import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { App as AntdApp, Button, ConfigProvider, Typography } from 'antd'
import { OwnerPage } from './components/OwnerPage'
import { OrderTaking } from './components/OrderTaking'
import { KitchenDisplay } from './components/KitchenDisplay'
import { Login } from './components/Login'
import { Checkout } from './components/Checkout'
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

function SessionBar({ session, onLogout }: SessionBarProps) {
  return (
    <div className="app__session">
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
        <main id="center">
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
                  {(active) => <Checkout authToken={active.token} />}
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
                  {() => <OrderTaking />}
                </RoleRoute>
              }
            />

            {/* Kitchen still has no login per the C-6 design (PIN-based
                clock-in is a separate concern, C-12) -- deliberately
                ungated. See adr-008-server-login-kitchen-pin-attendance. */}
            <Route path="/kitchen" element={<KitchenDisplay />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
