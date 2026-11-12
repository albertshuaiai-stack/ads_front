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
  const [shopSort, setShopSort] = useState('default')
  const [actionError, setActionError] = useState('')
  const [reattributeMessage, setReattributeMessage] = useState('')
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

  const clickTotals = useMemo(() => filteredClicks.reduce((acc, item) => ({
    hits: acc.hits + asNumber(item.clickCount),
    orders: acc.orders + asNumber(item.orderCount),
    gmv: acc.gmv + asNumber(item.orderAmount),
    commission: acc.commission + asNumber(item.commission),
  }), { hits: 0, orders: 0, gmv: 0, commission: 0 }), [filteredClicks])

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
        ['Orders', postBackStats.orderCount],
        ['Unmatched Orders', postBackStats.unmatchedOrderCount],
        ['GMV', postBackStats.orderAmount],
        ['Commission', postBackStats.commission],
      ]
    : []

  const taskRows = Array.isArray(postBackStats?.tasks) ? postBackStats.tasks : []
  const platformRows = Array.isArray(postBackStats?.byPlatform) ? postBackStats.byPlatform : []
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
            <button type="button" className="pb-btn pb-btn-primary" onClick={() => onReloadClickSummary?.()}>
              Refresh
            </button>
          </div>

          <div className="pb-mini-stats">
            <span>Click IDs <b>{filteredClicks.length}</b></span>
            <span>Tracked hits <b>{clickTotals.hits}</b></span>
            <span>Orders <b>{clickTotals.orders}</b></span>
            <span>GMV <b>{clickTotals.gmv.toFixed(2)}</b></span>
            <span>Commission <b>{clickTotals.commission.toFixed(2)}</b></span>
          </div>
          <p className="pb-hint">
            Ad Platform is the traffic source of the listed task. Tracked hits count requests through /api/click;
            Google Ads links are unchanged, so it stays 0. Campaign-level ad clicks are on the Conversions tab.
          </p>

          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  <th>Click ID</th>
                  <th>Owner</th>
                  <th>Ad Platform</th>
                  <th>Brand</th>
                  <th>Task ID</th>
                  <th>Created</th>
                  <th>Tracked hits</th>
                  <th>Orders</th>
                  <th>GMV</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {filteredClicks.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={10}>No click IDs recorded yet.</td></tr>
                ) : filteredClicks.map((item) => (
                  <tr key={item.clickId}>
                    <td>{formatTableValue(item.clickId)}</td>
                    <td>{formatTableValue(item.adsOwner)}</td>
                    <td>{formatTableValue(item.platformName)}</td>
                    <td>{formatTableValue(item.campainName)}</td>
                    <td>{formatTableValue(item.normalAdsId)}</td>
                    <td>{formatDateTimeDisplayValueWithDashedDate(item.createDate)}</td>
                    <td>{formatTableValue(item.clickCount)}</td>
                    <td>{formatTableValue(item.orderCount)}</td>
                    <td>{formatTableValue(item.orderAmount)}</td>
                    <td>{formatTableValue(item.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === 'postback' ? (
        <div className="pb-section">
          <div className="pb-block-title">
            Summary
            <button type="button" className="pb-btn" onClick={() => onReloadPostBackStats?.()}>
              Refresh
            </button>
          </div>
          {postBackStatsError ? <p className="pb-status error" role="alert">{postBackStatsError}</p> : null}
          {postBackStatsLoading ? <p className="pb-hint">Loading summary...</p> : null}
          {postBackStats ? (
            <div className="pb-cards">
              {summaryCards.map(([label, value]) => (
                <div key={label} className="pb-card">
                  <span>{label}</span>
                  <strong>{formatTableValue(value)}</strong>
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

          {platformRows.length > 0 ? (
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

          <div className="pb-block-title">By Normal Task</div>
          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Campaign</th>
                  <th>Advertiser ID (a=)</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Links Issued</th>
                  <th>Ad Clicks</th>
                  <th>Orders</th>
                  <th>Matched Click IDs</th>
                  <th>GMV</th>
                  <th>Commission</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {taskRows.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={12}>No normal tasks found.</td></tr>
                ) : taskRows.map((task) => (
                  <tr key={task.normalAdsId}>
                    <td>{formatTableValue(task.normalAdsId)}</td>
                    <td>{formatTableValue(task.campainName)}</td>
                    <td>{formatTableValue(task.advertiserId)}</td>
                    <td>{formatTableValue(task.campainCountry)}</td>
                    <td>{formatTableValue(task.status)}</td>
                    <td>{formatTableValue(task.issuedClickIds)}</td>
                    <td>{formatTableValue(task.reportedClicks)}</td>
                    <td>{formatTableValue(task.orderCount)}</td>
                    <td>{formatTableValue(task.matchedClickIds)}</td>
                    <td>{formatTableValue(task.orderAmount)}</td>
                    <td>{formatTableValue(task.commission)}</td>
                    <td>{formatPercent(task.conversionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unmatchedAdvertisers.length > 0 ? (
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
