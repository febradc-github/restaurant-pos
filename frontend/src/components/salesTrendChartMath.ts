import type { SalesMetric } from '../types/analytics'

export interface ChartPoint {
  date: string
  revenue: number
  x: number
  y: number
}

export interface ChartLayout {
  points: ChartPoint[]
  width: number
  height: number
  padding: number
  minRevenue: number
  maxRevenue: number
}

/**
 * Maps each `{date, revenue}` pair onto an x/y coordinate inside a
 * `width` x `height` plotting area, `padding` px in from every edge.
 * Revenue is parsed to a number here -- the one arithmetic use this
 * project's decimal-as-string convention calls out as legitimate.
 * A single point is centered horizontally rather than dividing by zero
 * spans; a flat series (every value identical) is given a 1-unit
 * fallback range so points don't collapse onto a NaN y.
 */
export function computeSalesChartLayout(data: SalesMetric[], width: number, height: number, padding = 32): ChartLayout {
  const revenues = data.map((point) => Number(point.revenue))
  const minRevenue = revenues.length ? Math.min(...revenues) : 0
  const maxRevenue = revenues.length ? Math.max(...revenues) : 0
  const range = maxRevenue - minRevenue || 1

  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const points: ChartPoint[] = data.map((point, index) => {
    const revenue = Number(point.revenue)
    const x = data.length <= 1 ? padding + innerWidth / 2 : padding + (innerWidth * index) / (data.length - 1)
    const y = padding + innerHeight - ((revenue - minRevenue) / range) * innerHeight
    return { date: point.date, revenue, x, y }
  })

  return { points, width, height, padding, minRevenue, maxRevenue }
}

/** Finds the index of the point whose x coordinate is closest to `svgX`. */
export function nearestPointIndex(layout: ChartLayout, svgX: number): number {
  if (layout.points.length === 0) return -1
  let nearestIndex = 0
  let nearestDistance = Infinity
  layout.points.forEach((point, index) => {
    const distance = Math.abs(point.x - svgX)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  })
  return nearestIndex
}
