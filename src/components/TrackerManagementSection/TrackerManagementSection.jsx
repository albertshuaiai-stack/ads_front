import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import './TrackerManagementSection.css'

const TABS = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'pool', label: 'Site ID Pool' },
  { id: 'clicks', label: 'Clicks' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'checks', label: 'Health Check' },
]

// 翻页处理 / paging helpers
function buildPageHandlers(pagination, setPagination, loadFn) {
  return {
    onPageChange: (page) => {
      const next = { ...pagination, page }
      setPagination(next)
      loadFn(next)
    },
    onPageSizeChange: (size) => {
      const next = { ...pagination, size, page: 0 }
      setPagination(next)
      loadFn(next)
    },
  }
}

function TrackerManagementSection({
  campaigns,
  campaignsLoading,
  campaignsError,
  campaignsMessage,
  campaignPagination,
  setCampaignPagination,
  campaignForm,
  setCampaignForm,
  editingCampaignId,
  showCampaignModal,
  setShowCampaignModal,
  savingCampaign,
  loadTrackCampaigns,
  openCreateCampaign,
  openEditCampaign,
  saveTrackCampaign,
  deleteTrackCampaign,

  pools,
  poolsLoading,
  poolsError,
  poolsMessage,
  poolPagination,
  setPoolPagination,
  poolForm,
  setPoolForm,
  editingPoolId,
  showPoolModal,
  setShowPoolModal,
  savingPool,
  loadTrackPools,
  openCreatePool,
  openEditPool,
  saveTrackPool,
  deleteTrackPool,
  resetPoolDailyUsage,

  clicks,
  clicksLoading,
  clicksError,
  clickPagination,
  setClickPagination,
  clickFilters,
  setClickFilters,
  loadTrackClicks,

  conversions,
  conversionsLoading,
  conversionsError,
  conversionPagination,
  setConversionPagination,
  conversionFilters,
  setConversionFilters,
  loadTrackConversions,

  checks,
  checksLoading,
  checksError,
  checksMessage,
  checkPagination,
  setCheckPagination,
  lastCheck,
  loadTrackChecks,
  runTrackerCheck,

  trackerTab,
  setTrackerTab,
}) {
  const campaignPaging = buildPageHandlers(campaignPagination, setCampaignPagination, loadTrackCampaigns)
  const poolPaging = buildPageHandlers(poolPagination, setPoolPagination, loadTrackPools)
  const clickPaging = buildPageHandlers(clickPagination, setClickPagination, loadTrackClicks)
  const conversionPaging = buildPageHandlers(conversionPagination, setConversionPagination, loadTrackConversions)
  const checkPaging = buildPageHandlers(checkPagination, setCheckPagination, loadTrackChecks)

  function updateCampaignField(field, value) {
    setCampaignForm((current) => ({ ...current, [field]: value }))
  }

  function updatePoolField(field, value) {
    setPoolForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <div className="panel tracker-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Tracker Management</h3>
            <div className="toolbar-actions">
              {trackerTab === 'campaigns' ? (
                <button type="button" className="primary" onClick={openCreateCampaign}>
                  Add Campaign
                </button>
              ) : null}
              {trackerTab === 'pool' ? (
                <>
                  <button type="button" className="primary" onClick={openCreatePool}>
                    Add Site ID
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => void resetPoolDailyUsage('')}
                  >
                    Reset Daily Usage
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <p className="tracker-management__intro">
            Manage the tracking redirect campaigns, the site id pool, click logs, conversion
            postbacks and compliance checks.
          </p>

          <div className="tracker-management__tabs" role="tablist" aria-label="Tracker sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`tracker-management__tab${
                  tab.id === trackerTab ? ' tracker-management__tab--active' : ''
                }`}
                aria-selected={tab.id === trackerTab}
                onClick={() => setTrackerTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {trackerTab === 'campaigns' ? (
            <>
              {campaignsError ? (
                <p className="status error" role="alert">
                  {campaignsError}
                </p>
              ) : null}
              {campaignsMessage ? <p className="status success">{campaignsMessage}</p> : null}
              {campaignsLoading ? <p>Loading campaigns...</p> : null}
              {!campaignsLoading && campaigns.length === 0 ? (
                <p>No tracker campaigns found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Slug</th>
                        <th>Campaign</th>
                        <th>Pool</th>
                        <th>Strategy</th>
                        <th>Status</th>
                        <th>Landing</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{formatTableValue(item.slug)}</td>
                          <td>{formatTableValue(item.campaignName)}</td>
                          <td>{formatTableValue(item.poolCode)}</td>
                          <td>{formatTableValue(item.rotateStrategy)}</td>
                          <td>{formatTableValue(item.status)}</td>
                          <td className="tracker-management__ellipsis">
                            {formatTableValue(item.landingPageUrl)}
                          </td>
                          <td>{formatTableValue(item.remarks)}</td>
                          <td className="actions">
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => void runTrackerCheck(item.id)}
                            >
                              Check
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => openEditCampaign(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => void deleteTrackCampaign(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls
                pagination={campaignPagination}
                isLoading={campaignsLoading}
                onPageChange={campaignPaging.onPageChange}
                onPageSizeChange={campaignPaging.onPageSizeChange}
              />
            </>
          ) : null}

          {trackerTab === 'pool' ? (
            <>
              {poolsError ? (
                <p className="status error" role="alert">
                  {poolsError}
                </p>
              ) : null}
              {poolsMessage ? <p className="status success">{poolsMessage}</p> : null}
              {poolsLoading ? <p>Loading site ids...</p> : null}
              {!poolsLoading && pools.length === 0 ? (
                <p>No site ids found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Pool Code</th>
                        <th>Site ID</th>
                        <th>Platform</th>
                        <th>Advertiser</th>
                        <th>Weight</th>
                        <th>Daily Cap</th>
                        <th>Used Today</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pools.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{formatTableValue(item.poolCode)}</td>
                          <td>{formatTableValue(item.siteId)}</td>
                          <td>{formatTableValue(item.platform)}</td>
                          <td>{formatTableValue(item.advertiser)}</td>
                          <td>{formatTableValue(item.weight)}</td>
                          <td>{formatTableValue(item.dailyCap)}</td>
                          <td>{formatTableValue(item.usedToday)}</td>
                          <td>{formatTableValue(item.totalUsed)}</td>
                          <td>{formatTableValue(item.status)}</td>
                          <td className="actions">
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => openEditPool(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => void deleteTrackPool(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls
                pagination={poolPagination}
                isLoading={poolsLoading}
                onPageChange={poolPaging.onPageChange}
                onPageSizeChange={poolPaging.onPageSizeChange}
              />
            </>
          ) : null}

          {trackerTab === 'clicks' ? (
            <>
              <form
                className="filter-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void loadTrackClicks()
                }}
              >
                <div className="filter-item">
                  <label htmlFor="trackerClickSlugFilter">Slug</label>
                  <input
                    id="trackerClickSlugFilter"
                    value={clickFilters.slug}
                    onChange={(event) =>
                      setClickFilters({ ...clickFilters, slug: event.target.value })
                    }
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="trackerClickCampaignFilter">Campaign</label>
                  <input
                    id="trackerClickCampaignFilter"
                    value={clickFilters.campaignName}
                    onChange={(event) =>
                      setClickFilters({ ...clickFilters, campaignName: event.target.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary">
                    Search
                  </button>
                </div>
              </form>

              {clicksError ? (
                <p className="status error" role="alert">
                  {clicksError}
                </p>
              ) : null}
              {clicksLoading ? <p>Loading clicks...</p> : null}
              {!clicksLoading && clicks.length === 0 ? (
                <p>No clicks found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Click ID</th>
                        <th>Slug</th>
                        <th>Campaign</th>
                        <th>Site ID</th>
                        <th>Platform</th>
                        <th>Device</th>
                        <th>Country</th>
                        <th>Click Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clicks.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{formatTableValue(item.clickId)}</td>
                          <td>{formatTableValue(item.slug)}</td>
                          <td>{formatTableValue(item.campaignName)}</td>
                          <td>{formatTableValue(item.siteId)}</td>
                          <td>{formatTableValue(item.platform)}</td>
                          <td>{formatTableValue(item.device)}</td>
                          <td>{formatTableValue(item.country)}</td>
                          <td>{formatTableValue(item.clickTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls
                pagination={clickPagination}
                isLoading={clicksLoading}
                onPageChange={clickPaging.onPageChange}
                onPageSizeChange={clickPaging.onPageSizeChange}
              />
            </>
          ) : null}

          {trackerTab === 'conversions' ? (
            <>
              <form
                className="filter-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void loadTrackConversions()
                }}
              >
                <div className="filter-item">
                  <label htmlFor="trackerConversionOrderFilter">Order No</label>
                  <input
                    id="trackerConversionOrderFilter"
                    value={conversionFilters.orderNo}
                    onChange={(event) =>
                      setConversionFilters({ ...conversionFilters, orderNo: event.target.value })
                    }
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="trackerConversionAttributedFilter">Attributed</label>
                  <select
                    id="trackerConversionAttributedFilter"
                    value={conversionFilters.attributed}
                    onChange={(event) =>
                      setConversionFilters({ ...conversionFilters, attributed: event.target.value })
                    }
                  >
                    <option value="">All</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary">
                    Search
                  </button>
                </div>
              </form>

              {conversionsError ? (
                <p className="status error" role="alert">
                  {conversionsError}
                </p>
              ) : null}
              {conversionsLoading ? <p>Loading conversions...</p> : null}
              {!conversionsLoading && conversions.length === 0 ? (
                <p>No conversions found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order No</th>
                        <th>Click ID</th>
                        <th>Campaign</th>
                        <th>Site ID</th>
                        <th>Advertiser</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Status</th>
                        <th>Attributed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversions.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{formatTableValue(item.orderNo)}</td>
                          <td>{formatTableValue(item.clickId)}</td>
                          <td>{formatTableValue(item.campaignName)}</td>
                          <td>{formatTableValue(item.siteId)}</td>
                          <td>{formatTableValue(item.advertiser)}</td>
                          <td>{formatTableValue(item.orderAmount)}</td>
                          <td>{formatTableValue(item.commissionAmount)}</td>
                          <td>{formatTableValue(item.status)}</td>
                          <td>{formatTableValue(item.attributed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls
                pagination={conversionPagination}
                isLoading={conversionsLoading}
                onPageChange={conversionPaging.onPageChange}
                onPageSizeChange={conversionPaging.onPageSizeChange}
              />
            </>
          ) : null}

          {trackerTab === 'checks' ? (
            <>
              {checksError ? (
                <p className="status error" role="alert">
                  {checksError}
                </p>
              ) : null}
              {checksMessage ? <p className="status success">{checksMessage}</p> : null}
              {checksLoading ? <p>Running compliance check...</p> : null}

              {lastCheck ? (
                <div className="tracker-management__check-detail">
                  <h4>Last check: {formatTableValue(lastCheck.slug)}</h4>
                  <p>
                    Passed: <strong>{formatTableValue(lastCheck.passed)}</strong> · First status:{' '}
                    {formatTableValue(lastCheck.firstStatus)} · Hops:{' '}
                    {formatTableValue(lastCheck.hopCount)} · Final host:{' '}
                    {formatTableValue(lastCheck.finalHost)}
                  </p>
                  <p>{formatTableValue(lastCheck.message)}</p>
                  {lastCheck.rawChain ? (
                    <pre className="tracker-management__chain">{lastCheck.rawChain}</pre>
                  ) : null}
                </div>
              ) : null}

              {!checksLoading && checks.length === 0 ? (
                <p>No health checks found.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Slug</th>
                        <th>First Status</th>
                        <th>Hops</th>
                        <th>Final Host</th>
                        <th>Landing OK</th>
                        <th>Auto Redirect</th>
                        <th>Cloak</th>
                        <th>Passed</th>
                        <th>Message</th>
                        <th>Check Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{formatTableValue(item.slug)}</td>
                          <td>{formatTableValue(item.firstStatus)}</td>
                          <td>{formatTableValue(item.hopCount)}</td>
                          <td>{formatTableValue(item.finalHost)}</td>
                          <td>{formatTableValue(item.landingOk)}</td>
                          <td>{formatTableValue(item.autoRedirect)}</td>
                          <td>{formatTableValue(item.cloakSuspected)}</td>
                          <td>{formatTableValue(item.passed)}</td>
                          <td className="tracker-management__ellipsis">
                            {formatTableValue(item.message)}
                          </td>
                          <td>{formatTableValue(item.checkTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls
                pagination={checkPagination}
                isLoading={checksLoading}
                onPageChange={checkPaging.onPageChange}
                onPageSizeChange={checkPaging.onPageSizeChange}
              />
            </>
          ) : null}
        </div>
      </div>

      {showCampaignModal ? (
        <InlineFormCard
          title={editingCampaignId ? `Update Campaign #${editingCampaignId}` : 'Add Campaign'}
          onClose={() => setShowCampaignModal(false)}
        >
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault()
              void saveTrackCampaign()
            }}
          >
            <label htmlFor="trackerCampaignSlug">Slug</label>
            <input
              id="trackerCampaignSlug"
              value={campaignForm.slug}
              onChange={(event) => updateCampaignField('slug', event.target.value)}
              placeholder="puma-01"
              required
            />
            <p className="field-help">Only letters, digits, underscore or dash. Used as /r/{'{slug}'}.</p>

            <label htmlFor="trackerCampaignName">Campaign Name</label>
            <input
              id="trackerCampaignName"
              value={campaignForm.campaignName}
              onChange={(event) => updateCampaignField('campaignName', event.target.value)}
              placeholder="Google Ads campaign name"
            />

            <label htmlFor="trackerCampaignTemplate">Offer URL Template</label>
            <input
              id="trackerCampaignTemplate"
              value={campaignForm.offerUrlTemplate}
              onChange={(event) => updateCampaignField('offerUrlTemplate', event.target.value)}
              placeholder="https://network/click?id={siteId}&u1={clickId}"
              required
            />
            <p className="field-help">
              Placeholders: {'{siteId}'} for the rotated site id, {'{clickId}'} for attribution.
            </p>

            <label htmlFor="trackerCampaignLanding">Landing Page URL</label>
            <input
              id="trackerCampaignLanding"
              value={campaignForm.landingPageUrl}
              onChange={(event) => updateCampaignField('landingPageUrl', event.target.value)}
            />

            <label htmlFor="trackerCampaignHosts">Allowed Landing Hosts</label>
            <input
              id="trackerCampaignHosts"
              value={campaignForm.allowedLandingHosts}
              onChange={(event) => updateCampaignField('allowedLandingHosts', event.target.value)}
              placeholder="puma.com,dell.com"
            />

            <label htmlFor="trackerCampaignStrategy">Rotation Strategy</label>
            <select
              id="trackerCampaignStrategy"
              value={campaignForm.rotateStrategy}
              onChange={(event) => updateCampaignField('rotateStrategy', event.target.value)}
            >
              <option value="WEIGHTED_RANDOM">WEIGHTED_RANDOM</option>
              <option value="FIXED">FIXED</option>
            </select>

            <label htmlFor="trackerCampaignPool">Pool Code</label>
            <input
              id="trackerCampaignPool"
              value={campaignForm.poolCode}
              onChange={(event) => updateCampaignField('poolCode', event.target.value)}
              placeholder="required when WEIGHTED_RANDOM"
            />

            <label htmlFor="trackerCampaignFixedSiteId">Fixed Site ID</label>
            <input
              id="trackerCampaignFixedSiteId"
              value={campaignForm.fixedSiteId}
              onChange={(event) => updateCampaignField('fixedSiteId', event.target.value)}
              placeholder="required when FIXED"
            />

            <label htmlFor="trackerCampaignStatus">Status</label>
            <select
              id="trackerCampaignStatus"
              value={campaignForm.status}
              onChange={(event) => updateCampaignField('status', event.target.value)}
            >
              <option value="RUNNING">RUNNING</option>
              <option value="PAUSED">PAUSED</option>
            </select>

            <label htmlFor="trackerCampaignRemarks">Remarks</label>
            <input
              id="trackerCampaignRemarks"
              value={campaignForm.remarks}
              onChange={(event) => updateCampaignField('remarks', event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingCampaign}>
                {savingCampaign ? 'Saving...' : editingCampaignId ? 'Update Campaign' : 'Add Campaign'}
              </button>
              <button type="button" className="secondary" onClick={() => setShowCampaignModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}

      {showPoolModal ? (
        <InlineFormCard
          title={editingPoolId ? `Update Site ID #${editingPoolId}` : 'Add Site ID'}
          onClose={() => setShowPoolModal(false)}
        >
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault()
              void saveTrackPool()
            }}
          >
            <label htmlFor="trackerPoolCode">Pool Code</label>
            <input
              id="trackerPoolCode"
              value={poolForm.poolCode}
              onChange={(event) => updatePoolField('poolCode', event.target.value)}
              required
            />

            <label htmlFor="trackerPoolSiteId">Site ID</label>
            <input
              id="trackerPoolSiteId"
              value={poolForm.siteId}
              onChange={(event) => updatePoolField('siteId', event.target.value)}
              required
            />

            <label htmlFor="trackerPoolPlatform">Platform</label>
            <input
              id="trackerPoolPlatform"
              value={poolForm.platform}
              onChange={(event) => updatePoolField('platform', event.target.value)}
              placeholder="CJ / Rakuten / Impact"
            />

            <label htmlFor="trackerPoolAdvertiser">Advertiser</label>
            <input
              id="trackerPoolAdvertiser"
              value={poolForm.advertiser}
              onChange={(event) => updatePoolField('advertiser', event.target.value)}
            />

            <label htmlFor="trackerPoolWeight">Weight</label>
            <input
              id="trackerPoolWeight"
              type="number"
              min="1"
              value={poolForm.weight}
              onChange={(event) => updatePoolField('weight', event.target.value)}
            />

            <label htmlFor="trackerPoolDailyCap">Daily Cap</label>
            <input
              id="trackerPoolDailyCap"
              type="number"
              min="0"
              value={poolForm.dailyCap}
              onChange={(event) => updatePoolField('dailyCap', event.target.value)}
            />

            <label htmlFor="trackerPoolStatus">Status</label>
            <select
              id="trackerPoolStatus"
              value={poolForm.status}
              onChange={(event) => updatePoolField('status', event.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="BANNED">BANNED</option>
            </select>

            <label htmlFor="trackerPoolRemarks">Remarks</label>
            <input
              id="trackerPoolRemarks"
              value={poolForm.remarks}
              onChange={(event) => updatePoolField('remarks', event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingPool}>
                {savingPool ? 'Saving...' : editingPoolId ? 'Update Site ID' : 'Add Site ID'}
              </button>
              <button type="button" className="secondary" onClick={() => setShowPoolModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default TrackerManagementSection
