import type { ClockResult } from '../types/kitchenClock'
import { getApiBaseUrl } from './tables'

export interface KitchenClockApiOptions {
  /** Backend origin. Defaults to VITE_API_BASE_URL / DEFAULT_API_BASE_URL. */
  baseUrl?: string
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request to ${response.url} failed with status ${response.status}: ${body}`)
  }
  return (await response.json()) as T
}

/**
 * Thin fetch wrapper around POST /api/kitchen/clock (C-12). No token option
 * at all, unlike createOrdersApi/createTablesApi -- this endpoint sits
 * outside auth:sanctum by design, identified purely by the PIN in the
 * request body.
 */
export function createKitchenClockApi(options: KitchenClockApiOptions = {}) {
  const baseUrl = options.baseUrl ?? getApiBaseUrl()
  const url = (path: string) => `${baseUrl}${path}`

  return {
    async clock(pin: string): Promise<ClockResult> {
      const response = await fetch(url('/api/kitchen/clock'), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      return handleResponse<ClockResult>(response)
    },
  }
}

export type KitchenClockApi = ReturnType<typeof createKitchenClockApi>
