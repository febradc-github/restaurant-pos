/** Which way a PIN submission toggled the employee's attendance. */
export type ClockAction = 'clocked_in' | 'clocked_out'

/** Result of a Kitchen PIN clock-in/out submission (C-12). */
export interface ClockResult {
  action: ClockAction
  employee: {
    id: number
    name: string
  }
}
