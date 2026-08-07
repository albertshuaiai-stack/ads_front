import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function isSuccessStatus(value) {
  return String(value ?? '').trim().toUpperCase() === 'SUCCESS'
}

function AffiliateTestResultManagementSection({
  affiliateTestResults,
  affiliateTestResultsLoading,
  affiliateTestResultsError,
  affiliateTestResultsMessage,
  affiliateTestResultFilters,
  affiliateTestResultStatusOptions,
  onAffiliateTestResultFiltersChange,
  onApplyAffiliateTestResultFilters,
  onReloadAffiliateTestResultFilters,
  showOwnerFilter,
  ownerOptions,
  affiliateNetworkOptions,
  countryOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel affiliate-test-result-management">
      <div className="user-list">
        <div className="list-header">
          <h3>Affiliate Test</h3>
        </div>

        <form className="filter-form" onSubmit={onApplyAffiliateTestResultFilters}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="affiliateTestResultOwnerFilter">Owner</label>
              <select
                id="affiliateTestResultOwnerFilter"
                value={affiliateTestResultFilters.ownerPhoneNumber}
                onChange={(event) =>
                  onAffiliateTestResultFiltersChange({
                    ...affiliateTestResultFilters,
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
            <label htmlFor="affiliateTestResultNetworkFilter">Affiliate Network</label>
            <select
              id="affiliateTestResultNetworkFilter"
              value={affiliateTestResultFilters.affiliateNetwork}
              onChange={(event) =>
                onAffiliateTestResultFiltersChange({
                  ...affiliateTestResultFilters,
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
            <label htmlFor="affiliateTestResultRegionFilter">Region</label>
            <select
              id="affiliateTestResultRegionFilter"
              value={affiliateTestResultFilters.region}
              onChange={(event) =>
                onAffiliateTestResultFiltersChange({
                  ...affiliateTestResultFilters,
                  region: event.target.value,
                })
              }
            >
              <option value="">All regions</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTestResultStatusFilter">Status</label>
            <select
              id="affiliateTestResultStatusFilter"
              value={affiliateTestResultFilters.status}
              onChange={(event) =>
                onAffiliateTestResultFiltersChange({
                  ...affiliateTestResultFilters,
                  status: event.target.value,
                })
              }
            >
              <option value="">All statuses</option>
              {affiliateTestResultStatusOptions.map((option) => (
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
            <button type="button" className="secondary" onClick={onReloadAffiliateTestResultFilters}>
              Reload All
            </button>
          </div>
        </form>

        {affiliateTestResultsError ? (
          <p className="status error" role="alert">
            {affiliateTestResultsError}
          </p>
        ) : null}
        {affiliateTestResultsMessage ? <p className="status success">{affiliateTestResultsMessage}</p> : null}
        {affiliateTestResultsLoading ? <p>Loading Affiliate Test Results...</p> : null}

        {!affiliateTestResultsLoading && affiliateTestResults.length === 0 ? (
          <p>No Affiliate Test Results found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Affiliate Network</th>
                  <th>Region</th>
                  <th>Site Name</th>
                  <th>Site URL</th>
                  <th>Tracking URL</th>
                  <th>Final URL</th>
                  <th>Status</th>
                  <th>Create Date</th>
                  <th>Update Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {affiliateTestResults.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{formatTableValue(item.affiliateNetwork)}</td>
                    <td>{formatTableValue(item.region)}</td>
                    <td>{formatTableValue(item.siteName)}</td>
                    <td>{formatTableValue(item.siteUrl)}</td>
                    <td>{formatTableValue(item.trackingUrl)}</td>
                    <td>{formatTableValue(item.finalUrl)}</td>
                    <td>{formatTableValue(item.status)}</td>
                    <td>{formatDateDisplayValue(item.createDate)}</td>
                    <td>{formatDateDisplayValue(item.updateDate)}</td>
                    <td className="actions">
                      {isSuccessStatus(item.status) ? (
                        <button type="button" className="secondary" onClick={() => {}}>
                          Normal
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
          isLoading={affiliateTestResultsLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default AffiliateTestResultManagementSection
