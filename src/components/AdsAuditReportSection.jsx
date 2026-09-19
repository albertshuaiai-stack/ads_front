import { useEffect, useMemo, useState } from 'react'
import { buildQueryString, requestApi } from '../lib/adsPortal'
import './AdsAuditReportSection.css'

function formatYMD(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayOffset(date, offset) {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return d
}

function buildDateRange(type) {
  const today = new Date()
  if (type === 'last7') {
    const end = today
    const start = dayOffset(today, -6)
    return { start, end }
  }
  if (type === 'last30') {
    const end = today
    const start = dayOffset(today, -29)
    return { start, end }
  }
  const end = today
  const start = dayOffset(today, -6)
  return { start, end }
}

export default function AdsAuditReportSection({ token, showOwnerFilter, ownerOptions = [], ownerOptionsLoading = false }) {
  const [dateType, setDateType] = useState('last7')
  const initialRange = useMemo(() => buildDateRange('last7'), [])
  const [startDate, setStartDate] = useState(initialRange.start)
  const [endDate, setEndDate] = useState(initialRange.end)
  const [selectedOwner, setSelectedOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [grid, setGrid] = useState({})
  const [brands, setBrands] = useState([])

  useEffect(() => {
    if (dateType === 'custom') return
    const { start, end } = buildDateRange(dateType)
    setStartDate(start)
    setEndDate(end)
  }, [dateType])

  function buildColumns(start, end) {
    const cols = []
    const s = new Date(start)
    const e = new Date(end)
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      cols.push(formatYMD(d))
    }
    return cols
  }

  async function handleSearch(event) {
    if (event) event.preventDefault()
    setLoading(true)
    setError('')
    setGrid({})
    setBrands([])

    try {
      const params = {
        startDate: formatYMD(startDate),
        endDate: formatYMD(endDate),
      }
      if (showOwnerFilter && selectedOwner) {
        params.adsOwner = selectedOwner
      }

      const response = await requestApi(`/ads-running-audit/query${buildQueryString(params)}`, { token })
      const items = Array.isArray(response) ? response : response?.content || response?.data || []

      const map = new Map()
      for (const it of items) {
        const brand = String(it.brand ?? it.Brand ?? it.brandName ?? 'Unknown')
        // use createDate as primary date field per backend contract
        const dateKey = formatYMD(it.createDate ?? it.date ?? it.reportDate ?? it.day ?? it.dateString ?? '')
        const platform = (it.platform ?? it.platformName ?? it.Platform ?? '')
        const email = (it.email ?? it.userEmail ?? it.user_email ?? it.userName ?? it.user ?? '')
        const id = it.id ?? `${brand}-${dateKey}-${platform}-${email}`
        const text = [email, platform].filter(Boolean).join(' - ')

        const entry = map.get(brand) || {}
        const list = entry[dateKey] || []
        list.push({ id, text, platform, email })
        if (dateKey) entry[dateKey] = list
        map.set(brand, entry)
      }

      setBrands(Array.from(map.keys()).sort())
      const gridObj = {}
      for (const [k, v] of map.entries()) gridObj[k] = v
      setGrid(gridObj)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const columns = useMemo(() => buildColumns(startDate, endDate), [startDate, endDate])

  useEffect(() => {
    void handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="ads-audit-report">
      <form className="filter-form" onSubmit={handleSearch}>
        <div className="filter-item">
          <label htmlFor="adsAuditDateRange">Date Range</label>
          <select id="adsAuditDateRange" value={dateType} onChange={(e) => setDateType(e.target.value)}>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {dateType === 'custom' ? (
          <>
            <div className="filter-item">
              <label htmlFor="adsAuditFrom">From</label>
              <input id="adsAuditFrom" type="date" value={formatYMD(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} />
            </div>
            <div className="filter-item">
              <label htmlFor="adsAuditTo">To</label>
              <input id="adsAuditTo" type="date" value={formatYMD(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} />
            </div>
          </>
        ) : null}

        {showOwnerFilter ? (
          <div className="filter-item">
            <label htmlFor="adsAuditOwner">Ads Owner</label>
            <select id="adsAuditOwner" value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)} disabled={ownerOptionsLoading}>
              <option value="">All owners</option>
              {ownerOptions.map((opt) => (
                <option key={opt.value ?? opt.phone ?? opt.userPhone ?? opt} value={opt.value ?? opt.phone ?? opt.userPhone ?? opt}>
                  {opt.label ?? opt.userName ?? opt.emailAddress ?? opt.value ?? opt}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </div>
      </form>

      {error ? <p className="ads-audit-report__error">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}

      <div className="ads-audit-report__table-wrap">
        <table className="ads-audit-report__table">
          <thead>
            <tr>
              <th>Brand</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr><td colSpan={columns.length + 1}>No data</td></tr>
            ) : brands.map((brand) => (
              <tr key={brand}>
                <td>{brand}</td>
                {columns.map((col) => {
                  const cell = grid[brand] && grid[brand][col] ? grid[brand][col] : null
                  if (!cell) {
                    return <td key={`${brand}-${col}`}></td>
                  }

                  // cell is an array of entries now
                  const entries = Array.isArray(cell) ? cell : [cell]

                  return (
                    <td key={`${brand}-${col}`}>
                      {entries.map((entry) => {
                        const platform = (entry.platform || '').toString()
                        const email = (entry.email || '').toString()
                        const lc = platform.toLowerCase()
                        let bg = ''
                        if (lc.includes('google')) bg = '#4285F4'
                        else if (lc.includes('facebook')) bg = '#4267B2'
                        else if (lc.includes('tiktok')) bg = '#00F2EA'

                        const style = bg ? { backgroundColor: bg, color: '#fff', padding: '4px 6px', marginBottom: '4px', display: 'inline-block', borderRadius: 4 } : { padding: '2px 0' }

                        return (
                          <div key={entry.id || entry.text} className={bg ? 'ads-audit-report__cell-entry ads-audit-report__cell-highlight' : 'ads-audit-report__cell-entry'} style={style}>
                            {entry.text}
                          </div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}