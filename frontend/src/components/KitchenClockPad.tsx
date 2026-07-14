import { useMemo, useState } from 'react'
import { Alert, Button, Card, Typography } from 'antd'
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
 *
 * Rebuilt on Ant Design (C-19): kitchen staff may be tapping this with wet
 * or gloved hands, so the keypad uses large `Button`s in a grid (at least as
 * generously sized as C-18's quantity-stepper buttons) rather than compact
 * controls. The panel itself is a `Card` so it reads as a distinct floating
 * surface above the order grid -- it stays fixed-position and never dims or
 * covers the order list underneath.
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
      <Button size="large" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close clock in/out' : 'Clock in/out'}
      </Button>

      {open && (
        <Card className="kitchen-clock-pad__panel">
          <Typography.Text className="kitchen-clock-pad__display" aria-label="PIN entry">
            {'•'.repeat(pin.length).padEnd(PIN_LENGTH, '·')}
          </Typography.Text>

          {error && <Alert type="error" showIcon message={error} className="kitchen-clock-pad__error" />}
          {message && (
            <Alert type="success" showIcon role="status" message={message} className="kitchen-clock-pad__message" />
          )}

          <div className="kitchen-clock-pad__keys">
            {DIGITS.map((digit) => (
              <Button key={digit} size="large" className="kitchen-clock-pad__key" onClick={() => pressDigit(digit)}>
                {digit}
              </Button>
            ))}
            <Button size="large" className="kitchen-clock-pad__key" onClick={handleClear}>
              Clear
            </Button>
            <Button size="large" className="kitchen-clock-pad__key" onClick={() => pressDigit('0')}>
              0
            </Button>
            <Button
              type="primary"
              size="large"
              className="kitchen-clock-pad__key"
              onClick={handleSubmit}
              disabled={pin.length !== PIN_LENGTH || submitting}
            >
              Submit
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default KitchenClockPad
