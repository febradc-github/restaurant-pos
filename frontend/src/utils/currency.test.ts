import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats a whole number with two decimal places and the peso sign', () => {
    expect(formatCurrency(27)).toBe('₱27.00')
  })

  it('formats fractional amounts to two decimal places', () => {
    expect(formatCurrency(19.98)).toBe('₱19.98')
  })

  it('adds a comma thousands separator for larger totals', () => {
    expect(formatCurrency(1234.5)).toBe('₱1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₱0.00')
  })
})
