import type { AuthSession } from '../types/auth'
import { getApiBaseUrl } from './tables'

export interface AuthApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request to ${response.url} failed with status ${response.status}: ${body}`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * Thin fetch wrapper around the /api/login and /api/logout endpoints,
 * parameterized by base URL like createTablesApi/createOrdersApi. Unlike
 * those clients this one doesn't take a token up front -- logging in is how
 * a token is obtained in the first place, and logging out consumes the
 * token being revoked as a call argument instead.
 */
export function createAuthApi(options: AuthApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async login(identifier: string, password: string): Promise<AuthSession> {
      const response = await fetch(url('/api/login'), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      return handleResponse<AuthSession>(response)
    },

    async logout(token: string): Promise<void> {
      const response = await fetch(url('/api/logout'), {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
      await handleResponse<void>(response)
    },
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
