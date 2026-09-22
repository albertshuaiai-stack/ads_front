import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildOwnerQueryParams,
  buildQueryString,
  extractItems,
  firstDefinedValue,
  requestApi,
  toOptionalTrimmedString,
} from '../../lib/adsPortal'
import { OUTCOME_TYPE_OPTIONS } from '../../constants/options'
import { toApiDateValue } from '../../utils/formatters'
import './ExpenditureReportSection.css'

const PAY_TYPE_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
]

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDefaultRange() {
  const endDate = new Date()
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1)
  return {
    startDate: formatDateInputValue(startDate),
    endDate: formatDateInputValue(endDate),
  }
}

function toMonthKey(value) {
  const text = String(value ?? '').trim()
  if (!text) {
    return ''
  }

  const directMatch = text.match(/(\d{4})[-/](\d{1,2})/)
  if (directMatch) {
    return `${directMatch[1]}-${directMatch[2].padStart(2, '0')}`
  }

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

function normalizeComparableKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function formatAmount(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function resolvePayTypeLabel(value) {
  const fallback = toOptionalTrimmedString(value) || 'Others'
  const normalizedFallback = normalizeComparableKey(fallback)
  const matchedOption = OUTCOME_TYPE_OPTIONS.find((option) => {
    return (
      normalizeComparableKey(option.value) === normalizedFallback ||
      normalizeComparableKey(option.label) === normalizedFallback
    )
  })

  return matchedOption ? matchedOption.label : fallback
}

async function loadAllOutcomes(token, filters) {
  const size = 200
  const query = {
    payDateBegin: toApiDateValue(filters.startDate),
    payDateEnd: toApiDateValue(filters.endDate),
    ...buildOwnerQueryParams(filters.selectedOwner),
    page: 0,
    size,
  }
  const firstResponse = await requestApi(`/tool-outcomes${buildQueryString(query)}`, { token })
  const totalPages = Math.max(toNumber(firstResponse?.totalPages), 1)
  const items = [...extractItems(firstResponse)]

  for (let page = 1; page < totalPages; page += 1) {
    const response = await requestApi(
      `/tool-outcomes${buildQueryString({
        ...query,
        page,
      })}`,
      { token },
    )
    items.push(...extractItems(response))
  }

  return items
}

function buildChartModel(items) {
  const monthlyMap = new Map()
  const payTypes = new Map()

  ;(Array.isArray(items) ? items : []).forEach((item) => {
    const month = toMonthKey(firstDefinedValue(item, ['payDate', 'createDate', 'date', 'reportDate']))
    if (!month) {
      return
    }

    const payTypeLabel = resolvePayTypeLabel(
      firstDefinedValue(item, ['payType', 'PayType', 'outcomeType', 'outcomeTypeName']),
    )
    const amount = toNumber(
      firstDefinedValue(item, ['payAmount', 'PayAmount', 'outcomeAmount', 'amount']),
    )

    const current = monthlyMap.get(month) || { month, series: {} }
    current.series[payTypeLabel] = toNumber(current.series[payTypeLabel]) + amount
    monthlyMap.set(month, current)
    payTypes.set(payTypeLabel, payTypeLabel)
  })

  const series = Array.from(payTypes.values())
    .sort((left, right) => left.localeCompare(right))
    .map((label, index) => ({
      key: label,
      label,
      color: PAY_TYPE_COLORS[index % PAY_TYPE_COLORS.length],
    }))

  const chartItems = Array.from(monthlyMap.values()).sort((left, right) => left.month.localeCompare(right.month))
  const totals = series.map((entry) => ({
    ...entry,
    total: chartItems.reduce((sum, item) => sum + toNumber(item.series[entry.key]), 0),
  }))

  return { chartItems, series, totals }
}

function GroupedMonthlyColumnChart({ items, series, totals }) {
  if (items.length === 0 || series.length === 0) {
    return <p className="expenditure-report__empty">No expenditure data found for the selected time range.</p>
  }

  const chartHeight = 300
  const chartTop = 20
  const chartLeft = 64
  const chartBottom = 92
  const chartRight = 24
  const barGap = 4
  const groupGap = 26
  const barWidth =
    series.length <= 1 ? 52 : Math.max(14, Math.min(28, Math.floor(110 / Math.max(series.length, 1))))
  const groupWidth = series.length * barWidth + Math.max(series.length - 1, 0) * barGap
  const plotWidth = Math.max(items.length * (groupWidth + groupGap), 420)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const maxValue = Math.max(
    ...items.flatMap((item) => series.map((entry) => toNumber(item.series[entry.key]))),
    1,
  )
  const yTicks = 5

  return (
    <>
      <div className="expenditure-report__legend">
        {series.map((entry) => (
          <span className="expenditure-report__legend-item" key={entry.key}>
            <span className="expenditure-report__legend-swatch" style={{ backgroundColor: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>

      <div className="expenditure-report__chart-wrap">
        <svg
          className="expenditure-report__chart"
          width={svgWidth}
          height={svgHeight}
          role="img"
          aria-label="Expenditure monthly column chart"
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
              <g key={`expenditure-tick-${tickValue}`}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={svgWidth - chartRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
                <text x={chartLeft - 8} y={y + 4} textAnchor="end" className="expenditure-report__tick">
                  {formatAmount(tickValue)}
                </text>
              </g>
            )
          })}

          {items.map((item, itemIndex) => {
            const groupX = chartLeft + itemIndex * (groupWidth + groupGap) + groupGap / 2

            return (
              <g key={item.month}>
                {series.map((entry, seriesIndex) => {
                  const value = toNumber(item.series[entry.key])
                  const barHeight = (value / maxValue) * chartHeight
                  const x = groupX + seriesIndex * (barWidth + barGap)
                  const y = chartTop + chartHeight - barHeight

                  return (
                    <g key={`${item.month}-${entry.key}`}>
                      <rect x={x} y={y} width={barWidth} height={barHeight} rx="8" ry="8" fill={entry.color}>
                        <title>{`${item.month}\n${entry.label}: ${formatAmount(value)}`}</title>
                      </rect>
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(y - 6, chartTop + 12)}
                        textAnchor="middle"
                        className="expenditure-report__bar-label"
                      >
                        {value > 0 ? formatAmount(value) : ''}
                      </text>
                    </g>
                  )
                })}
                <text
                  x={groupX + groupWidth / 2}
                  y={chartTop + chartHeight + 18}
                  textAnchor="end"
                  transform={`rotate(-32 ${groupX + groupWidth / 2} ${chartTop + chartHeight + 18})`}
                  className="expenditure-report__x-label"
                >
                  {item.month}
                </text>
              </g>
            )
          })}

          <text
            x={20}
            y={chartTop + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 20 ${chartTop + chartHeight / 2})`}
            className="expenditure-report__axis-label"
          >
            Pay Amount
          </text>
          <text
            x={chartLeft + plotWidth / 2}
            y={svgHeight - 16}
            textAnchor="middle"
            className="expenditure-report__axis-label"
          >
            Year-Month
          </text>
        </svg>
      </div>

      <div className="expenditure-report__summary">
        {totals.map((entry) => (
          <span className="expenditure-report__summary-chip" key={entry.key}>
            {entry.label}: {formatAmount(entry.total)}
          </span>
        ))}
      </div>
    </>
  )
}

function ExpenditureReportSection({
  token,
  showOwnerFilter,
  ownerOptions = [],
  ownerOptionsLoading = false,
}) {
  const defaultRange = useMemo(() => createDefaultRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [selectedOwner, setSelectedOwner] = useState('')
  const [reportItems, setReportItems] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const initialFiltersRef = useRef({
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
    selectedOwner: '',
  })

  const loadReport = useCallback(
    async (filters) => {
      setReportLoading(true)
      setReportError('')

      try {
        const response = await loadAllOutcomes(token, filters)
        setReportItems(Array.isArray(response) ? response : [])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setReportError(message)
      } finally {
        setReportLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void loadReport(initialFiltersRef.current)
  }, [loadReport])

  function handleSearch(event) {
    event.preventDefault()
    void loadReport({ startDate, endDate, selectedOwner })
  }

  const { chartItems, series, totals } = useMemo(() => buildChartModel(reportItems), [reportItems])
  const grandTotal = useMemo(
    () => totals.reduce((sum, entry) => sum + toNumber(entry.total), 0),
    [totals],
  )

  return (
    <div className="panel expenditure-report">
      <div className="user-list expenditure-report">
        <div className="list-header">
          <h3>Expenditure Report</h3>
          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => void loadReport({ startDate, endDate, selectedOwner })}
              disabled={reportLoading}
            >
              {reportLoading ? 'Loading...' : 'Reload'}
            </button>
          </div>
        </div>

        <p className="expenditure-report__intro">
          Query expenditure by time range and compare monthly pay amounts across PayType categories.
        </p>

        <form className="filter-form expenditure-report__filters" onSubmit={handleSearch}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="expenditureReportOwner">Owner</label>
              <select
                id="expenditureReportOwner"
                value={selectedOwner}
                onChange={(event) => setSelectedOwner(event.target.value)}
                disabled={ownerOptionsLoading}
              >
                <option value="">All owners</option>
                {ownerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="filter-item">
            <label htmlFor="expenditureReportStartDate">From</label>
            <input
              id="expenditureReportStartDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
            />
          </div>

          <div className="filter-item">
            <label htmlFor="expenditureReportEndDate">To</label>
            <input
              id="expenditureReportEndDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={reportLoading}>
              {reportLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {reportError ? (
          <p className="status error" role="alert">
            {reportError}
          </p>
        ) : null}
        {reportLoading ? <p>Loading expenditure report...</p> : null}

        <div className="expenditure-report__card">
          <div className="expenditure-report__card-header">
            <div>
              <h3>Monthly Expenditure by PayType</h3>
              <p>The X-axis shows year and month, and the Y-axis shows the total payAmount.</p>
            </div>
            <span className="expenditure-report__total">Total: {formatAmount(grandTotal)}</span>
          </div>

          <GroupedMonthlyColumnChart items={chartItems} series={series} totals={totals} />
        </div>
      </div>
    </div>
  )
}

export default ExpenditureReportSection
