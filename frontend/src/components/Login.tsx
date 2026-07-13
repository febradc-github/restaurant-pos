import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createAuthApi } from '../api/auth'
import type { AuthSession } from '../types/auth'
import './Login.css'

export interface LoginProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /** Called with the resulting session once the login call succeeds. */
  onLogin: (session: AuthSession) => void
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * Login screen shared by Owner and Cashier -- there's no separate signup or
 * role picker; the backend's /api/login response carries the role, and the
 * caller (App) decides which authenticated view to render from it.
 */
export function Login({ apiBaseUrl, onLogin }: LoginProps) {
  const api = useMemo(() => createAuthApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const session = await api.login(identifier, password)
      onLogin(session)
    } catch (err) {
      setError(errorMessage(err, 'Login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <h2>Log in</h2>

      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}

      <form className="login__form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          Log in
        </button>
      </form>
    </div>
  )
}

export default Login
