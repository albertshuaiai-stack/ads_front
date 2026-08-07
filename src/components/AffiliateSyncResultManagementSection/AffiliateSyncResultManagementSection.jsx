import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function hasTrackingUrl(value) {
  return String(value ?? '').trim() !== ''
}

function isActiveMerchantStatus(value) {
  return String(value ?? '').trim().toUpperCase() === 'ACTIVE'
}

function AffiliateSyncResultManagementSection({
  affiliateSyncResults,
  affiliateSyncResultsLoading,
  affiliateSyncResultsError,
  affiliateSyncResultsMessage,
  affiliateSyncResultFilters,
  affiliateSyncResultStatusOptions,
  onAffiliateSyncResultFiltersChange,
  onApplyAffiliateSyncResultFilters,
  onReloadAffiliateSyncResultFilters,
  onTestAffiliateSyncResult,
  testingAffiliateSyncResultId,
  showOwnerFilter,
  ownerOptions,
  affiliateNetworkOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel affiliate-sync-result-management">
      <div className="user-list">
        <div className="list-header">
          <h3>Affiliate Ads</h3>
        </div>

        <form className="filter-form" onSubmit={onApplyAffiliateSyncResultFilters}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="affiliateSyncResultOwnerFilter">Owner</label>
              <select
                id="affiliateSyncResultOwnerFilter"
                value={affiliateSyncResultFilters.ownerPhoneNumber}
                onChange={(event) =>
                  onAffiliateSyncResultFiltersChange({
                    ...affiliateSyncResultFilters,
                    ownerPhoneNumber: event.target.value,
                  })
                }
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
            <label htmlFor="affiliateSyncResultNetworkFilter">Affiliate Network</label>
            <select
              id="affiliateSyncResultNetworkFilter"
              value={affiliateSyncResultFilters.affiliateNetwork}
              onChange={(event) =>
                onAffiliateSyncResultFiltersChange({
                  ...affiliateSyncResultFilters,
                  affiliateNetwork: event.target.value,
                })
              }
            >
              <option value="">All affiliate networks</option>
              {affiliateNetworkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateSyncResultStatusFilter">Status</label>
            <select
              id="affiliateSyncResultStatusFilter"
              value={affiliateSyncResultFilters.status}
              onChange={(event) =>
                onAffiliateSyncResultFiltersChange({
                  ...affiliateSyncResultFilters,
                  status: event.target.value,
                })
              }
            >
              <option value="">All statuses</option>
              {affiliateSyncResultStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">
              Search
            </button>
            <button type="button" className="secondary" onClick={onReloadAffiliateSyncResultFilters}>
              Reload All
            </button>
          </div>
        </form>

        {affiliateSyncResultsError ? (
          <p className="status error" role="alert">
            {affiliateSyncResultsError}
          </p>
        ) : null}
        {affiliateSyncResultsMessage ? <p className="status success">{affiliateSyncResultsMessage}</p> : null}
        {affiliateSyncResultsLoading ? <p>Loading Affiliate Ads...</p> : null}

        {!affiliateSyncResultsLoading && affiliateSyncResults.length === 0 ? (
          <p>No Affiliate Ads found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Site Name</th>
                  <th>Site URL</th>
                  <th>Tracking URL</th>
                  <th>Region</th>
                  <th>Merchant Status</th>
                  <th>Commissions</th>
                  <th>Adv Catagory</th>
                  <th>Deeplink</th>
                  <th>Affiliate Network</th>
                  <th>Status</th>
                  <th>Create Date</th>
                  <th>Update Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {affiliateSyncResults.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{formatTableValue(item.siteName)}</td>
                    <td>{formatTableValue(item.siteUrl)}</td>
                    <td>{formatTableValue(item.trackingUrl)}</td>
                    <td>{formatTableValue(item.region)}</td>
                    <td>{formatTableValue(item.merchantStatus)}</td>
                    <td>{formatTableValue(item.commissions)}</td>
                    <td>{formatTableValue(item.advCatagory)}</td>
                    <td>{formatTableValue(item.deeplink)}</td>
                    <td>{formatTableValue(item.affiliateNetwork)}</td>
                    <td>{formatTableValue(item.status)}</td>
                    <td>{formatDateDisplayValue(item.createDate)}</td>
                    <td>{formatDateDisplayValue(item.updateDate)}</td>
                    <td className="actions">
                      {isActiveMerchantStatus(item.merchantStatus) && hasTrackingUrl(item.trackingUrl) ? (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onTestAffiliateSyncResult(item.id)}
                          disabled={testingAffiliateSyncResultId === item.id}
                        >
                          {testingAffiliateSyncResultId === item.id ? 'Testing...' : 'Test'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          pagination={pagination}
          isLoading={affiliateSyncResultsLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default AffiliateSyncResultManagementSection
