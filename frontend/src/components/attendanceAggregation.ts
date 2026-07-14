import type { TimeEntry } from '../types/timeEntry'

export interface AttendanceRow {
  key: string
  user_id: number
  role: string
  totalHours: number
  openEntryCount: number
  autoClosedCount: number
}

/**
 * Aggregates raw time_entries rows (C-13, no server-side aggregation) into
 * total hours per employee/role. Still-open entries (`clock_out === null`)
 * are excluded from the hours total and counted separately so they're shown
 * distinctly rather than silently dropped or crashing the hours math.
 */
export function aggregateAttendance(entries: TimeEntry[]): AttendanceRow[] {
  const rows = new Map<string, AttendanceRow>()
  for (const entry of entries) {
    const key = `${entry.user_id}-${entry.role}`
    const row = rows.get(key) ?? {
      key,
      user_id: entry.user_id,
      role: entry.role,
      totalHours: 0,
      openEntryCount: 0,
      autoClosedCount: 0,
    }
    if (entry.clock_out) {
      const hours = (new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / (1000 * 60 * 60)
      row.totalHours += hours
    } else {
      row.openEntryCount += 1
    }
    if (entry.auto_closed) row.autoClosedCount += 1
    rows.set(key, row)
  }
  return Array.from(rows.values()).sort((a, b) => a.user_id - b.user_id || a.role.localeCompare(b.role))
}
