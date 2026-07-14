/**
 * A single clock-in/clock-out record as returned by `GET /api/time-entries`
 * (C-13) -- Laravel's default model serialization, no joined user name.
 * `clock_out` is `null` while the entry is still open.
 */
export interface TimeEntry {
  id: number
  user_id: number
  role: string
  clock_in: string
  clock_out: string | null
  auto_closed: boolean
}
