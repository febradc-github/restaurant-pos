import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KitchenClockPad } from './KitchenClockPad'
import type { ClockResult } from '../types/kitchenClock'

const clock = vi.fn<(pin: string) => Promise<ClockResult>>()

vi.mock('../api/kitchenClock', () => ({
  createKitchenClockApi: () => ({ clock }),
}))

async function enterPin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const digit of pin) {
    await user.click(screen.getByRole('button', { name: digit }))
  }
}

describe('KitchenClockPad', () => {
  beforeEach(() => {
    clock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts collapsed, with no digit pad visible', () => {
    render(<KitchenClockPad />)

    expect(screen.getByRole('button', { name: /clock in.*out/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
  })

  it('reveals a numeric pad and a disabled submit button when opened', async () => {
    const user = userEvent.setup()
    render(<KitchenClockPad />)

    await user.click(screen.getByRole('button', { name: /clock in.*out/i }))

    for (const digit of '0123456789') {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('submits a 6-digit PIN and shows a clock-in confirmation with the employee name, then resets', async () => {
    clock.mockResolvedValueOnce({ action: 'clocked_in', employee: { id: 1, name: 'Kitchen Kev' } })
    const user = userEvent.setup()
    render(<KitchenClockPad />)
    await user.click(screen.getByRole('button', { name: /clock in.*out/i }))

    await enterPin(user, '123456')
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(clock).toHaveBeenCalledWith('123456')
    expect(await screen.findByRole('status')).toHaveTextContent(/Kitchen Kev.*clocked in/i)
    // Resets for the next entry -- submit disabled again with the pad still open.
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('shows a clock-out confirmation when the same PIN toggles the employee back out', async () => {
    clock.mockResolvedValueOnce({ action: 'clocked_out', employee: { id: 1, name: 'Kitchen Kev' } })
    const user = userEvent.setup()
    render(<KitchenClockPad />)
    await user.click(screen.getByRole('button', { name: /clock in.*out/i }))

    await enterPin(user, '123456')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(/Kitchen Kev.*clocked out/i)
  })

  it('shows a generic error for an invalid PIN and resets the entry without navigating away', async () => {
    clock.mockRejectedValueOnce(new Error('Request failed with status 422: {"message":"Invalid PIN."}'))
    const user = userEvent.setup()
    render(<KitchenClockPad />)
    await user.click(screen.getByRole('button', { name: /clock in.*out/i }))

    await enterPin(user, '000000')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })
})
