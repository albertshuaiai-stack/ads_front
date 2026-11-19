import { useMemo, useRef, useState } from 'react'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import { formatDateTimeDisplayValueWithDashedDate } from '../../utils/formatters'
import './AffiliatePostBackManagementSection.css'

const TABS = [
  { id: 'click', label: 'Click' },
  { id: 'postback', label: 'Conversions' },
  { id: 'import', label: 'Historical Import' },
]

const IMPORT_PLATFORMS = ['BonusArrive', 'Yeahpromos', 'Partnerboost', 'Mylead']

function formatPercent(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const number = Number(value)
  return Number.isFinite(number) ? `${(number * 100).toFixed(2)}%` : '—'
}

function asNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2) : '—'
}

// ROAS = 佣金 / 花费, 大于 1 即回本 / commission divided by cost, above 1 means profitable
function formatRoas(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toFixed(2)}x` : '—'
}

function formatCost(amount, currency) {
  if (amount === null || amount === undefined || amount === '') {
    return '—'
  }
  return `${formatMoney(amount)} ${currency || 'USD'}`
}

// 各状态订单数, 如 "pending 10 · approved 5" / order count per status
function formatStatusCounts(counts) {
  if (!counts || typeof counts !== 'object') {
    return ''
  }
  return Object.entries(counts)
    .filter(([, count]) => asNumber(count) > 0)
    .map(([status, count]) => `${status} ${count}`)
    .join(' · ')
}

// offer 唯一键: 有商家ID用ID, 否则用名称, 与后端分组规则一致 / offer key: shop id, else name (matches backend grouping)
function offerKey(offer) {
  if (!offer) {
    return ''
  }
  if (offer.advertiserShopId) {
    return `id:${offer.advertiserShopId}`
  }
  return offer.advertiserShopName ? `name:${String(offer.advertiserShopName).toLowerCase()}` : ''
}

// 任务表列定义, id 同时作为排序字段 / normal task table columns, id doubles as the sort key
const TASK_COLUMNS = [
  { id: 'campainName', label: 'Campaign', text: true, render: (task) => formatTableValue(task.campainName) },
  { id: 'campainCountry', label: 'Country', text: true, render: (task) => formatTableValue(task.campainCountry) },
  { id: 'status', label: 'Status', text: true, render: (task) => formatTableValue(task.status) },
  { id: 'reportedClicks', label: 'Ad Clicks', render: (task) => formatTableValue(task.reportedClicks) },
  {
    id: 'orderCount',
    label: 'Orders',
    render: (task) => {
      const detail = formatStatusCounts(task.orderStatusCounts)
      return (
        <>
          {formatTableValue(task.orderCount)}
          {detail ? <small className="pb-status-counts">{detail}</small> : null}
        </>
      )
    },
  },
  { id: 'conversionRate', label: 'Conversion', render: (task) => formatPercent(task.conversionRate) },
  { id: 'adCostUsd', label: 'Ad Cost (USD)', render: (task) => formatMoney(task.adCostUsd) },
  { id: 'adCost', label: 'Ad Cost (orig)', render: (task) => formatCost(task.adCost, task.costCurrency) },
  { id: 'commission', label: 'Commission', render: (task) => formatTableValue(task.commission) },
  {
    id: 'profitUsd',
    label: 'Profit (USD)',
    className: (task) => (asNumber(task.profitUsd) < 0 ? 'pb-negative' : ''),
    render: (task) => formatMoney(task.profitUsd),
  },
  { id: 'roas', label: 'ROAS', render: (task) => formatRoas(task.roas) },
  { id: 'orderAmount', label: 'GMV', render: (task) => formatTableValue(task.orderAmount) },
  { id: 'normalAdsId', label: 'Task ID', render: (task) => formatTableValue(task.normalAdsId) },
  { id: 'advertiserId', label: 'Advertiser ID (a=)', render: (task) => formatTableValue(task.advertiserId) },
  { id: 'issuedClickIds', label: 'Links Issued', render: (task) => formatTableValue(task.issuedClickIds) },
  { id: 'matchedClickIds', label: 'Matched Click IDs', render: (task) => formatTableValue(task.matchedClickIds) },
]
const DEFAULT_TASK_COLUMN_ORDER = TASK_COLUMNS.map((column) => column.id)
const TASK_COLUMN_STORAGE_KEY = 'pb.normalTaskColumnOrder'

// 读取已保存的列顺序: 丢弃已不存在的列, 新增列补到末尾 / drop unknown ids, append newly added columns
function loadTaskColumnOrder() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TASK_COLUMN_STORAGE_KEY) || '[]')
    if (!Array.isArray(saved)) {
      return DEFAULT_TASK_COLUMN_ORDER
    }
    const known = [...new Set(saved.filter((id) => DEFAULT_TASK_COLUMN_ORDER.includes(id)))]
    return [...known, ...DEFAULT_TASK_COLUMN_ORDER.filter((id) => !known.includes(id))]
  } catch {
    return DEFAULT_TASK_COLUMN_ORDER
  }
}

function saveTaskColumnOrderToStorage(order) {
  try {
    window.localStorage.setItem(TASK_COLUMN_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // 无痕模式等无法写入时只在本次会话生效 / storage unavailable, keep the order for this session only
  }
}

function AffiliatePostBackManagementSection({
  affiliatePostBacks,
  affiliatePostBacksLoading,
  affiliatePostBacksError,
  affiliatePostBacksMessage,
  affiliatePostBackFilters,
  affiliatePostBackStatusOptions,
  affiliateSiteOptions,
  onAffiliatePostBackFiltersChange,
  onApplyAffiliatePostBackFilters,
  onReloadAffiliatePostBackFilters,
  postBackOffers,
  onFilterPostBacksByOffer,
  showOwnerFilter,
  ownerOptions,
  pagination,
  onPageChange,
  onPageSizeChange,
  postBackStats,
  postBackClickSummary,
  postBackClicks,
  postBackStatsLoading,
  postBackStatsError,
  postBackImporting,
  postBackImportMessage,
  postBackImportError,
  onReloadPostBackStats,
  onReloadClickSummary,
  onImportPostBackCsv,
  onDeletePostBack,
  onReattributePostBacks,
}) {
  const [activeTab, setActiveTab] = useState('click')
  const [csvFile, setCsvFile] = useState(null)
  const [importPlatform, setImportPlatform] = useState('BonusArrive')
  const [clickOwner, setClickOwner] = useState('')
  const [clickPlatform, setClickPlatform] = useState('')
  const [clickBrand, setClickBrand] = useState('')
  const [clickFilter, setClickFilter] = useState('all')
  const [clickSortKey, setClickSortKey] = useState('created')
  const [clickSortDir, setClickSortDir] = useState('desc')
  const [shopSort, setShopSort] = useState('default')
  const [actionError, setActionError] = useState('')
  const [reattributeMessage, setReattributeMessage] = useState('')
  // 按天/全部视图切换: Click 页签看广告日快照, Conversions 页签看订单按天明细 / daily-vs-all view toggles
  const [clicksView, setClicksView] = useState('all')
  const [statsView, setStatsView] = useState('all')
  // By day 视图选中的日期 / selected date in the By day view
  const [statsDailyDate, setStatsDailyDate] = useState('')
  const fileInputRef = useRef(null)

  const summaryClicks = useMemo(
    () => (Array.isArray(postBackClickSummary?.clicks) ? postBackClickSummary.clicks : []),
    [postBackClickSummary],
  )
  const ownerChoices = Array.isArray(postBackClickSummary?.owners) ? postBackClickSummary.owners : []
  const platformChoices = Array.isArray(postBackClickSummary?.platforms) ? postBackClickSummary.platforms : []
  const brandChoices = Array.isArray(postBackClickSummary?.brands) ? postBackClickSummary.brands : []

  const filteredClicks = useMemo(
    () => summaryClicks.filter((item) =>
      (!clickOwner || item.adsOwner === clickOwner)
      && (!clickPlatform || item.platformName === clickPlatform)
      && (!clickBrand || item.campainName === clickBrand)),
    [summaryClicks, clickOwner, clickPlatform, clickBrand],
  )

  const clickTotals = useMemo(() => {
    const taskClicks = new Map()
    filteredClicks.forEach((item) => {
      const key = item.normalAdsId ?? '__none__'
      if (!taskClicks.has(key)) {
        taskClicks.set(key, asNumber(item.campaignClicks))
      }
    })
    const perTask = [...taskClicks.values()]
    return {
      links: filteredClicks.length,
      activeTasks: perTask.filter((value) => value > 0).length,
      adClicks: perTask.reduce((sum, value) => sum + value, 0),
      clickedLinks: filteredClicks.filter((item) => asNumber(item.linkClicks) > 0).length,
      linkClicks: filteredClicks.reduce((sum, item) => sum + asNumber(item.linkClicks), 0),
      orders: filteredClicks.reduce((sum, item) => sum + asNumber(item.orderCount), 0),
      gmv: filteredClicks.reduce((sum, item) => sum + asNumber(item.orderAmount), 0),
      commission: filteredClicks.reduce((sum, item) => sum + asNumber(item.commission), 0),
    }
  }, [filteredClicks])

  const visibleClicks = useMemo(() => {
    const base = clickFilter === 'link'
      ? filteredClicks.filter((item) => asNumber(item.linkClicks) > 0)
      : filteredClicks
    const direction = clickSortDir === 'asc' ? 1 : -1
    return [...base].sort((a, b) => {
      const left = clickSortKey === 'created' ? String(a.createDate || '') : asNumber(a[clickSortKey])
      const right = clickSortKey === 'created' ? String(b.createDate || '') : asNumber(b[clickSortKey])
      return (left > right ? 1 : left < right ? -1 : 0) * direction
    })
  }, [filteredClicks, clickFilter, clickSortKey, clickSortDir])

  const CLICK_FILTER_LABELS = {
    link: 'Filter: link has clicks',
    all: 'Filter: all links',
  }

  const cycleClickFilter = () => {
    setClickFilter(clickFilter === 'link' ? 'all' : 'link')
  }

  const toggleClickSort = (key) => {
    if (clickSortKey === key) {
      setClickSortDir(clickSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setClickSortKey(key)
      setClickSortDir('desc')
    }
  }

  // 必须在 sortedTaskRows 之前声明, 否则渲染时 TDZ 报错白屏 / must be declared before sortedTaskRows (TDZ crash)
  const taskRows = useMemo(
    () => (Array.isArray(postBackStats?.tasks) ? postBackStats.tasks : []),
    [postBackStats],
  )

  // 品牌投入产出表排序 / sortable brand ROI table
  const [taskSortKey, setTaskSortKey] = useState('default')
  const [taskSortDir, setTaskSortDir] = useState('desc')

  const toggleTaskSort = (key) => {
    if (taskSortKey === key) {
      setTaskSortDir(taskSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setTaskSortKey(key)
      setTaskSortDir('desc')
    }
  }

  // 列头可拖动调整顺序, 点击排序 / drag headers to reorder, click to sort
  const [taskColumnOrder, setTaskColumnOrder] = useState(loadTaskColumnOrder)
  const [dragColumnId, setDragColumnId] = useState(null)
  const [dragOverColumnId, setDragOverColumnId] = useState(null)

  const taskColumns = useMemo(
    () => taskColumnOrder.map((id) => TASK_COLUMNS.find((column) => column.id === id)).filter(Boolean),
    [taskColumnOrder],
  )

  const applyTaskColumnOrder = (order) => {
    setTaskColumnOrder(order)
    saveTaskColumnOrderToStorage(order)
  }

  // 向右拖放到目标之后, 向左拖放到目标之前 / dropping rightwards lands after the target, leftwards before it
  const moveTaskColumn = (fromId, toId) => {
    const fromIndex = taskColumnOrder.indexOf(fromId)
    const toIndex = taskColumnOrder.indexOf(toId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return
    }
    const next = [...taskColumnOrder]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    applyTaskColumnOrder(next)
  }

  const clearTaskColumnDrag = () => {
    setDragColumnId(null)
    setDragOverColumnId(null)
  }

  const isDefaultTaskColumnOrder = taskColumnOrder.join(',') === DEFAULT_TASK_COLUMN_ORDER.join(',')

  const taskValue = (task, key) => {
    if (TASK_COLUMNS.some((column) => column.id === key && column.text)) return String(task[key] || '')
    return asNumber(task[key])
  }

  const sortedTaskRows = useMemo(() => {
    if (taskSortKey === 'default') {
      return taskRows
    }
    const direction = taskSortDir === 'asc' ? 1 : -1
    return [...taskRows].sort((a, b) => {
      const left = taskValue(a, taskSortKey)
      const right = taskValue(b, taskSortKey)
      const result = typeof left === 'string' ? left.localeCompare(right) : (left > right ? 1 : left < right ? -1 : 0)
      return result * direction
    })
  }, [taskRows, taskSortKey, taskSortDir])

  const clickSortHeader = (label, key) => (
    <button type="button" onClick={() => toggleClickSort(key)}>
      {label}{clickSortKey === key ? (clickSortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
    </button>
  )

  const sortedOrders = useMemo(() => {
    if (shopSort === 'default') {
      return affiliatePostBacks
    }
    return [...affiliatePostBacks].sort((a, b) => {
      const left = String(a.advertiserShopName || '')
      const right = String(b.advertiserShopName || '')
      const result = left.localeCompare(right)
      return shopSort === 'asc' ? result : -result
    })
  }, [affiliatePostBacks, shopSort])

  // 常量里已知平台 + 数据里实际出现过的平台, 新平台接入后自动出现在筛选里
  // known platforms plus any platform present in the data
  const networkOptions = useMemo(() => {
    const fromConstants = (affiliateSiteOptions || []).map((option) => option.value)
    const fromData = Array.isArray(postBackStats?.platforms) ? postBackStats.platforms : []
    return [...new Set([...fromConstants, ...fromData])].filter(Boolean)
  }, [affiliateSiteOptions, postBackStats])

  const handleImportSubmit = (event) => {
    event.preventDefault()
    if (!csvFile) {
      return
    }
    onImportPostBackCsv(csvFile, importPlatform)
    setCsvFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete order ${item.orderNo || item.id}?`)) {
      return
    }
    const error = await onDeletePostBack(item.id)
    setActionError(error || '')
  }

  const summaryCards = postBackStats
    ? [
        ['Normal Tasks', postBackStats.normalTaskCount],
        ['Links Issued', postBackStats.issuedClickIds],
        ['Ad Clicks (lifetime)', postBackStats.reportedClicks],
        ['Orders', postBackStats.orderCount, formatStatusCounts(postBackStats.orderStatusCounts)],
        ['Unmatched Orders', postBackStats.unmatchedOrderCount],
        ['GMV', postBackStats.orderAmount],
        ['Commission (USD)', postBackStats.commission],
        [
          'Ad Cost (USD)',
          formatMoney(postBackStats.adCostUsd),
          // 已删除任务的历史投入仍计入总花费 / spend of deleted tasks stays in the total
          asNumber(postBackStats.deletedTaskAdCostUsd) > 0
            ? `incl. ${formatMoney(postBackStats.deletedTaskAdCostUsd)} from ${postBackStats.deletedTaskCampaigns || 0} deleted task campaign(s)`
            : '',
        ],
        ['Profit (USD)', formatMoney(postBackStats.profitUsd)],
        ['ROAS', formatRoas(postBackStats.roas)],
      ]
    : []

  const platformRows = Array.isArray(postBackStats?.byPlatform) ? postBackStats.byPlatform : []
  // 后端 stats.daily: { days: [...最近7天], rows: [{date, campaignName, normalAdsId, impressions, adClicks,
  // adCostUsd, orderCount, orderAmount, commission, profitUsd, roas}] } / per-day per-offer rows
  const dailyDays = Array.isArray(postBackStats?.daily?.days) ? postBackStats.daily.days : []
  const dailyOfferRows = Array.isArray(postBackStats?.daily?.rows) ? postBackStats.daily.rows : []
  const selectedDailyDate = dailyDays.includes(statsDailyDate) ? statsDailyDate : dailyDays[dailyDays.length - 1] || ''
  const rowsForDate = useMemo(
    () => dailyOfferRows.filter((row) => row.date === selectedDailyDate),
    [dailyOfferRows, selectedDailyDate],
  )
  // 选中日期的合计行 / totals row for the selected day
  const dailyTotals = useMemo(() => {
    const totals = rowsForDate.reduce((acc, row) => ({
      impressions: acc.impressions + asNumber(row.impressions),
      adClicks: acc.adClicks + asNumber(row.adClicks),
      adCostUsd: acc.adCostUsd + asNumber(row.adCostUsd),
      orderCount: acc.orderCount + asNumber(row.orderCount),
      orderAmount: acc.orderAmount + asNumber(row.orderAmount),
      commission: acc.commission + asNumber(row.commission),
    }), { impressions: 0, adClicks: 0, adCostUsd: 0, orderCount: 0, orderAmount: 0, commission: 0 })
    totals.profitUsd = totals.commission - totals.adCostUsd
    totals.roas = totals.adCostUsd > 0 ? totals.commission / totals.adCostUsd : null
    return totals
  }, [rowsForDate])
  // Click 页签的按天表: 每个 offer 行按天汇总 / per-day totals for the Click tab
  const dailyClickRows = useMemo(() => {
    const byDay = new Map()
    dailyOfferRows.forEach((row) => {
      const agg = byDay.get(row.date) || { date: row.date, impressions: 0, adClicks: 0, adCostUsd: 0 }
      agg.impressions += asNumber(row.impressions)
      agg.adClicks += asNumber(row.adClicks)
      agg.adCostUsd += asNumber(row.adCostUsd)
      byDay.set(row.date, agg)
    })
    return [...byDay.values()].sort((a, b) => (a.date > b.date ? 1 : -1))
  }, [dailyOfferRows])
  const health = postBackStats?.attributionHealth
  const recentSubIds = Array.isArray(health?.recentSubIds) ? health.recentSubIds : []
  const healthMessage = useMemo(() => {
    if (!health) {
      return ''
    }
    if (!asNumber(health.clickTrackCount)) {
      return 'No click IDs in the ledger yet. Auto tasks must be RUNNING and generate a new link after deploying.'
    }
    if (!asNumber(health.withSubIdCount)) {
      return 'No Sub ID received from the network. Historical bills never carry one; for new orders check that the affiliate link has a subid and that the network echoes it back.'
    }
    if (!asNumber(health.matchedCount)) {
      return 'Sub IDs are arriving but none match the ledger. The network is probably returning its own click id; a mapping is needed.'
    }
    return 'Attribution is working: new orders are matched to click IDs.'
  }, [health])
  const healthOk = healthMessage.startsWith('Attribution is working')
  const unmatchedAdvertisers = Array.isArray(postBackStats?.unmatchedByAdvertiser)
    ? postBackStats.unmatchedByAdvertiser : []
  const offerRows = useMemo(() => (Array.isArray(postBackOffers) ? postBackOffers : []), [postBackOffers])
  const selectedOfferKey = affiliatePostBackFilters.advertiserShopId
    ? `id:${affiliatePostBackFilters.advertiserShopId}`
    : affiliatePostBackFilters.advertiserShopName
      ? `name:${String(affiliatePostBackFilters.advertiserShopName).toLowerCase()}`
      : ''
  const selectedOffer = offerRows.find((offer) => offerKey(offer) === selectedOfferKey) || null
  const offerTotals = useMemo(() => offerRows.reduce((acc, offer) => ({
    orders: acc.orders + asNumber(offer.orderCount),
    refunded: acc.refunded + asNumber(offer.refundedOrderCount),
    gmv: acc.gmv + asNumber(offer.orderAmount),
    commission: acc.commission + asNumber(offer.commission),
  }), { orders: 0, refunded: 0, gmv: 0, commission: 0 }), [offerRows])
  const handleOfferSelect = (key) => {
    onFilterPostBacksByOffer?.(offerRows.find((offer) => offerKey(offer) === key) || null)
  }
  const nextShopSort = shopSort === 'default' ? 'asc' : shopSort === 'asc' ? 'desc' : 'default'
  const shopSortLabel = shopSort === 'asc' ? 'A→Z' : shopSort === 'desc' ? 'Z→A' : '↕'

  return (
    <div className="panel pb-panel">
      <div className="pb-head">
        <h3>Post Back</h3>
        <span className="pb-sub">Clicks, conversions and historical bills across all networks</span>
      </div>

      <div className="pb-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`pb-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'click' ? (
        <div className="pb-section">
          <div className="pb-toolbar">
            <label className="pb-field">
              Owner
              <select value={clickOwner} onChange={(event) => setClickOwner(event.target.value)}>
                <option value="">All owners</option>
                {ownerChoices.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="pb-field">
              Ad Platform
              <select value={clickPlatform} onChange={(event) => setClickPlatform(event.target.value)}>
                <option value="">All ad platforms</option>
                {platformChoices.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="pb-field">
              Brand
              <select value={clickBrand} onChange={(event) => setClickBrand(event.target.value)}>
                <option value="">All brands</option>
                {brandChoices.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <button
              type="button"
              className="pb-btn"
              onClick={() => { setClickOwner(''); setClickPlatform(''); setClickBrand('') }}
            >
              Reset
            </button>
            <button
              type="button"
              className={`pb-btn ${clickFilter !== 'all' ? 'pb-btn-primary' : ''}`}
              onClick={cycleClickFilter}
            >
              {CLICK_FILTER_LABELS[clickFilter]}
            </button>
            <button type="button" className="pb-btn pb-btn-primary" onClick={() => onReloadClickSummary?.()}>
              Refresh
            </button>
            <span className="pb-view-toggle">
              <button
                type="button"
                className={`pb-btn ${clicksView === 'all' ? 'pb-btn-primary' : ''}`}
                onClick={() => setClicksView('all')}
              >
                All time
              </button>
              <button
                type="button"
                className={`pb-btn ${clicksView === 'daily' ? 'pb-btn-primary' : ''}`}
                onClick={() => setClicksView('daily')}
              >
                By day
              </button>
            </span>
          </div>

          <div className="pb-mini-stats">
            <span>Total links <b>{clickTotals.links}</b></span>
            <span>Clicked links <b>{clickTotals.clickedLinks}</b></span>
            <span>Link clicks <b>{clickTotals.linkClicks}</b></span>
            <span>Ad clicks (lifetime) <b>{clickTotals.adClicks}</b></span>
            <span>Orders <b>{clickTotals.orders}</b></span>
            <span>GMV <b>{clickTotals.gmv.toFixed(2)}</b></span>
            <span>Commission <b>{clickTotals.commission.toFixed(2)}</b></span>
          </div>
          {clicksView === 'all' ? (
            <>
              <p className="pb-hint">
                Link clicks = (Google Ads cumulative clicks at report time) − (click base reserved when the link
                became active), i.e. the click increment each link carried while active. When the active link reaches
                the click threshold, rotation switches to the newest link that has never been used; older unused links
                are skipped and purged by the daily housekeeping. The list contains every link that has been activated
                ({formatTableValue(postBackClickSummary?.reachedLinks)}) plus the newest 500 generated links; links that
                were never activated show 0. Ad clicks (lifetime) is the campaign total counted once
                per task, it is not a per-link value. Use the filter button to show only links with clicks; click a
                column header to sort.
              </p>

              <div className="pb-table-wrap">
                <table className="pb-table">
                  <thead>
                    <tr>
                      <th>{clickSortHeader('Click ID', 'clickId')}</th>
                      <th>Owner</th>
                      <th>Ad Platform</th>
                      <th>Brand</th>
                      <th>Task ID</th>
                      <th>{clickSortHeader('Created', 'created')}</th>
                      <th>{clickSortHeader('Link clicks', 'linkClicks')}</th>
                      <th>{clickSortHeader('Orders', 'orderCount')}</th>
                      <th>{clickSortHeader('GMV', 'orderAmount')}</th>
                      <th>{clickSortHeader('Commission', 'commission')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleClicks.length === 0 ? (
                      <tr><td className="pb-empty" colSpan={10}>
                        {clickFilter === 'link'
                          ? 'No link has been reached by the rotation yet.'
                          : 'No click IDs recorded yet.'}
                      </td></tr>
                    ) : visibleClicks.map((item) => (
                      <tr key={item.clickId}>
                        <td>{formatTableValue(item.clickId)}</td>
                        <td>{formatTableValue(item.adsOwner)}</td>
                        <td>{formatTableValue(item.platformName)}</td>
                        <td>{formatTableValue(item.campainName)}</td>
                        <td>{formatTableValue(item.normalAdsId)}</td>
                        <td>{formatDateTimeDisplayValueWithDashedDate(item.createDate)}</td>
                        <td>{formatTableValue(item.linkClicks)}</td>
                        <td>{formatTableValue(item.orderCount)}</td>
                        <td>{formatTableValue(item.orderAmount)}</td>
                        <td>{formatTableValue(item.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <p className="pb-hint">
                By-day ad metrics come from the Google Ads script snapshots (impressions / clicks / cost, cost
                converted to USD with the latest stored rate), last 7 days. The owner /
                platform / brand filters above apply to the link table only, not to this daily view.
              </p>
              <div className="pb-table-wrap">
                <table className="pb-table">
                  <thead>
                    <tr>
                      <th>Date (account TZ)</th>
                      <th>Impressions</th>
                      <th>Ad Clicks</th>
                      <th>Ad Cost (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyClickRows.length === 0 ? (
                      <tr><td className="pb-empty" colSpan={4}>
                        No daily data yet. The Google Ads script writes snapshots on each run; check that it still reports.
                      </td></tr>
                    ) : dailyClickRows.map((row) => (
                      <tr key={row.date}>
                        <td>{row.date}</td>
                        <td>{formatTableValue(row.impressions)}</td>
                        <td>{formatTableValue(row.adClicks)}</td>
                        <td>{formatMoney(row.adCostUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}

      {activeTab === 'postback' ? (
        <div className="pb-section">
          <div className="pb-block-title">
            Summary
            <span className="pb-view-toggle">
              <button
                type="button"
                className={`pb-btn ${statsView === 'all' ? 'pb-btn-primary' : ''}`}
                onClick={() => setStatsView('all')}
              >
                All time
              </button>
              <button
                type="button"
                className={`pb-btn ${statsView === 'daily' ? 'pb-btn-primary' : ''}`}
                onClick={() => setStatsView('daily')}
              >
                By day
              </button>
            </span>
            <button type="button" className="pb-btn" onClick={() => onReloadPostBackStats?.()}>
              Refresh
            </button>
          </div>
          {postBackStatsError ? <p className="pb-status error" role="alert">{postBackStatsError}</p> : null}
          {postBackStatsLoading ? <p className="pb-hint">Loading summary...</p> : null}
          {postBackStats ? (
            <div className="pb-cards">
              {summaryCards.map(([label, value, detail]) => (
                <div key={label} className="pb-card">
                  <span>{label}</span>
                  <strong>{formatTableValue(value)}</strong>
                  {detail ? <small className="pb-status-counts">{detail}</small> : null}
                </div>
              ))}
            </div>
          ) : null}

          {health ? (
            <>
              <div className="pb-block-title">
                Attribution Health
                <button
                  type="button"
                  className="pb-btn"
                  onClick={async () => setReattributeMessage(await onReattributePostBacks())}
                >
                  Re-run attribution
                </button>
              </div>
              <div className="pb-mini-stats">
                <span>Click IDs in ledger <b>{formatTableValue(health.clickTrackCount)}</b></span>
                <span>Orders <b>{formatTableValue(health.orderCount)}</b></span>
                <span>With Sub ID <b>{formatTableValue(health.withSubIdCount)}</b></span>
                <span>Matched to Click ID <b>{formatTableValue(health.matchedCount)}</b></span>
              </div>
              <p className={`pb-status ${healthOk ? 'success' : 'error'}`}>{healthMessage}</p>
              {reattributeMessage ? <p className="pb-hint">{reattributeMessage}</p> : null}
              {recentSubIds.length > 0 ? (
                <p className="pb-hint">Recent Sub IDs: {recentSubIds.join(' | ')}</p>
              ) : null}
            </>
          ) : null}

          {statsView === 'daily' ? (
            <>
              <div className="pb-block-title">
                Daily Breakdown
                <label className="pb-field">
                  Date
                  <select
                    value={selectedDailyDate}
                    onChange={(event) => setStatsDailyDate(event.target.value)}
                  >
                    {dailyDays.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </label>
              </div>
              <p className="pb-hint">
                One row per offer on the selected day: which offers ran, their impressions / ad clicks / ad cost
                from the Google Ads script snapshots (cost converted to USD with the latest stored rate), plus the
                orders / GMV / cashback attributed to that offer. Unmatched orders are grouped in their own row.
                Covers the last 7 days; all-time totals are the cards above. Owner/platform/status filters below
                do not apply here.
              </p>
              <div className="pb-table-wrap">
                <table className="pb-table">
                  <thead>
                    <tr>
                      <th>Campaign / Offer</th>
                      <th>Task ID</th>
                      <th>Impressions</th>
                      <th>Ad Clicks</th>
                      <th>Ad Cost (USD)</th>
                      <th>Orders</th>
                      <th>GMV</th>
                      <th>Cashback (USD)</th>
                      <th>Profit (USD)</th>
                      <th>ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyDays.length === 0 || rowsForDate.length === 0 ? (
                      <tr><td className="pb-empty" colSpan={10}>
                        No daily data yet. The Google Ads script writes snapshots on each run; check that it still reports.
                      </td></tr>
                    ) : rowsForDate.map((row) => (
                      <tr key={`${row.date}-${row.campaignName}-${row.normalAdsId ?? 'x'}`}>
                        <td>{formatTableValue(row.campaignName)}</td>
                        <td>{formatTableValue(row.normalAdsId)}</td>
                        <td>{formatTableValue(row.impressions)}</td>
                        <td>{formatTableValue(row.adClicks)}</td>
                        <td>{formatMoney(row.adCostUsd)}</td>
                        <td>{formatTableValue(row.orderCount)}</td>
                        <td>{formatMoney(row.orderAmount)}</td>
                        <td>{formatMoney(row.commission)}</td>
                        <td className={asNumber(row.profitUsd) < 0 ? 'pb-negative' : ''}>{formatMoney(row.profitUsd)}</td>
                        <td>{formatRoas(row.roas)}</td>
                      </tr>
                    ))}
                  </tbody>
                  {rowsForDate.length > 0 ? (
                    <tfoot>
                      <tr>
                        <td>Total ({selectedDailyDate})</td>
                        <td></td>
                        <td>{formatTableValue(dailyTotals.impressions)}</td>
                        <td>{formatTableValue(dailyTotals.adClicks)}</td>
                        <td>{formatMoney(dailyTotals.adCostUsd)}</td>
                        <td>{formatTableValue(dailyTotals.orderCount)}</td>
                        <td>{formatMoney(dailyTotals.orderAmount)}</td>
                        <td>{formatMoney(dailyTotals.commission)}</td>
                        <td className={dailyTotals.profitUsd < 0 ? 'pb-negative' : ''}>{formatMoney(dailyTotals.profitUsd)}</td>
                        <td>{formatRoas(dailyTotals.roas)}</td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </>
          ) : null}

          {statsView === 'all' && platformRows.length > 0 ? (
            <>
              <div className="pb-block-title">By Platform</div>
              <div className="pb-table-wrap">
                <table className="pb-table">
                  <thead>
                    <tr><th>Platform</th><th>Orders</th><th>GMV</th><th>Commission</th></tr>
                  </thead>
                  <tbody>
                    {platformRows.map((item) => (
                      <tr key={item.platform}>
                        <td>{formatTableValue(item.platform)}</td>
                        <td>{formatTableValue(item.orderCount)}</td>
                        <td>{formatTableValue(item.orderAmount)}</td>
                        <td>{formatTableValue(item.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {statsView === 'all' ? (
            <>
          <div className="pb-block-title">By Normal Task</div>
          <p className="pb-hint">
            Ad Cost is the Google Ads lifetime cost reported by the script in the account currency, converted to
            USD with the latest stored rate{postBackStats?.usdCnyRate ? ` (1 USD = ${postBackStats.usdCnyRate} CNY)` : ''}.
            It is kept per Google Ads campaign, so a task's cost includes earlier campaigns with the same name that
            were removed or recreated, and the total still counts tasks that have been deleted.
            Commission is treated as USD. Profit = Commission − Ad Cost (USD); ROAS = Commission ÷ Ad Cost (USD),
            above 1.00x means the brand is profitable.
            {' '}Commission here is the raw sum of every postback order (approved + pending + rejected) over the full
            lifetime, with no date filter; Daily Review instead uses effective commission
            (approved + pending x approval rate) and adds 7-day columns, so the two tables are not directly comparable.
            {asNumber(postBackStats?.unconvertedCostTasks) > 0
              ? ` ${postBackStats.unconvertedCostTasks} task(s) have no exchange rate for their currency and are excluded from the totals.`
              : ''}
            {' '}Drag a column header to move it; click a header to sort.
            {!isDefaultTaskColumnOrder ? (
              <>
                {' '}
                <button
                  type="button"
                  className="pb-inline-link"
                  onClick={() => applyTaskColumnOrder(DEFAULT_TASK_COLUMN_ORDER)}
                >
                  Reset column order
                </button>
              </>
            ) : null}
          </p>
          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  {taskColumns.map((column) => (
                    <th
                      key={column.id}
                      draggable
                      title="Drag to move, click to sort"
                      className={[
                        'pb-draggable-th',
                        dragColumnId === column.id ? 'is-dragging' : '',
                        dragOverColumnId === column.id && dragColumnId && dragColumnId !== column.id
                          ? (taskColumnOrder.indexOf(dragColumnId) < taskColumnOrder.indexOf(column.id)
                            ? 'is-drag-over-after'
                            : 'is-drag-over-before')
                          : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => toggleTaskSort(column.id)}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', column.id)
                        setDragColumnId(column.id)
                      }}
                      onDragOver={(event) => {
                        if (!dragColumnId) {
                          return
                        }
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                        if (dragOverColumnId !== column.id) {
                          setDragOverColumnId(column.id)
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        moveTaskColumn(dragColumnId, column.id)
                        clearTaskColumnDrag()
                      }}
                      onDragEnd={clearTaskColumnDrag}
                    >
                      <span className="pb-drag-grip" aria-hidden="true">⠿</span>
                      {column.label}
                      {taskSortKey === column.id ? (taskSortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTaskRows.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={taskColumns.length}>No normal tasks found.</td></tr>
                ) : sortedTaskRows.map((task) => (
                  <tr key={task.normalAdsId}>
                    {taskColumns.map((column) => (
                      <td key={column.id} className={column.className ? column.className(task) : undefined}>
                        {column.render(task)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </>
          ) : null}

          {statsView === 'all' && unmatchedAdvertisers.length > 0 ? (
            <>
              <div className="pb-block-title">Unmatched by Advertiser</div>
              <div className="pb-table-wrap">
                <table className="pb-table">
                  <thead>
                    <tr><th>Advertiser Name</th><th>Advertiser ID</th><th>Orders</th><th>GMV</th><th>Commission</th></tr>
                  </thead>
                  <tbody>
                    {unmatchedAdvertisers.map((item, index) => (
                      <tr key={`${item.advertiserShopId || 'none'}-${index}`}>
                        <td>{formatTableValue(item.advertiserShopName)}</td>
                        <td>{formatTableValue(item.advertiserShopId)}</td>
                        <td>{formatTableValue(item.orderCount)}</td>
                        <td>{formatTableValue(item.orderAmount)}</td>
                        <td>{formatTableValue(item.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {statsView === 'all' ? (
            <>
          <div className="pb-block-title">Postback Orders</div>
          <div className="pb-toolbar">
            {showOwnerFilter ? (
              <label className="pb-field">
                Owner
                <select
                  value={affiliatePostBackFilters.ownerPhoneNumber}
                  onChange={(event) => onAffiliatePostBackFiltersChange({
                    ...affiliatePostBackFilters,
                    ownerPhoneNumber: event.target.value,
                  })}
                >
                  <option value="">All owners</option>
                  {ownerOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="pb-field">
              Platform
              <select
                value={affiliatePostBackFilters.affiliateSite}
                onChange={(event) => onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  affiliateSite: event.target.value,
                })}
              >
                <option value="">All platforms</option>
                {networkOptions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="pb-field">
              Status
              <select
                value={affiliatePostBackFilters.status}
                onChange={(event) => onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  status: event.target.value,
                })}
              >
                <option value="">All statuses</option>
                {affiliatePostBackStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="pb-field">
              Order No
              <input
                type="text"
                value={affiliatePostBackFilters.orderNo}
                onChange={(event) => onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  orderNo: event.target.value,
                })}
                placeholder="Search order no"
              />
            </label>
            <label className="pb-field">
              Offer
              <select value={selectedOfferKey} onChange={(event) => handleOfferSelect(event.target.value)}>
                <option value="">All offers</option>
                {selectedOfferKey && !selectedOffer ? (
                  <option value={selectedOfferKey}>
                    {affiliatePostBackFilters.advertiserShopName || affiliatePostBackFilters.advertiserShopId}
                  </option>
                ) : null}
                {offerRows.map((offer) => (
                  <option key={offerKey(offer)} value={offerKey(offer)}>
                    {formatTableValue(offer.advertiserShopName)}
                    {offer.advertiserShopId ? ` (${offer.advertiserShopId})` : ''} · {offer.orderCount}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="pb-btn" onClick={() => setShopSort(nextShopSort)}>
              Shop Name {shopSortLabel}
            </button>
            <button type="button" className="pb-btn pb-btn-primary" onClick={onApplyAffiliatePostBackFilters}>
              Search
            </button>
            <button type="button" className="pb-btn" onClick={onReloadAffiliatePostBackFilters}>
              Reload All
            </button>
          </div>

          <div className="pb-block-title">By Offer</div>
          <p className="pb-hint">
            Orders grouped by advertiser shop (shop ID, or name when the ID is missing), using the owner / platform /
            status filters above (order no and offer filters are ignored here). Refunded = status contains reject /
            refund / cancel / void / decline / revers. Matched = attributed to a click ID. Click a row to list all
            orders of that offer below.
          </p>
          <div className="pb-mini-stats">
            <span>Offers <b>{offerRows.length}</b></span>
            <span>Orders <b>{offerTotals.orders}</b></span>
            <span>Refunded <b>{offerTotals.refunded}</b></span>
            <span>GMV <b>{offerTotals.gmv.toFixed(2)}</b></span>
            <span>Commission <b>{offerTotals.commission.toFixed(2)}</b></span>
          </div>
          <div className="pb-table-wrap pb-offer-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Shop ID</th>
                  <th>Platform</th>
                  <th>Orders</th>
                  <th>Refunded</th>
                  <th>Matched</th>
                  <th>GMV</th>
                  <th>Commission</th>
                  <th>First Order</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {offerRows.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={10}>No offers found.</td></tr>
                ) : offerRows.map((offer) => {
                  const key = offerKey(offer)
                  const detail = formatStatusCounts(offer.orderStatusCounts)
                  return (
                    <tr
                      key={key}
                      className={key === selectedOfferKey ? 'is-selected' : undefined}
                      style={{ cursor: 'pointer' }}
                      title={key === selectedOfferKey ? 'Click to show all offers' : 'Click to list orders of this offer'}
                      onClick={() => handleOfferSelect(key === selectedOfferKey ? '' : key)}
                    >
                      <td>{formatTableValue(offer.advertiserShopName)}</td>
                      <td>{formatTableValue(offer.advertiserShopId)}</td>
                      <td>{formatTableValue(offer.affiliateSites)}</td>
                      <td>
                        {formatTableValue(offer.orderCount)}
                        {detail ? <small className="pb-status-counts">{detail}</small> : null}
                      </td>
                      <td className={asNumber(offer.refundedOrderCount) > 0 ? 'pb-negative' : ''}>
                        {formatTableValue(offer.refundedOrderCount)}
                      </td>
                      <td>{formatTableValue(offer.matchedOrderCount)}</td>
                      <td>{formatMoney(offer.orderAmount)}</td>
                      <td>{formatMoney(offer.commission)}</td>
                      <td>{formatDateTimeDisplayValueWithDashedDate(offer.firstOrderTime)}</td>
                      <td>{formatDateTimeDisplayValueWithDashedDate(offer.lastOrderTime)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="pb-block-title">
            {selectedOffer || selectedOfferKey
              ? `Orders of ${selectedOffer?.advertiserShopName || affiliatePostBackFilters.advertiserShopName || affiliatePostBackFilters.advertiserShopId}`
              : 'Orders'}
            {selectedOfferKey ? (
              <button type="button" className="pb-btn" onClick={() => handleOfferSelect('')}>
                Show all offers
              </button>
            ) : null}
          </div>
          {selectedOffer ? (
            <div className="pb-mini-stats">
              <span>Orders <b>{formatTableValue(selectedOffer.orderCount)}</b></span>
              <span>Refunded <b>{formatTableValue(selectedOffer.refundedOrderCount)}</b></span>
              <span>Matched <b>{formatTableValue(selectedOffer.matchedOrderCount)}</b></span>
              <span>GMV <b>{formatMoney(selectedOffer.orderAmount)}</b></span>
              <span>Commission <b>{formatMoney(selectedOffer.commission)}</b></span>
              {formatStatusCounts(selectedOffer.orderStatusCounts)
                ? <span>Status <b>{formatStatusCounts(selectedOffer.orderStatusCounts)}</b></span>
                : null}
            </div>
          ) : null}

          {affiliatePostBacksError ? <p className="pb-status error" role="alert">{affiliatePostBacksError}</p> : null}
          {affiliatePostBacksMessage ? <p className="pb-status success">{affiliatePostBacksMessage}</p> : null}
          {actionError ? <p className="pb-status error" role="alert">{actionError}</p> : null}
          {affiliatePostBacksLoading ? <p className="pb-hint">Loading Post Back records...</p> : null}

          {!affiliatePostBacksLoading && sortedOrders.length === 0 ? (
            <p className="pb-hint">No Post Back records found.</p>
          ) : (
            <div className="pb-table-wrap">
              <table className="pb-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Advertiser Shop Name</th>
                    <th>Shop ID</th>
                    <th>Order No</th>
                    <th>Status</th>
                    <th>Order Time</th>
                    <th>GMV</th>
                    <th>Commission</th>
                    <th>Sub ID</th>
                    <th>Sub ID2</th>
                    <th>Click Time</th>
                    <th>Click ID</th>
                    <th>Normal Task ID</th>
                    <th>Match Status</th>
                    <th>Match Rule</th>
                    <th>Platform</th>
                    <th>Sign ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.advertiserShopName)}</td>
                      <td>{formatTableValue(item.advertiserShopId)}</td>
                      <td>{formatTableValue(item.orderNo)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateTimeDisplayValueWithDashedDate(item.orderTime)}</td>
                      <td>{formatTableValue(item.orderAmount)}</td>
                      <td>{formatTableValue(item.userCommissionAmount)}</td>
                      <td>{formatTableValue(item.subId)}</td>
                      <td>{formatTableValue(item.subId2)}</td>
                      <td>{formatDateTimeDisplayValueWithDashedDate(item.clickTime)}</td>
                      <td>{formatTableValue(item.clickId)}</td>
                      <td>{formatTableValue(item.normalAdsId)}</td>
                      <td>{formatTableValue(item.matchStatus)}</td>
                      <td>{formatTableValue(item.matchRule)}</td>
                      <td>{formatTableValue(item.affiliateSite)}</td>
                      <td>{formatTableValue(item.signId)}</td>
                      <td>
                        <button type="button" className="pb-btn pb-btn-danger" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pb-pagination">
            <PaginationControls
              pagination={pagination}
              isLoading={affiliatePostBacksLoading}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
            </>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'import' ? (
        <div className="pb-section">
          <div className="pb-block-title">Import Historical Bill CSV</div>
          <p className="pb-hint">
            Upload the CSV exported from the affiliate dashboard, and pick which platform it belongs to.
            Columns: Order ID, Action Time, Status, Advertiser Name, Advertiser ID, GMV, Commission,
            Promotion Space, Sub ID, Country. Duplicate order numbers are skipped.
          </p>
          <form className="pb-toolbar" onSubmit={handleImportSubmit}>
            <label className="pb-field">
              Platform
              <select value={importPlatform} onChange={(event) => setImportPlatform(event.target.value)}>
                {[...new Set([...IMPORT_PLATFORMS, ...networkOptions])].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="pb-field">
              CSV file
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
              />
            </label>
            <button type="submit" className="pb-btn pb-btn-primary" disabled={postBackImporting || !csvFile}>
              {postBackImporting ? 'Importing...' : 'Import'}
            </button>
          </form>
          {postBackImportMessage ? <p className="pb-status success">{postBackImportMessage}</p> : null}
          {postBackImportError ? <p className="pb-status error" role="alert">{postBackImportError}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export default AffiliatePostBackManagementSection
