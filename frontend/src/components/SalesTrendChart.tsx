import { useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Empty, theme as antdTheme } from 'antd'
import type { SalesMetric } from '../types/analytics'
import { computeSalesChartLayout, nearestPointIndex } from './salesTrendChartMath'
import './SalesTrendChart.css'

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

const CHART_WIDTH = 640
const CHART_HEIGHT = 220
const CHART_PADDING = 36
const GRIDLINE_COUNT = 4

export interface SalesTrendChartProps {
  data: SalesMetric[]
}

/**
 * A single-series revenue-over-time line chart, hand-built as a lightweight
 * SVG component (C-26) rather than pulling in a charting library -- this
 * project's antd bundle is already flagged as large (see the
 * frontend-bundle-size-code-splitting brain note) and a single-series line
 * chart doesn't need one.
 *
 * Follows the dataviz skill's mark spec: 2px round-joined line in the
 * theme's colorPrimary (a single-hue identity use, not a categorical
 * palette -- no legend, the card title already says what's plotted), solid
 * hairline gridlines, an end-marker dot with a surface-color ring, and a
 * hover crosshair + tooltip that snaps to the nearest data point. Every
 * value is also visible without hovering via the sales table rendered
 * alongside this chart -- the hover layer is an enhancement, not a gate.
 */
export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const { token } = antdTheme.useToken()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div className="sales-trend-chart sales-trend-chart--empty">
        <Empty description="No sales in this range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  const layout = computeSalesChartLayout(data, CHART_WIDTH, CHART_HEIGHT, CHART_PADDING)
  const linePath = layout.points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')
  const lastPoint = layout.points[layout.points.length - 1]
  const hovered = hoverIndex !== null ? layout.points[hoverIndex] : null

  const gridlines = Array.from({ length: GRIDLINE_COUNT + 1 }, (_, step) => {
    const innerHeight = layout.height - layout.padding * 2
    return layout.padding + (innerHeight * step) / GRIDLINE_COUNT
  })

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const scaleX = rect.width === 0 ? 1 : layout.width / rect.width
    const svgX = (event.clientX - rect.left) * scaleX
    setHoverIndex(nearestPointIndex(layout, svgX))
  }

  function handlePointerLeave() {
    setHoverIndex(null)
  }

  // Keep the tooltip text fully inside the chart near the right edge, where
  // the end marker otherwise crowds it.
  const tooltipAnchor = hovered && hovered.x > layout.width - 140 ? 'end' : 'start'
  const tooltipX = hovered ? (tooltipAnchor === 'end' ? hovered.x - 10 : hovered.x + 10) : 0

  return (
    <div className="sales-trend-chart">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Sales trend over time"
        className="sales-trend-chart__svg"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {gridlines.map((y) => (
          <line
            key={y}
            className="sales-trend-chart__gridline"
            x1={layout.padding}
            x2={layout.width - layout.padding}
            y1={y}
            y2={y}
            stroke={token.colorBorderSecondary}
            strokeWidth={1}
          />
        ))}

        <path
          className="sales-trend-chart__line"
          d={linePath}
          fill="none"
          stroke={token.colorPrimary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* End marker: an >=8px filled dot in the line's color with a 2px
            surface-color ring, drawn as a slightly larger surface-color
            circle underneath so the dot stays legible against the line. */}
        <circle
          className="sales-trend-chart__end-marker-ring"
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={7}
          fill={token.colorBgContainer}
        />
        <circle className="sales-trend-chart__end-marker" cx={lastPoint.x} cy={lastPoint.y} r={5} fill={token.colorPrimary} />

        {hovered && (
          <>
            <line
              className="sales-trend-chart__crosshair"
              x1={hovered.x}
              x2={hovered.x}
              y1={layout.padding}
              y2={layout.height - layout.padding}
              stroke={token.colorTextTertiary}
              strokeWidth={1}
            />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill={token.colorPrimary} />
            <g className="sales-trend-chart__tooltip" textAnchor={tooltipAnchor}>
              <text x={tooltipX} y={layout.padding - 8} fill={token.colorTextSecondary} fontSize={12}>
                {hovered.date}
              </text>
              <text x={tooltipX} y={layout.padding + 10} fill={token.colorText} fontSize={13} fontWeight={600}>
                {formatCurrency(hovered.revenue)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}

export default SalesTrendChart
