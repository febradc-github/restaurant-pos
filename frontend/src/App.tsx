import { useState } from 'react'
import { TableLayoutEditor } from './components/TableLayoutEditor'
import { MenuManager } from './components/MenuManager'
import { OrderTaking } from './components/OrderTaking'
import { KitchenDisplay } from './components/KitchenDisplay'
import { Login } from './components/Login'
import { Checkout } from './components/Checkout'
import { createAuthApi } from './api/auth'
import type { AuthSession } from './types/auth'
import './App.css'

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
    <main id="center">
      {session === null && <Login onLogin={setSession} />}

      {session !== null && (
        <div className="app__session">
          <p>
            Logged in as {session.user.name} ({session.user.role})
          </p>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}

      {session?.user.role === 'owner' && (
        <>
          <TableLayoutEditor authToken={session.token} />
          <MenuManager authToken={session.token} />
        </>
      )}

      {session?.user.role === 'cashier' && <Checkout authToken={session.token} />}

      {/* Server and Kitchen have no login per the C-6 design -- neither view takes or uses an auth token. */}
      <OrderTaking />
      <KitchenDisplay />
    </main>
  )
}

export default App
