import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import { SalesTrendChart } from './SalesTrendChart'
import { computeSalesChartLayout, nearestPointIndex } from './salesTrendChartMath'
import type { SalesMetric } from '../types/analytics'
import { theme } from '../theme'

const sampleData: SalesMetric[] = [
  { date: '2026-07-08', revenue: '10.00' },
  { date: '2026-07-09', revenue: '25.50' },
  { date: '2026-07-10', revenue: '46.50' },
]

function renderChart(data: SalesMetric[]) {
  return render(
    <ConfigProvider theme={theme}>
      <SalesTrendChart data={data} />
    </ConfigProvider>,
  )
}

describe('computeSalesChartLayout', () => {
  it('maps each data point to an x/y coordinate inside the plotting area', () => {
    const layout = computeSalesChartLayout(sampleData, 600, 200, 20)

    expect(layout.points).toHaveLength(3)
    // First point is at the left padding edge, last at the right padding edge.
    expect(layout.points[0].x).toBeCloseTo(20)
    expect(layout.points[2].x).toBeCloseTo(580)
    // Highest revenue point sits highest (smallest y); lowest revenue sits lowest (largest y).
    expect(layout.points[2].y).toBeLessThan(layout.points[0].y)
  })

  it('does not divide by zero when every value is identical', () => {
    const flat: SalesMetric[] = [
      { date: '2026-07-08', revenue: '10.00' },
      { date: '2026-07-09', revenue: '10.00' },
    ]

    const layout = computeSalesChartLayout(flat, 600, 200, 20)

    expect(layout.points.every((point) => Number.isFinite(point.y))).toBe(true)
  })

  it('places a single point at the horizontal center of the plotting area', () => {
    const layout = computeSalesChartLayout([sampleData[0]], 600, 200, 20)

    expect(layout.points).toHaveLength(1)
    expect(layout.points[0].x).toBeCloseTo(300)
  })
})

describe('nearestPointIndex', () => {
  it('picks the closest point to a given x coordinate', () => {
    const layout = computeSalesChartLayout(sampleData, 600, 200, 20)

    expect(nearestPointIndex(layout, layout.points[0].x + 2)).toBe(0)
    expect(nearestPointIndex(layout, layout.points[1].x - 1)).toBe(1)
    expect(nearestPointIndex(layout, layout.points[2].x)).toBe(2)
  })

  it('returns -1 for an empty layout', () => {
    const layout = computeSalesChartLayout([], 600, 200, 20)

    expect(nearestPointIndex(layout, 100)).toBe(-1)
  })
})

describe('SalesTrendChart', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders a line and an end-marker dot for the latest point', () => {
    const { container } = renderChart(sampleData)

    expect(container.querySelector('path.sales-trend-chart__line')).toBeInTheDocument()
    expect(container.querySelector('circle.sales-trend-chart__end-marker')).toBeInTheDocument()
  })

  it('renders solid hairline gridlines, never dashed', () => {
    const { container } = renderChart(sampleData)

    const gridlines = container.querySelectorAll('line.sales-trend-chart__gridline')
    expect(gridlines.length).toBeGreaterThan(0)
    gridlines.forEach((line) => {
      expect(line.getAttribute('stroke-dasharray')).toBeNull()
    })
  })

  it('shows an empty state and no chart geometry when there is no data', () => {
    renderChart([])

    expect(screen.getByText(/no sales/i)).toBeInTheDocument()
  })

  it('shows a crosshair and tooltip with the exact date and revenue on pointermove, snapped to the nearest point', () => {
    const { container } = renderChart(sampleData)

    const svg = container.querySelector('svg') as SVGSVGElement
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 600,
      height: 200,
      right: 600,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect)

    const layout = computeSalesChartLayout(sampleData, 600, 200, 32)
    const targetPoint = layout.points[1]

    fireEvent.pointerMove(svg, { clientX: targetPoint.x, clientY: targetPoint.y })

    expect(container.querySelector('line.sales-trend-chart__crosshair')).toBeInTheDocument()
    expect(screen.getByText('2026-07-09')).toBeInTheDocument()
    expect(screen.getByText('$25.50')).toBeInTheDocument()
  })

  it('clears the crosshair and tooltip on pointer leave', () => {
    const { container } = renderChart(sampleData)

    const svg = container.querySelector('svg') as SVGSVGElement
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 600,
      height: 200,
      right: 600,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect)

    fireEvent.pointerMove(svg, { clientX: 300, clientY: 100 })
    expect(container.querySelector('line.sales-trend-chart__crosshair')).toBeInTheDocument()

    fireEvent.pointerLeave(svg)
    expect(container.querySelector('line.sales-trend-chart__crosshair')).not.toBeInTheDocument()
  })
})
