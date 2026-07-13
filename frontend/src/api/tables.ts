import type { NewTable, Table, TableUpdate } from '../types/table'

/** Fallback API origin for local development when no env var is set. */
export const DEFAULT_API_BASE_URL = 'http://localhost:8000'

/** The backend origin, overridable via VITE_API_BASE_URL for other environments. */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
}

export interface TablesApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
  /** Owner bearer token. Omit (or pass null) for read-only, unauthenticated access. */
  token?: string | null
}

function buildHeaders(token: string | null | undefined, hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
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
 * Thin fetch wrapper around the /api/tables endpoints. Parameterized by base
 * URL and an optional owner token so read-only callers (Server/Kitchen views)
 * and Owner-authenticated callers can share the same client.
 */
export function createTablesApi(options: TablesApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async list(): Promise<Table[]> {
      const response = await fetch(url('/api/tables'), { headers: buildHeaders(token, false) })
      return handleResponse<Table[]>(response)
    },

    async create(table: NewTable): Promise<Table> {
      const response = await fetch(url('/api/tables'), {
        method: 'POST',
        headers: buildHeaders(token, true),
        body: JSON.stringify(table),
      })
      return handleResponse<Table>(response)
    },

    async update(id: number, updates: TableUpdate): Promise<Table> {
      const response = await fetch(url(`/api/tables/${id}`), {
        method: 'PATCH',
        headers: buildHeaders(token, true),
        body: JSON.stringify(updates),
      })
      return handleResponse<Table>(response)
    },

    async remove(id: number): Promise<void> {
      const response = await fetch(url(`/api/tables/${id}`), {
        method: 'DELETE',
        headers: buildHeaders(token, false),
      })
      await handleResponse<void>(response)
    },
  }
}

export type TablesApi = ReturnType<typeof createTablesApi>
