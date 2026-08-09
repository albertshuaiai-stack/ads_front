import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../../lib/adsPortal'
import './IncomeExpenditureReportSection.css'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
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

function normalizeItems(incomes, outcomes) {
  const monthlyMap = new Map()

  ;(Array.isArray(incomes) ? incomes : []).forEach((item) => {
    const month = toMonthKey(item?.payoutDate || item?.createDate)
    if (!month) {
      return
    }

    const current = monthlyMap.get(month) || { month, income: 0, expenditure: 0 }
    current.income += toNumber(item?.incomeAmount)
    monthlyMap.set(month, current)
  })

  ;(Array.isArray(outcomes) ? outcomes : []).forEach((item) => {
    const month = toMonthKey(item?.payDate || item?.createDate)
    if (!month) {
      return
    }

    const current = monthlyMap.get(month) || { month, income: 0, expenditure: 0 }
    current.expenditure += toNumber(item?.outcomeAmount)
    monthlyMap.set(month, current)
  })

  return Array.from(monthlyMap.values())
    .map((item) => ({
      ...item,
      earning: item.income - item.expenditure,
    }))
    .sort((left, right) => left.month.localeCompare(right.month))
}

async function loadAllPagedItems(path, token) {
  const size = 200
  const firstResponse = await requestApi(`${path}${buildQueryString({ page: 0, size })}`, { token })
  const totalPages = Math.max(toNumber(firstResponse?.totalPages), 1)
  const items = [...extractItems(firstResponse)]

  for (let page = 1; page < totalPages; page += 1) {
    const response = await requestApi(`${path}${buildQueryString({ page, size })}`, { token })
    items.push(...extractItems(response))
  }

  return items
}

function CombinedFinanceChart({ items, showColumns, showLine }) {
  if (items.length === 0) {
    return <p className="income-expenditure-report__empty">No report data available.</p>
  }

  if (!showColumns && !showLine) {
    return (
      <p className="income-expenditure-report__empty">
        Enable at least one chart type to display the report.
      </p>
    )
  }

  const chartHeight = 300
  const chartTop = 20
  const chartLeft = 64
  const chartBottom = 104
  const chartRight = 24
  const groupGap = 26
  const barWidth = 26
  const barGap = 10
  const groupWidth = barWidth * 2 + barGap
  const plotWidth = Math.max(items.length * (groupWidth + groupGap), 380)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const values = items.flatMap((item) => [item.income, item.expenditure, item.earning])
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(0, ...values, 1)
  const valueRange = maxValue - minValue || 1
  const yTicks = 5
  const zeroY = chartTop + ((maxValue - 0) / valueRange) * chartHeight

  function toY(value) {
    return chartTop + ((maxValue - value) / valueRange) * chartHeight
  }

  const incomeTotal = items.reduce((sum, item) => sum + item.income, 0)
  const expenditureTotal = items.reduce((sum, item) => sum + item.expenditure, 0)
  const earningTotal = items.reduce((sum, item) => sum + item.earning, 0)
  const linePoints = items.map((item, index) => {
    const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
    return `${groupX + groupWidth / 2},${toY(item.earning)}`
  })

  return (
    <>
      <div className="income-expenditure-report__chart-wrap">
        <svg
          className="income-expenditure-report__chart"
          width={svgWidth}
          height={svgHeight}
          role="img"
          aria-label="Income and expenditure report chart"
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
            y1={zeroY}
            x2={svgWidth - chartRight}
            y2={zeroY}
            stroke="var(--border)"
            strokeWidth="1"
          />

          {Array.from({ length: yTicks + 1 }, (_, index) => {
            const tickValue = maxValue - (valueRange / yTicks) * index
            const y = chartTop + (chartHeight / yTicks) * index

            return (
              <g key={`tick-${tickValue}`}>
                <line
                  x1={chartLeft}
                  y1={y}
                  x2={svgWidth - chartRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="1"
                />
                <text
                  x={chartLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="income-expenditure-report__tick"
                >
                  {formatValue(tickValue)}
                </text>
              </g>
            )
          })}

          {showColumns
            ? items.map((item, index) => {
                const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
                const incomeY = toY(Math.max(item.income, 0))
                const incomeBaseY = toY(Math.min(item.income, 0))
                const expenditureY = toY(Math.max(item.expenditure, 0))
                const expenditureBaseY = toY(Math.min(item.expenditure, 0))

                return (
                  <g key={`bars-${item.month}`}>
                    <rect
                      x={groupX}
                      y={Math.min(incomeY, incomeBaseY)}
                      width={barWidth}
                      height={Math.max(Math.abs(incomeBaseY - incomeY), 1)}
                      rx="8"
                      ry="8"
                      fill="#22c55e"
                    >
                      <title>{`${item.month}\nIncome: ${formatValue(item.income)}`}</title>
                    </rect>
                    <rect
                      x={groupX + barWidth + barGap}
                      y={Math.min(expenditureY, expenditureBaseY)}
                      width={barWidth}
                      height={Math.max(Math.abs(expenditureBaseY - expenditureY), 1)}
                      rx="8"
                      ry="8"
                      fill="#ef4444"
                    >
                      <title>{`${item.month}\nExpenditure: ${formatValue(item.expenditure)}`}</title>
                    </rect>
                  </g>
                )
              })
            : null}

          {showLine ? (
            <>
              <polyline
                fill="none"
                stroke="#6c63ff"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={linePoints.join(' ')}
              />
              {items.map((item, index) => {
                const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
                const pointX = groupX + groupWidth / 2
                const pointY = toY(item.earning)

                return (
                  <circle key={`point-${item.month}`} cx={pointX} cy={pointY} r="5" fill="#6c63ff">
                    <title>{`${item.month}\nEarning: ${formatValue(item.earning)}`}</title>
                  </circle>
                )
              })}
            </>
          ) : null}

          {items.map((item, index) => {
            const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
            return (
              <text
                key={`label-${item.month}`}
                x={groupX + groupWidth / 2}
                y={chartTop + chartHeight + 18}
                textAnchor="end"
                transform={`rotate(-32 ${groupX + groupWidth / 2} ${chartTop + chartHeight + 18})`}
                className="income-expenditure-report__x-label"
              >
                {item.month}
              </text>
            )
          })}

          <text
            x={18}
            y={chartTop + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${chartTop + chartHeight / 2})`}
            className="income-expenditure-report__axis-label"
          >
            Amount
          </text>
          <text
            x={chartLeft + plotWidth / 2}
            y={svgHeight - 18}
            textAnchor="middle"
            className="income-expenditure-report__axis-label"
          >
            Month
          </text>
        </svg>
      </div>

      <div className="income-expenditure-report__summary">
        <span className="income-expenditure-report__summary-chip">Income: {formatValue(incomeTotal)}</span>
        <span className="income-expenditure-report__summary-chip">Expenditure: {formatValue(expenditureTotal)}</span>
        <span className="income-expenditure-report__summary-chip">Earning: {formatValue(earningTotal)}</span>
      </div>
    </>
  )
}

function IncomeExpenditureReportSection({ token }) {
  const [items, setItems] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [showColumns, setShowColumns] = useState(true)
  const [showLine, setShowLine] = useState(true)

  const loadReport = useCallback(async () => {
    setReportLoading(true)
    setReportError('')

    try {
      const [incomes, outcomes] = await Promise.all([
        loadAllPagedItems('/tool-incomes', token),
        loadAllPagedItems('/tool-outcomes', token),
      ])
      setItems(normalizeItems(incomes, outcomes))
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

  const visibleTypes = useMemo(
    () => [
      showColumns ? 'Column: Income / Expenditure' : null,
      showLine ? 'Line: Earning' : null,
    ].filter(Boolean),
    [showColumns, showLine],
  )

  return (
    <div className="panel income-expenditure-report">
      <div className="user-list income-expenditure-report">
        <div className="list-header">
          <h3>Income / Expenditure Report</h3>
          <div className="toolbar-actions">
            <button type="button" className="secondary" onClick={() => void loadReport()} disabled={reportLoading}>
              {reportLoading ? 'Loading...' : 'Reload'}
            </button>
          </div>
        </div>

        <p className="income-expenditure-report__intro">
          Monthly income, expenditure, and earning trends. Use the switches below to show or hide
          the column and line chart layers.
        </p>

        <div className="income-expenditure-report__controls">
          <label className="income-expenditure-report__toggle">
            <input
              type="checkbox"
              checked={showColumns}
              onChange={(event) => setShowColumns(event.target.checked)}
            />
            <span>Show Column Chart</span>
          </label>
          <label className="income-expenditure-report__toggle">
            <input
              type="checkbox"
              checked={showLine}
              onChange={(event) => setShowLine(event.target.checked)}
            />
            <span>Show Line Chart</span>
          </label>
          <span className="income-expenditure-report__visible-types">
            {visibleTypes.length > 0 ? visibleTypes.join(' | ') : 'No chart type selected'}
          </span>
        </div>

        {reportError ? (
          <p className="status error" role="alert">
            {reportError}
          </p>
        ) : null}
        {reportLoading ? <p>Loading income / expenditure report...</p> : null}

        <div className="income-expenditure-report__card">
          <CombinedFinanceChart items={items} showColumns={showColumns} showLine={showLine} />
        </div>
      </div>
    </div>
  )
}

export default IncomeExpenditureReportSection
