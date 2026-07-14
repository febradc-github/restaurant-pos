import type { Employee, EmployeeUpdate, NewEmployee } from '../types/employee'
import { getApiBaseUrl } from './tables'

export interface EmployeesApiOptions {
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
 * callers can surface the specific field message (e.g. deactivate's
 * "You cannot deactivate your own account.") rather than a generic status
 * line. Falls back to the raw response text when the body isn't the
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

/**
 * Thin fetch wrapper around the /api/employees endpoints (C-21). Owner-only
 * on the backend; every call here expects an Owner bearer token. Mirrors the
 * shape of createMenuApi/createTablesApi.
 */
export function createEmployeesApi(options: EmployeesApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async list(): Promise<Employee[]> {
      const response = await fetch(url('/api/employees'), { headers: buildHeaders(token, false) })
      return handleResponse<Employee[]>(response)
    },

    async create(employee: NewEmployee): Promise<Employee> {
      const response = await fetch(url('/api/employees'), {
        method: 'POST',
        headers: buildHeaders(token, true),
        body: JSON.stringify(employee),
      })
      return handleResponse<Employee>(response)
    },

    async update(id: number, updates: EmployeeUpdate): Promise<Employee> {
      const response = await fetch(url(`/api/employees/${id}`), {
        method: 'PATCH',
        headers: buildHeaders(token, true),
        body: JSON.stringify(updates),
      })
      return handleResponse<Employee>(response)
    },

    async deactivate(id: number): Promise<Employee> {
      const response = await fetch(url(`/api/employees/${id}/deactivate`), {
        method: 'PATCH',
        headers: buildHeaders(token, false),
      })
      return handleResponse<Employee>(response)
    },

    async reactivate(id: number): Promise<Employee> {
      const response = await fetch(url(`/api/employees/${id}/reactivate`), {
        method: 'PATCH',
        headers: buildHeaders(token, false),
      })
      return handleResponse<Employee>(response)
    },
  }
}

export type EmployeesApi = ReturnType<typeof createEmployeesApi>
