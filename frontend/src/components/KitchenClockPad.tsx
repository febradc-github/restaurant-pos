import { useMemo, useState } from 'react'
import { createKitchenClockApi } from '../api/kitchenClock'
import './KitchenClockPad.css'

export interface KitchenClockPadProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
}

const PIN_LENGTH = 6
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

/**
 * PIN-pad overlay for Kitchen clock-in/out (C-12) -- a small, collapsible
 * corner panel that sits alongside the live order view on the Kitchen
 * Display without replacing or interrupting it. Deliberately independent of
 * KitchenDisplay's order-fetching/WebSocket state: this component owns only
 * its own PIN entry and confirmation message, and never navigates away from
 * the order list.
 *
 * Submitting a PIN toggles the matching employee's attendance -- the same
 * PIN clocks them in on one submission and out on the next -- so the
 * confirmation always echoes back which action the backend actually took
 * rather than assuming.
 */
export function KitchenClockPad({ apiBaseUrl }: KitchenClockPadProps) {
  const api = useMemo(() => createKitchenClockApi({ baseUrl: apiBaseUrl }), [apiBaseUrl])

  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function pressDigit(digit: string) {
    setError(null)
    setMessage(null)
    setPin((prev) => (prev.length < PIN_LENGTH ? prev + digit : prev))
  }

  function handleClear() {
    setPin('')
    setError(null)
    setMessage(null)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await api.clock(pin)
      const verb = result.action === 'clocked_in' ? 'clocked in' : 'clocked out'
      setMessage(`${result.employee.name} ${verb}.`)
      setError(null)
    } catch (err) {
      setError(errorMessage(err, 'Invalid PIN.'))
      setMessage(null)
    } finally {
      setPin('')
      setSubmitting(false)
    }
  }

  return (
    <div className="kitchen-clock-pad">
      <button type="button" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close clock in/out' : 'Clock in/out'}
      </button>

      {open && (
        <div className="kitchen-clock-pad__panel">
          <p className="kitchen-clock-pad__display" aria-label="PIN entry">
            {'•'.repeat(pin.length).padEnd(PIN_LENGTH, '·')}
          </p>

          {error && (
            <p className="kitchen-clock-pad__error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="kitchen-clock-pad__message" role="status">
              {message}
            </p>
          )}

          <div className="kitchen-clock-pad__keys">
            {DIGITS.map((digit) => (
              <button key={digit} type="button" onClick={() => pressDigit(digit)}>
                {digit}
              </button>
            ))}
            <button type="button" onClick={handleClear}>
              Clear
            </button>
            <button type="button" onClick={() => pressDigit('0')}>
              0
            </button>
            <button type="button" onClick={handleSubmit} disabled={pin.length !== PIN_LENGTH || submitting}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KitchenClockPad
