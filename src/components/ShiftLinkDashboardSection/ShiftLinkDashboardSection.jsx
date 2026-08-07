import { useCallback, useEffect, useState } from 'react'
import { requestApi } from '../../lib/adsPortal'
import './ShiftLinkDashboardSection.css'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function firstMetric(item, keys) {
  for (const key of keys) {
    const value = toNumber(item?.[key])
    if (value !== undefined) {
      return value
    }
  }

  return undefined
}

function normalizeChartItems(items, totalKeys, consumedKeys, remainingKeys) {
  return (items || [])
    .map((item) => {
      const total = firstMetric(item, totalKeys)
      const consumed = firstMetric(item, consumedKeys) || 0
      const remaining = firstMetric(item, remainingKeys)
      const resolvedTotal =
        total !== undefined ? total : consumed + (remaining !== undefined ? remaining : 0)
      const resolvedRemaining =
        remaining !== undefined ? remaining : Math.max(resolvedTotal - consumed, 0)

      return {
        name: String(item?.['Campaign Name'] ?? '').trim(),
        total: resolvedTotal,
        consumed,
        remaining: resolvedRemaining,
      }
    })
    .filter((item) => item.name && item.total > 0)
}

function formatMetric(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatPercentage(value, total) {
  if (!total) {
    return '0%'
  }

  const percentage = (value / total) * 100
  const rounded = percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(1)
  return `${rounded}%`
}

function buildTooltip(metricLabel, item) {
  return [
    item.name,
    `Total ${metricLabel}: ${formatMetric(item.total)}`,
    `Consumed: ${formatMetric(item.consumed)} (${formatPercentage(item.consumed, item.total)})`,
    `To Be Consumed: ${formatMetric(item.remaining)} (${formatPercentage(item.remaining, item.total)})`,
  ].join('\n')
}

function StackedColumnChart({ title, description, metricLabel, items }) {
  if (items.length === 0) {
    return (
      <div className="shift-link-dashboard__card">
        <div className="shift-link-dashboard__card-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <p className="shift-link-dashboard__empty">No dashboard data available.</p>
      </div>
    )
  }

  const chartHeight = 280
  const chartTop = 20
  const chartLeft = 56
  const chartBottom = 108
  const chartRight = 24
  const barWidth = 46
  const barGap = 28
  const maxValue = Math.max(...items.map((item) => item.total), 1)
  const plotWidth = Math.max(items.length * (barWidth + barGap), 360)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const yTicks = 5

  const totals = items.reduce(
    (summary, item) => ({
      total: summary.total + item.total,
      consumed: summary.consumed + item.consumed,
      remaining: summary.remaining + item.remaining,
    }),
    { total: 0, consumed: 0, remaining: 0 },
  )

  return (
    <div className="shift-link-dashboard__card">
      <div className="shift-link-dashboard__card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="shift-link-dashboard__legend">
          <span className="shift-link-dashboard__legend-item">
            <span className="shift-link-dashboard__legend-swatch shift-link-dashboard__legend-swatch--consumed" />
            Consumed
          </span>
          <span className="shift-link-dashboard__legend-item">
            <span className="shift-link-dashboard__legend-swatch shift-link-dashboard__legend-swatch--remaining" />
            To Be Consumed
          </span>
        </div>
      </div>

      <div className="shift-link-dashboard__chart-wrap">
        <svg
          className="shift-link-dashboard__chart"
          width={svgWidth}
          height={svgHeight}
          role="img"
          aria-label={`${title} stacked column chart`}
        >
          <line
            x1={chartLeft}
            y1={chartTop}
            x2={chartLeft}
            y2={chartTop + chartHeight}
            stroke="var(--border)"
            strokeWidth="1"
          />
          <line
            x1={chartLeft}
            y1={chartTop + chartHeight}
            x2={svgWidth - chartRight}
            y2={chartTop + chartHeight}
            stroke="var(--border)"
            strokeWidth="1"
          />

          {Array.from({ length: yTicks + 1 }, (_, index) => {
            const tickValue = (maxValue / yTicks) * (yTicks - index)
            const y = chartTop + (chartHeight / yTicks) * index

            return (
              <g key={tickValue}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={svgWidth - chartRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
                <text x={chartLeft - 8} y={y + 4} textAnchor="end" className="shift-link-dashboard__tick">
                  {formatMetric(tickValue)}
                </text>
              </g>
            )
          })}

          {items.map((item, index) => {
            const x = chartLeft + index * (barWidth + barGap) + barGap / 2
            const totalHeight = (item.total / maxValue) * chartHeight
            const consumedHeight = (item.consumed / maxValue) * chartHeight
            const remainingHeight = (item.remaining / maxValue) * chartHeight
            const totalY = chartTop + chartHeight - totalHeight
            const remainingY = chartTop + chartHeight - totalHeight
            const consumedY = chartTop + chartHeight - consumedHeight

            return (
              <g key={item.name}>
                <rect
                  x={x}
                  y={remainingY}
                  width={barWidth}
                  height={remainingHeight}
                  rx="8"
                  ry="8"
                  fill="#49b3ff"
                >
                  <title>{buildTooltip(metricLabel, item)}</title>
                </rect>
                <rect
                  x={x}
                  y={consumedY}
                  width={barWidth}
                  height={consumedHeight}
                  rx="8"
                  ry="8"
                  fill="#ef4444"
                >
                  <title>{buildTooltip(metricLabel, item)}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={Math.max(totalY - 8, chartTop + 12)}
                  textAnchor="middle"
                  className="shift-link-dashboard__bar-label"
                >
                  {formatMetric(item.total)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartTop + chartHeight + 18}
                  textAnchor="end"
                  transform={`rotate(-32 ${x + barWidth / 2} ${chartTop + chartHeight + 18})`}
                  className="shift-link-dashboard__campaign-label"
                >
                  {item.name}
                </text>
              </g>
            )
          })}

          <text
            x={18}
            y={chartTop + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${chartTop + chartHeight / 2})`}
            className="shift-link-dashboard__axis-label"
          >
            {metricLabel}
          </text>
          <text
            x={chartLeft + plotWidth / 2}
            y={svgHeight - 18}
            textAnchor="middle"
            className="shift-link-dashboard__axis-label"
          >
            Campaign Name
          </text>
        </svg>
      </div>

      <div className="shift-link-dashboard__summary">
        <span className="shift-link-dashboard__summary-chip">Total {metricLabel}: {formatMetric(totals.total)}</span>
        <span className="shift-link-dashboard__summary-chip shift-link-dashboard__summary-chip--consumed">
          Consumed: {formatMetric(totals.consumed)}
        </span>
        <span className="shift-link-dashboard__summary-chip">To Be Consumed: {formatMetric(totals.remaining)}</span>
      </div>
    </div>
  )
}

function ShiftLinkDashboardSection({ token, showNormalChart = true, showMatrixChart = true }) {
  const [dashboardData, setDashboardData] = useState({ Normal: [], Matrix: [] })
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true)
    setDashboardError('')

    try {
      const response = await requestApi('/dashboard/shift-link', { token })
      setDashboardData({
        Normal: Array.isArray(response?.Normal) ? response.Normal : [],
        Matrix: Array.isArray(response?.Matrix) ? response.Matrix : [],
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setDashboardError(message)
    } finally {
      setDashboardLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const normalItems = normalizeChartItems(
    dashboardData.Normal,
    ['Total Link', 'Total Capacity', 'Capacity'],
    ['Consumed Link', 'Consumed'],
    ['To Be Consumed Link', 'To Be Consumed'],
  )
  const matrixItems = normalizeChartItems(
    dashboardData.Matrix,
    ['Total Capacity', 'Capacity', 'Total Link'],
    ['Consumed', 'Consumed Link'],
    ['To Be Consumed', 'To Be Consumed Link'],
  )

  return (
    <div className="panel shift-link-dashboard">
      <div className="user-list shift-link-dashboard">
        <div className="list-header">
          <h3>Dashboard</h3>
          <div className="toolbar-actions">
            <button type="button" className="secondary" onClick={() => void loadDashboard()} disabled={dashboardLoading}>
              {dashboardLoading ? 'Loading...' : 'Reload'}
            </button>
          </div>
        </div>
        <p className="shift-link-dashboard__intro">
          Live shift link dashboard. Hover each bar segment to inspect the consumed and remaining
          figures with percentages.
        </p>
        {dashboardError ? (
          <p className="status error" role="alert">
            {dashboardError}
          </p>
        ) : null}
        {dashboardLoading ? <p>Loading dashboard...</p> : null}

        <div className="shift-link-dashboard__grid">
          {showNormalChart ? (
            <StackedColumnChart
              title="Normal Shift Link"
              description="Total links and their consumed vs to-be-consumed distribution by campaign."
              metricLabel="Link"
              items={normalItems}
            />
          ) : null}
          {showMatrixChart ? (
            <StackedColumnChart
              title="Matrix Shift Link"
              description="Total capacity and its consumed vs to-be-consumed distribution by campaign."
              metricLabel="Capacity"
              items={matrixItems}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ShiftLinkDashboardSection
