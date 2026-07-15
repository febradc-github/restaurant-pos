/**
 * Formats an amount as Philippine peso currency, e.g. `₱27.00` or
 * `₱1,234.50` -- two decimal places, comma thousands separator. This is a
 * Philippines-market POS (see adr-005's QR Ph/GCash payment methods), so ₱
 * is the one currency symbol this codebase should ever render. Built as a
 * plain string formatter rather than `Intl.NumberFormat('en-PH', {
 * currency: 'PHP' })` to avoid depending on ICU currency data being present
 * in every runtime this renders in (Node/CI, browsers, print-agent), and to
 * keep the output deterministic.
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
