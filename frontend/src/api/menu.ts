import type {
  Category,
  CategoryUpdate,
  MenuItem,
  MenuItemUpdate,
  NewCategory,
  NewMenuItem,
} from '../types/menu'
import { getApiBaseUrl } from './tables'

export interface MenuApiOptions {
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
    const error = new Error(`Request to ${response.url} failed with status ${response.status}: ${body}`)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/**
 * Thin fetch wrapper around the /api/categories and /api/menu-items
 * endpoints. Parameterized by base URL and an optional owner token so
 * read-only callers (Server/Kitchen views) and Owner-authenticated callers
 * can share the same client. Mirrors the shape of createTablesApi.
 */
export function createMenuApi(options: MenuApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const token = options.token ?? null
  const url = (path: string) => `${baseUrl}${path}`

  return {
    categories: {
      async list(): Promise<Category[]> {
        const response = await fetch(url('/api/categories'), { headers: buildHeaders(token, false) })
        return handleResponse<Category[]>(response)
      },

      async create(category: NewCategory): Promise<Category> {
        const response = await fetch(url('/api/categories'), {
          method: 'POST',
          headers: buildHeaders(token, true),
          body: JSON.stringify(category),
        })
        return handleResponse<Category>(response)
      },

      async update(id: number, updates: CategoryUpdate): Promise<Category> {
        const response = await fetch(url(`/api/categories/${id}`), {
          method: 'PATCH',
          headers: buildHeaders(token, true),
          body: JSON.stringify(updates),
        })
        return handleResponse<Category>(response)
      },

      async remove(id: number): Promise<void> {
        const response = await fetch(url(`/api/categories/${id}`), {
          method: 'DELETE',
          headers: buildHeaders(token, false),
        })
        await handleResponse<void>(response)
      },
    },

    menuItems: {
      async list(categoryId?: number): Promise<MenuItem[]> {
        const path =
          categoryId === undefined ? '/api/menu-items' : `/api/menu-items?category_id=${categoryId}`
        const response = await fetch(url(path), { headers: buildHeaders(token, false) })
        return handleResponse<MenuItem[]>(response)
      },

      async create(menuItem: NewMenuItem): Promise<MenuItem> {
        const response = await fetch(url('/api/menu-items'), {
          method: 'POST',
          headers: buildHeaders(token, true),
          body: JSON.stringify(menuItem),
        })
        return handleResponse<MenuItem>(response)
      },

      async update(id: number, updates: MenuItemUpdate): Promise<MenuItem> {
        const response = await fetch(url(`/api/menu-items/${id}`), {
          method: 'PATCH',
          headers: buildHeaders(token, true),
          body: JSON.stringify(updates),
        })
        return handleResponse<MenuItem>(response)
      },

      async remove(id: number): Promise<void> {
        const response = await fetch(url(`/api/menu-items/${id}`), {
          method: 'DELETE',
          headers: buildHeaders(token, false),
        })
        await handleResponse<void>(response)
      },
    },
  }
}

export type MenuApi = ReturnType<typeof createMenuApi>
