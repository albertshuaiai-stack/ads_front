import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../../lib/adsPortal'
import './CbAccountReportSection.css'

const STATUS_SERIES = [
  { key: 'Running', label: 'Running', color: '#22c55e' },
  { key: 'Paused', label: 'Paused', color: '#f59e0b' },
  { key: 'Locked', label: 'Locked', color: '#ef4444' },
  { key: 'Others', label: 'Others', color: '#64748b' },
]

const BALANCE_SERIES = [{ key: 'value', label: 'Total Balance', color: '#6c63ff' }]

function normalizeMetricKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function getMetricValue(item, aliases) {
  const normalizedAliases = aliases.map((alias) => normalizeMetricKey(alias))

  for (const [key, value] of Object.entries(item || {})) {
    if (normalizedAliases.includes(normalizeMetricKey(key))) {
      return value
    }
  }

  return undefined
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toDisplayNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function toPercentage(value, total) {
  if (!total) {
    return '0%'
  }

  const percentage = (value / total) * 100
  return percentage % 1 === 0 ? `${percentage.toFixed(0)}%` : `${percentage.toFixed(1)}%`
}

function normalizeAccountStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized.includes('run')) {
    return 'Running'
  }

  if (normalized.includes('pause')) {
    return 'Paused'
  }

  if (normalized.includes('lock')) {
    return 'Locked'
  }

  return 'Others'
}

function sortChartItems(items) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name))
}

function aggregateAccountCounts(accounts, labelAliases) {
  const grouped = new Map()

  ;(Array.isArray(accounts) ? accounts : []).forEach((account) => {
    const name = String(getMetricValue(account, labelAliases) ?? '').trim()
    if (!name) {
      return
    }

    const status = normalizeAccountStatus(getMetricValue(account, ['status', 'Status']))
    const current = grouped.get(name) || {
      name,
      series: {
        Running: 0,
        Paused: 0,
        Locked: 0,
        Others: 0,
      },
    }

    current.series[status] += 1
    grouped.set(name, current)
  })

  return sortChartItems(Array.from(grouped.values()))
}

function aggregateAccountBalances(accounts, labelAliases) {
  const grouped = new Map()

  ;(Array.isArray(accounts) ? accounts : []).forEach((account) => {
    const name = String(getMetricValue(account, labelAliases) ?? '').trim()
    if (!name) {
      return
    }

    const current = grouped.get(name) || {
      name,
      series: {
        value: 0,
      },
    }

    current.series.value += toNumber(getMetricValue(account, ['balance', 'Balance', 'accountBalance']))
    grouped.set(name, current)
  })

  return sortChartItems(Array.from(grouped.values()))
}

async function loadAllToolAccounts(token) {
  const pageSize = 200
  const firstResponse = await requestApi(
    `/tool-accounts${buildQueryString({ page: 0, size: pageSize })}`,
    { token },
  )
  const totalPages = Math.max(toNumber(firstResponse?.totalPages), 1)
  const allItems = [...extractItems(firstResponse)]

  for (let page = 1; page < totalPages; page += 1) {
    const response = await requestApi(
      `/tool-accounts${buildQueryString({ page, size: pageSize })}`,
      { token },
    )
    allItems.push(...extractItems(response))
  }

  return allItems
}

function buildStatusSummary(items) {
  return STATUS_SERIES.map((series) => ({
    ...series,
    value: items.reduce((sum, item) => sum + toNumber(item?.series?.[series.key]), 0),
  }))
}

function describeSeriesValue(seriesLabel, value, total) {
  return `${seriesLabel}: ${toDisplayNumber(value)} (${toPercentage(value, total)})`
}

function PieChartCard({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const circumference = 2 * Math.PI * 70
  let accumulatedLength = 0

  return (
    <div className="cb-account-report__card">
      <div className="cb-account-report__card-header">
        <div>
          <h3>CB Account Status Overview</h3>
          <p>Running, paused, locked, and other account statuses across the report data.</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="cb-account-report__empty">No status data available.</p>
      ) : (
        <>
          <div className="cb-account-report__pie-layout">
            <svg
              className="cb-account-report__pie-chart"
              width="220"
              height="220"
              viewBox="0 0 220 220"
              role="img"
              aria-label="CB account status pie chart"
            >
              <g transform="translate(110 110) rotate(-90)">
                <circle
                  cx="0"
                  cy="0"
                  r="70"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeWidth="28"
                />
                {segments.map((segment) => {
                  const length = total ? (segment.value / total) * circumference : 0
                  const dashArray = `${length} ${circumference - length}`
                  const dashOffset = -accumulatedLength
                  accumulatedLength += length

                  return (
                    <circle
                      key={segment.key}
                      cx="0"
                      cy="0"
                      r="70"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="28"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap={length > 0 ? 'butt' : 'round'}
                    >
                      <title>{describeSeriesValue(segment.label, segment.value, total)}</title>
                    </circle>
                  )
                })}
              </g>
              <text x="110" y="102" textAnchor="middle" className="cb-account-report__pie-total-label">
                Total
              </text>
              <text x="110" y="126" textAnchor="middle" className="cb-account-report__pie-total-value">
                {toDisplayNumber(total)}
              </text>
            </svg>

            <div className="cb-account-report__legend">
              {segments.map((segment) => (
                <div className="cb-account-report__legend-row" key={segment.key}>
                  <span className="cb-account-report__legend-item">
                    <span
                      className="cb-account-report__legend-swatch"
                      style={{ backgroundColor: segment.color }}
                    />
                    {segment.label}
                  </span>
                  <span className="cb-account-report__legend-value">
                    {toPercentage(segment.value, total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="cb-account-report__summary">
            {segments.map((segment) => (
              <span className="cb-account-report__summary-chip" key={segment.key}>
                {segment.label}: {toDisplayNumber(segment.value)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function buildGroupedChartTotals(items, series) {
  return series.map((entry) => ({
    ...entry,
    total: items.reduce((sum, item) => sum + toNumber(item?.series?.[entry.key]), 0),
  }))
}

function GroupedColumnChartCard({
  title,
  description,
  xAxisLabel,
  yAxisLabel,
  items,
  series,
}) {
  if (items.length === 0) {
    return (
      <div className="cb-account-report__card">
        <div className="cb-account-report__card-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <p className="cb-account-report__empty">No chart data available.</p>
      </div>
    )
  }

  const chartHeight = 280
  const chartTop = 20
  const chartLeft = 56
  const chartBottom = 110
  const chartRight = 24
  const barWidth = series.length === 1 ? 56 : 22
  const barGap = 10
  const groupGap = 24
  const groupWidth = series.length * barWidth + (series.length - 1) * barGap
  const plotWidth = Math.max(items.length * (groupWidth + groupGap), 360)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const maxValue = Math.max(
    ...items.flatMap((item) => series.map((entry) => toNumber(item?.series?.[entry.key]))),
    1,
  )
  const yTicks = 5
  const seriesTotals = buildGroupedChartTotals(items, series)

  return (
    <div className="cb-account-report__card">
      <div className="cb-account-report__card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div className="cb-account-report__legend">
          {series.map((entry) => (
            <span className="cb-account-report__legend-item" key={entry.key}>
              <span
                className="cb-account-report__legend-swatch"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
      </div>

      <div className="cb-account-report__chart-wrap">
        <svg
          className="cb-account-report__chart"
          width={svgWidth}
          height={svgHeight}
          role="img"
          aria-label={`${title} column chart`}
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
              <g key={`${title}-tick-${tickValue}`}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={svgWidth - chartRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
                <text x={chartLeft - 8} y={y + 4} textAnchor="end" className="cb-account-report__tick">
                  {toDisplayNumber(tickValue)}
                </text>
              </g>
            )
          })}

          {items.map((item, itemIndex) => {
            const groupX = chartLeft + itemIndex * (groupWidth + groupGap) + groupGap / 2

            return (
              <g key={`${title}-${item.name}`}>
                {series.map((entry, seriesIndex) => {
                  const value = toNumber(item?.series?.[entry.key])
                  const barHeight = (value / maxValue) * chartHeight
                  const x = groupX + seriesIndex * (barWidth + barGap)
                  const y = chartTop + chartHeight - barHeight

                  return (
                    <g key={`${item.name}-${entry.key}`}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="8"
                        ry="8"
                        fill={entry.color}
                      >
                        <title>{`${item.name}\n${entry.label}: ${toDisplayNumber(value)}`}</title>
                      </rect>
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(y - 6, chartTop + 12)}
                        textAnchor="middle"
                        className="cb-account-report__bar-label"
                      >
                        {value > 0 ? toDisplayNumber(value) : ''}
                      </text>
                    </g>
                  )
                })}
                <text
                  x={groupX + groupWidth / 2}
                  y={chartTop + chartHeight + 18}
                  textAnchor="end"
                  transform={`rotate(-32 ${groupX + groupWidth / 2} ${chartTop + chartHeight + 18})`}
                  className="cb-account-report__x-label"
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
            className="cb-account-report__axis-label"
          >
            {yAxisLabel}
          </text>
          <text
            x={chartLeft + plotWidth / 2}
            y={svgHeight - 18}
            textAnchor="middle"
            className="cb-account-report__axis-label"
          >
            {xAxisLabel}
          </text>
        </svg>
      </div>

      <div className="cb-account-report__summary">
        {seriesTotals.map((entry) => (
          <span className="cb-account-report__summary-chip" key={`${title}-${entry.key}`}>
            {entry.label}: {toDisplayNumber(entry.total)}
          </span>
        ))}
      </div>
    </div>
  )
}

function CbAccountReportSection({ token }) {
  const [reportData, setReportData] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  const loadReport = useCallback(async () => {
    setReportLoading(true)
    setReportError('')

    try {
      const response = await loadAllToolAccounts(token)
      setReportData(Array.isArray(response) ? response : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setReportError(message)
    } finally {
      setReportLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadReport()
  }, [loadReport])

  const accountByUserName = useMemo(
    () => aggregateAccountCounts(reportData, ['userName', 'User Name']),
    [reportData],
  )
  const accountByPlatform = useMemo(
    () => aggregateAccountCounts(reportData, ['platformName', 'Platform Name']),
    [reportData],
  )
  const balanceByUserName = useMemo(
    () => aggregateAccountBalances(reportData, ['userName', 'User Name']),
    [reportData],
  )
  const balanceByUserPlatform = useMemo(
    () => aggregateAccountBalances(reportData, ['platformName', 'Platform Name']),
    [reportData],
  )
  const statusSummary = useMemo(() => {
    const sourceItems = accountByUserName.length > 0 ? accountByUserName : accountByPlatform
    return buildStatusSummary(sourceItems)
  }, [accountByPlatform, accountByUserName])

  return (
    <div className="panel cb-account-report">
      <div className="user-list cb-account-report">
        <div className="list-header">
          <h3>CB Account Report</h3>
          <div className="toolbar-actions">
            <button type="button" className="secondary" onClick={() => void loadReport()} disabled={reportLoading}>
              {reportLoading ? 'Loading...' : 'Reload'}
            </button>
          </div>
        </div>

        <p className="cb-account-report__intro">
          Status and balance breakdowns for cash back accounts by user and by platform. Hover chart
          segments or bars to inspect detailed values.
        </p>

        {reportError ? (
          <p className="status error" role="alert">
            {reportError}
          </p>
        ) : null}
        {reportLoading ? <p>Loading CB Account report...</p> : null}

        <div className="cb-account-report__stack">
          <div className="cb-account-report__row cb-account-report__row--single">
            <PieChartCard segments={statusSummary} />
          </div>

          <div className="cb-account-report__row">
            <GroupedColumnChartCard
              title="Accounts By User Name"
              description="Account status counts for each user."
              xAxisLabel="User Name"
              yAxisLabel="Account Count"
              items={accountByUserName}
              series={STATUS_SERIES}
            />
            <GroupedColumnChartCard
              title="Accounts By Platform"
              description="Account status counts for each platform."
              xAxisLabel="Platform Name"
              yAxisLabel="Account Count"
              items={accountByPlatform}
              series={STATUS_SERIES}
            />
          </div>

          <div className="cb-account-report__row">
            <GroupedColumnChartCard
              title="Balance By User Name"
              description="Total balance aggregated by user."
              xAxisLabel="User Name"
              yAxisLabel="Total Balance"
              items={balanceByUserName}
              series={BALANCE_SERIES}
            />
            <GroupedColumnChartCard
              title="Balance By Platform"
              description="Total balance aggregated by platform."
              xAxisLabel="Platform Name"
              yAxisLabel="Total Balance"
              items={balanceByUserPlatform}
              series={BALANCE_SERIES}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CbAccountReportSection
