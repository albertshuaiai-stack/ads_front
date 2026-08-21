import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../../lib/adsPortal'
import './IncomeExpenditureReportSection.css'

const DEFAULT_EXCHANGE_RATE = 7
const FINANCE_SERIES = [
  { key: 'income', label: 'Income', color: '#22c55e' },
  { key: 'expenditure', label: 'Expenditure', color: '#ef4444' },
  { key: 'earning', label: 'Earning', color: '#eab308' },
]

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeCurrency(value) {
  return String(value ?? '').trim().toUpperCase()
}

function resolveExchangeRate(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXCHANGE_RATE
}

function convertCurrencyAmount(value, itemCurrency, displayCurrency, exchangeRate) {
  const amount = toNumber(value)
  const normalizedItemCurrency = normalizeCurrency(itemCurrency)
  const normalizedDisplayCurrency = normalizeCurrency(displayCurrency)

  if (!normalizedItemCurrency || normalizedItemCurrency === normalizedDisplayCurrency) {
    return amount
  }

  if (normalizedDisplayCurrency === 'USD' && normalizedItemCurrency === 'CNY') {
    return amount / exchangeRate
  }

  if (normalizedDisplayCurrency === 'CNY' && normalizedItemCurrency === 'USD') {
    return amount * exchangeRate
  }

  return amount
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

function normalizeItems(incomes, outcomes, displayCurrency, exchangeRate) {
  const monthlyMap = new Map()

  ;(Array.isArray(incomes) ? incomes : []).forEach((item) => {
    const month = toMonthKey(item?.payoutDate || item?.createDate)
    if (!month) {
      return
    }

    const current = monthlyMap.get(month) || { month, income: 0, expenditure: 0 }
    current.income += convertCurrencyAmount(
      item?.incomeAmount,
      item?.currency,
      displayCurrency,
      exchangeRate,
    )
    monthlyMap.set(month, current)
  })

  ;(Array.isArray(outcomes) ? outcomes : []).forEach((item) => {
    const month = toMonthKey(item?.payDate || item?.createDate)
    if (!month) {
      return
    }

    const current = monthlyMap.get(month) || { month, income: 0, expenditure: 0 }
    current.expenditure += convertCurrencyAmount(
      item?.outcomeAmount,
      item?.currency,
      displayCurrency,
      exchangeRate,
    )
    monthlyMap.set(month, current)
  })

  return Array.from(monthlyMap.values())
    .map((item) => ({
      ...item,
      earning: item.income - item.expenditure,
    }))
    .sort((left, right) => left.month.localeCompare(right.month))
}

function normalizeGroupName(value) {
  const name = String(value ?? '').trim()
  return name || 'Unknown'
}

function buildIncomeTotalsByGroup(incomes, groupKey, displayCurrency, exchangeRate) {
  const groupedTotals = new Map()

  ;(Array.isArray(incomes) ? incomes : []).forEach((item) => {
    const groupName = normalizeGroupName(item?.[groupKey])
    const amount = convertCurrencyAmount(
      item?.incomeAmount,
      item?.currency,
      displayCurrency,
      exchangeRate,
    )

    groupedTotals.set(groupName, toNumber(groupedTotals.get(groupName)) + amount)
  })

  return Array.from(groupedTotals.entries())
    .sort((left, right) => {
      return left[0].localeCompare(right[0])
    })
    .map(([label, value]) => ({
      label,
      value,
    }))
}

function buildMonthlyIncomeTotals(incomes, displayCurrency, exchangeRate) {
  const monthlyTotals = new Map()

  ;(Array.isArray(incomes) ? incomes : []).forEach((item) => {
    const month = toMonthKey(item?.payoutDate || item?.createDate)
    if (!month) {
      return
    }

    const amount = convertCurrencyAmount(
      item?.incomeAmount,
      item?.currency,
      displayCurrency,
      exchangeRate,
    )

    monthlyTotals.set(month, toNumber(monthlyTotals.get(month)) + amount)
  })

  return Array.from(monthlyTotals.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({
      label,
      value,
    }))
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

function CombinedFinanceChart({
  items,
  showColumns,
  showLine,
  showIncome,
  showExpenditure,
  showEarning,
  displayCurrency,
  onShowColumnsChange,
  onShowLineChange,
  onShowIncomeChange,
  onShowExpenditureChange,
  onShowEarningChange,
}) {
  const visibleSeries = FINANCE_SERIES.filter((series) => {
    if (series.key === 'income') {
      return showIncome
    }

    if (series.key === 'expenditure') {
      return showExpenditure
    }

    return showEarning
  })
  const chartHeight = 300
  const chartTop = 20
  const chartLeft = 64
  const chartBottom = 104
  const chartRight = 24
  const groupGap = 26
  const barWidth = 26
  const barGap = 0
  const groupWidth = barWidth * Math.max(visibleSeries.length, 1) + barGap * Math.max(visibleSeries.length - 1, 0)
  const plotWidth = Math.max(items.length * (groupWidth + groupGap), 380)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const values = items.flatMap((item) => visibleSeries.map((series) => item[series.key]))
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
  const linePointsBySeries = visibleSeries.reduce((pointsMap, series, seriesIndex) => {
    pointsMap[series.key] = items.map((item, index) => {
      const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
      const pointX = groupX + (barWidth + barGap) * seriesIndex + barWidth / 2
      return `${pointX},${toY(item[series.key])}`
    })
    return pointsMap
  }, {})

  return (
    <>
      <div className="income-expenditure-report__chart-toolbar">
        <div className="income-expenditure-report__control-group">
          <span className="income-expenditure-report__control-label">Display Type:</span>
          <div className="income-expenditure-report__control-options">
            <label className="income-expenditure-report__toggle">
              <input
                type="checkbox"
                checked={showColumns}
                onChange={(event) => onShowColumnsChange(event.target.checked)}
              />
              <span>Column</span>
            </label>
            <label className="income-expenditure-report__toggle">
              <input
                type="checkbox"
                checked={showLine}
                onChange={(event) => onShowLineChange(event.target.checked)}
              />
              <span>Line</span>
            </label>
          </div>
        </div>
        <div className="income-expenditure-report__control-group">
          <span className="income-expenditure-report__control-label">Display Items:</span>
          <div className="income-expenditure-report__control-options">
            <label className="income-expenditure-report__toggle">
              <input
                type="checkbox"
                checked={showIncome}
                onChange={(event) => onShowIncomeChange(event.target.checked)}
              />
              <span>Income</span>
            </label>
            <label className="income-expenditure-report__toggle">
              <input
                type="checkbox"
                checked={showExpenditure}
                onChange={(event) => onShowExpenditureChange(event.target.checked)}
              />
              <span>Expenditure</span>
            </label>
            <label className="income-expenditure-report__toggle">
              <input
                type="checkbox"
                checked={showEarning}
                onChange={(event) => onShowEarningChange(event.target.checked)}
              />
              <span>Earnings</span>
            </label>
          </div>
        </div>
      </div>

      <div className="income-expenditure-report__legend">
        {visibleSeries.map((series) => (
          <span className="income-expenditure-report__legend-item" key={series.key}>
            <span
              className="income-expenditure-report__legend-swatch"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </span>
        ))}
      </div>

      {items.length === 0 ? <p className="income-expenditure-report__empty">No report data available.</p> : null}
      {items.length > 0 && !showColumns && !showLine ? (
        <p className="income-expenditure-report__empty">
          Enable at least one chart type to display the report.
        </p>
      ) : null}
      {items.length > 0 && visibleSeries.length === 0 ? (
        <p className="income-expenditure-report__empty">
          Enable at least one data series to display the report.
        </p>
      ) : null}

      {items.length > 0 && (showColumns || showLine) && visibleSeries.length > 0 ? (
        <div className="income-expenditure-report__chart-wrap">
          <svg
            className="income-expenditure-report__chart"
            width={svgWidth}
            height={svgHeight}
            role="img"
            aria-label={`Income and expenditure report chart in ${displayCurrency}`}
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

                  return (
                    <g key={`bars-${item.month}`}>
                      {visibleSeries.map((series, seriesIndex) => {
                        const value = item[series.key]
                        const valueY = toY(Math.max(value, 0))
                        const valueBaseY = toY(Math.min(value, 0))

                        return (
                             <g key={`${item.month}-${series.key}`}>
                               <rect
                                 x={groupX + seriesIndex * (barWidth + barGap)}
                                 y={Math.min(valueY, valueBaseY)}
                                 width={barWidth}
                                 height={Math.max(Math.abs(valueBaseY - valueY), 1)}
                                 fill={series.color}
                               >
                                 <title>{`${item.month}\n${series.label}: ${formatValue(value)}`}</title>
                               </rect>
                               <text
                                 x={groupX + seriesIndex * (barWidth + barGap) + barWidth / 2}
                                 y={value >= 0 ? Math.max(valueY - 6, chartTop + 12) : Math.min(valueBaseY + 14, chartTop + chartHeight - 6)}
                                 textAnchor="middle"
                                 className="income-expenditure-report__bar-label"
                               >
                                 {formatValue(value)}
                               </text>
                             </g>
                           )
                         })}
                    </g>
                  )
                })
              : null}

            {showLine ? (
              <>
                {visibleSeries.map((series, seriesIndex) => (
                  <g key={`line-${series.key}`}>
                    <polyline
                      fill="none"
                      stroke={series.color}
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={linePointsBySeries[series.key].join(' ')}
                    />
                    {items.map((item, index) => {
                      const groupX = chartLeft + index * (groupWidth + groupGap) + groupGap / 2
                      const pointX = groupX + seriesIndex * (barWidth + barGap) + barWidth / 2
                      const pointY = toY(item[series.key])

                      return (
                        <circle
                          key={`point-${item.month}-${series.key}`}
                          cx={pointX}
                          cy={pointY}
                          r="5"
                          fill={series.color}
                        >
                          <title>{`${item.month}\n${series.label}: ${formatValue(item[series.key])}`}</title>
                        </circle>
                      )
                    })}
                  </g>
                ))}
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
              Amount ({displayCurrency})
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
      ) : null}

      <div className="income-expenditure-report__summary">
        {showIncome ? (
          <span
            className="income-expenditure-report__summary-chip"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', borderColor: 'rgba(34, 197, 94, 0.28)' }}
          >
            Income: {formatValue(incomeTotal)} {displayCurrency}
          </span>
        ) : null}
        {showExpenditure ? (
          <span
            className="income-expenditure-report__summary-chip"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.28)' }}
          >
            Expenditure: {formatValue(expenditureTotal)} {displayCurrency}
          </span>
        ) : null}
        {showEarning ? (
          <span
            className="income-expenditure-report__summary-chip"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.14)', borderColor: 'rgba(234, 179, 8, 0.34)' }}
          >
            Earning: {formatValue(earningTotal)} {displayCurrency}
          </span>
        ) : null}
      </div>
    </>
  )
}

function IncomeValueChart({
  title,
  description,
  items,
  displayCurrency,
  xAxisLabel,
  showColumns = true,
  showLine = false,
}) {
  if (items.length === 0) {
    return (
      <div className="income-expenditure-report__card">
        <div className="income-expenditure-report__card-header">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        <p className="income-expenditure-report__empty">No income data available.</p>
      </div>
    )
  }

  const chartHeight = 300
  const chartTop = 20
  const chartLeft = 64
  const chartBottom = 110
  const chartRight = 24
  const itemGap = 28
  const barWidth = 32
  const plotWidth = Math.max(items.length * (barWidth + itemGap), 380)
  const svgWidth = chartLeft + chartRight + plotWidth
  const svgHeight = chartTop + chartHeight + chartBottom
  const maxValue = Math.max(...items.map((item) => toNumber(item.value)), 1)
  const yTicks = 5
  const overallTotal = items.reduce((sum, item) => sum + toNumber(item.value), 0)
  const linePoints = items.map((item, index) => {
    const x = chartLeft + index * (barWidth + itemGap) + itemGap / 2 + barWidth / 2
    const y = chartTop + chartHeight - (toNumber(item.value) / maxValue) * chartHeight
    return `${x},${y}`
  })

  return (
    <div className="income-expenditure-report__card">
      <div className="income-expenditure-report__card-header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="income-expenditure-report__chart-wrap">
        <svg
          className="income-expenditure-report__chart"
          width={svgWidth}
          height={svgHeight}
          role="img"
          aria-label={`${title} grouped income chart in ${displayCurrency}`}
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
            ? items.map((item, itemIndex) => {
                const value = toNumber(item.value)
                const barHeight = (value / maxValue) * chartHeight
                const x = chartLeft + itemIndex * (barWidth + itemGap) + itemGap / 2
                const y = chartTop + chartHeight - barHeight

                return (
                  <g key={`${title}-bar-${item.label}`}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 1)}
                      rx="6"
                      ry="6"
                      fill="rgba(37, 99, 235, 0.35)"
                      stroke="#2563eb"
                      strokeWidth="1"
                    >
                      <title>{`${item.label}\nIncome: ${formatValue(value)} ${displayCurrency}`}</title>
                    </rect>
                    <text
                      x={x + barWidth / 2}
                      y={Math.max(y - 6, chartTop + 12)}
                      textAnchor="middle"
                      className="income-expenditure-report__bar-label"
                    >
                      {value > 0 ? formatValue(value) : ''}
                    </text>
                  </g>
                )
              })
            : null}

          {showLine ? (
            <>
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={linePoints.join(' ')}
            />
            {items.map((item, itemIndex) => {
              const value = toNumber(item.value)
              const x = chartLeft + itemIndex * (barWidth + itemGap) + itemGap / 2 + barWidth / 2
              const y = chartTop + chartHeight - (value / maxValue) * chartHeight

              return (
                <g key={`${title}-line-${item.label}`}>
                  <circle cx={x} cy={y} r="5" fill="#2563eb">
                    <title>{`${item.label}\nIncome: ${formatValue(value)} ${displayCurrency}`}</title>
                  </circle>
                  <text
                    x={x}
                    y={Math.max(y - 8, chartTop + 12)}
                    textAnchor="middle"
                    className="income-expenditure-report__bar-label"
                  >
                    {value > 0 ? formatValue(value) : ''}
                  </text>
                  <text
                    x={x}
                    y={chartTop + chartHeight + 18}
                    textAnchor="end"
                    transform={`rotate(-32 ${x} ${chartTop + chartHeight + 18})`}
                    className="income-expenditure-report__x-label"
                  >
                    {item.label}
                  </text>
                </g>
              )
            })}
            </>
          ) : null}

          {!showLine
            ? items.map((item, itemIndex) => {
                const x = chartLeft + itemIndex * (barWidth + itemGap) + itemGap / 2 + barWidth / 2

                return (
                  <text
                    key={`${title}-label-${item.label}`}
                    x={x}
                    y={chartTop + chartHeight + 18}
                    textAnchor="end"
                    transform={`rotate(-32 ${x} ${chartTop + chartHeight + 18})`}
                    className="income-expenditure-report__x-label"
                  >
                    {item.label}
                  </text>
                )
              })
            : null}

          <text
          x={18}
            y={chartTop + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 18 ${chartTop + chartHeight / 2})`}
            className="income-expenditure-report__axis-label"
          >
            Income ({displayCurrency})
          </text>
          <text
            x={chartLeft + plotWidth / 2}
            y={svgHeight - 18}
            textAnchor="middle"
            className="income-expenditure-report__axis-label"
          >
            {xAxisLabel}
          </text>
        </svg>
      </div>

      <div className="income-expenditure-report__summary">
        <span className="income-expenditure-report__summary-chip">
          Total Income: {formatValue(overallTotal)} {displayCurrency}
        </span>
      </div>
    </div>
  )
}

function IncomeExpenditureReportSection({ token, currencyExchangeRateValue }) {
  const [incomes, setIncomes] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [showColumns, setShowColumns] = useState(true)
  const [showLine, setShowLine] = useState(true)
  const [showIncome, setShowIncome] = useState(true)
  const [showExpenditure, setShowExpenditure] = useState(true)
  const [showEarning, setShowEarning] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState('USD')

  const exchangeRate = useMemo(
    () => resolveExchangeRate(currencyExchangeRateValue),
    [currencyExchangeRateValue],
  )

  const items = useMemo(
    () => normalizeItems(incomes, outcomes, displayCurrency, exchangeRate),
    [displayCurrency, exchangeRate, incomes, outcomes],
  )
  const incomeByUser = useMemo(
    () => buildIncomeTotalsByGroup(incomes, 'userName', displayCurrency, exchangeRate),
    [displayCurrency, exchangeRate, incomes],
  )
  const incomeByPlatform = useMemo(
    () => buildIncomeTotalsByGroup(incomes, 'platformName', displayCurrency, exchangeRate),
    [displayCurrency, exchangeRate, incomes],
  )
  const incomeByMonth = useMemo(
    () => buildMonthlyIncomeTotals(incomes, displayCurrency, exchangeRate),
    [displayCurrency, exchangeRate, incomes],
  )

  const loadReport = useCallback(async () => {
    setReportLoading(true)
    setReportError('')

    try {
      const [loadedIncomes, loadedOutcomes] = await Promise.all([
        loadAllPagedItems('/tool-incomes', token),
        loadAllPagedItems('/tool-outcomes', token),
      ])
      setIncomes(loadedIncomes)
      setOutcomes(loadedOutcomes)
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
          the column and line chart layers, and convert all report amounts into a single currency.
        </p>

        <div className="income-expenditure-report__controls">
          <div className="income-expenditure-report__currency-group" role="radiogroup" aria-label="Display currency">
            <span className="income-expenditure-report__currency-label">Display Currency</span>
            <label className="income-expenditure-report__radio">
              <input
                type="radio"
                name="incomeExpenditureDisplayCurrency"
                value="USD"
                checked={displayCurrency === 'USD'}
                onChange={(event) => setDisplayCurrency(event.target.value)}
              />
              <span>USD</span>
            </label>
            <label className="income-expenditure-report__radio">
              <input
                type="radio"
                name="incomeExpenditureDisplayCurrency"
                value="CNY"
                checked={displayCurrency === 'CNY'}
                onChange={(event) => setDisplayCurrency(event.target.value)}
              />
              <span>CNY</span>
            </label>
          </div>
        </div>
        <p className="income-expenditure-report__rate-note">
          Exchange rate USD:CNY = {formatValue(exchangeRate)}. If the endpoint rate is empty, the
          report uses the default rate {DEFAULT_EXCHANGE_RATE}.
        </p>

        {reportError ? (
          <p className="status error" role="alert">
            {reportError}
          </p>
        ) : null}
        {reportLoading ? <p>Loading income / expenditure report...</p> : null}

        <div className="income-expenditure-report__card">
          <CombinedFinanceChart
            items={items}
            showColumns={showColumns}
            showLine={showLine}
            showIncome={showIncome}
            showExpenditure={showExpenditure}
            showEarning={showEarning}
            displayCurrency={displayCurrency}
            onShowColumnsChange={setShowColumns}
            onShowLineChange={setShowLine}
            onShowIncomeChange={setShowIncome}
            onShowExpenditureChange={setShowExpenditure}
            onShowEarningChange={setShowEarning}
          />
        </div>

        <div className="income-expenditure-report__chart-grid">
          <IncomeValueChart
            title="Income By Month"
            description="Monthly income trend grouped by month."
            items={incomeByMonth}
            displayCurrency={displayCurrency}
            xAxisLabel="Month"
            showColumns
            showLine
          />
          <IncomeValueChart
            title="Income By User Name"
            description="Total income aggregated by user name."
            items={incomeByUser}
            displayCurrency={displayCurrency}
            xAxisLabel="User Name"
          />
          <IncomeValueChart
            title="Income By Platform"
            description="Total income aggregated by platform."
            items={incomeByPlatform}
            displayCurrency={displayCurrency}
            xAxisLabel="Platform"
          />
        </div>
      </div>
    </div>
  )
}

export default IncomeExpenditureReportSection
