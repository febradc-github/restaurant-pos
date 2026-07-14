import type { TimeEntry } from '../types/timeEntry'
import { getApiBaseUrl } from './tables'

export interface TimeEntriesApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
  /** Owner bearer token. */
  token?: string | null
}

export interface TimeEntriesQuery {
  user_id?: number
  role?: string
  from?: string
  to?: string
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

function buildQuery(query: TimeEntriesQuery): string {
  const params = new URLSearchParams()
  if (query.user_id !== undefined) params.set('user_id', String(query.user_id))
  if (query.role) params.set('role', query.role)
  if (query.from) params.set('from', query.from)
  if (query.to) params.set('to', query.to)
  const search = params.toString()
  return search ? `?${search}` : ''
}

/**
 * Thin fetch wrapper around the /api/time-entries endpoint (C-13). Owner-only
 * on the backend; every call here expects an Owner bearer token. Mirrors the
 * shape of createEmployeesApi/createMenuApi. Read-only -- clock-in/clock-out
 * are handled by KitchenClockPad's separate PIN-authenticated API, not here.
 */
export function createTimeEntriesApi(options: TimeEntriesApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async list(query: TimeEntriesQuery = {}): Promise<TimeEntry[]> {
      const response = await fetch(url(`/api/time-entries${buildQuery(query)}`), {
        headers: buildHeaders(token, false),
      })
      return handleResponse<TimeEntry[]>(response)
    },
  }
}

export type TimeEntriesApi = ReturnType<typeof createTimeEntriesApi>
