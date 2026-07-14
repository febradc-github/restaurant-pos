import type { MenuItemMetric, SalesMetric } from '../types/analytics'
import { getApiBaseUrl } from './tables'

export interface AnalyticsApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
  /** Owner bearer token. */
  token?: string | null
}

function buildHeaders(token: string | null | undefined, hasBody: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (hasBody) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

/**
 * Parses a Laravel 422 validation error body (`{message, errors}`) so
 * callers can surface the specific field message rather than a generic
 * status line. Falls back to the raw response text when the body isn't the
 * expected JSON shape.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    let message = `Request to ${response.url} failed with status ${response.status}: ${text}`
    try {
      const parsed = JSON.parse(text) as { message?: string; errors?: Record<string, string[]> }
      const firstFieldError = parsed.errors && Object.values(parsed.errors)[0]?.[0]
      message = firstFieldError ?? parsed.message ?? message
    } catch {
      // Body wasn't JSON -- keep the fallback message.
    }
    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Builds a `?from=...&to=...` query string, omitting either param when absent. */
function buildRangeQuery(from?: string, to?: string): string {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Thin fetch wrapper around the /api/analytics endpoints (C-24). Owner-only
 * on the backend; every call here expects an Owner bearer token. Mirrors the
 * shape of createEmployeesApi/createMenuApi.
 */
export function createAnalyticsApi(options: AnalyticsApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async sales(from?: string, to?: string): Promise<SalesMetric[]> {
      const response = await fetch(url(`/api/analytics/sales${buildRangeQuery(from, to)}`), {
        headers: buildHeaders(token, false),
      })
      return handleResponse<SalesMetric[]>(response)
    },

    async menuItems(from?: string, to?: string): Promise<MenuItemMetric[]> {
      const response = await fetch(url(`/api/analytics/menu-items${buildRangeQuery(from, to)}`), {
        headers: buildHeaders(token, false),
      })
      return handleResponse<MenuItemMetric[]>(response)
    },
  }
}

export type AnalyticsApi = ReturnType<typeof createAnalyticsApi>
