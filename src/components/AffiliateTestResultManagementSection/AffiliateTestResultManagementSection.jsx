import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function AffiliateTestResultManagementSection({
  affiliateTestResults,
  affiliateTestResultsLoading,
  affiliateTestResultsError,
  affiliateTestResultsMessage,
  affiliateTestResultFilters,
  onAffiliateTestResultFiltersChange,
  onApplyAffiliateTestResultFilters,
  onReloadAffiliateTestResultFilters,
  onCreateAffiliateTestResult,
  onEditAffiliateTestResult,
  onDeleteAffiliateTestResult,
  showAffiliateTestResultModal,
  editingAffiliateTestResultId,
  affiliateTestResultNetwork,
  onAffiliateTestResultNetworkChange,
  affiliateTestResultRegion,
  onAffiliateTestResultRegionChange,
  affiliateTestResultSiteName,
  onAffiliateTestResultSiteNameChange,
  affiliateTestResultSiteUrl,
  onAffiliateTestResultSiteUrlChange,
  affiliateTestResultTrackingUrl,
  onAffiliateTestResultTrackingUrlChange,
  affiliateTestResultFinalUrl,
  onAffiliateTestResultFinalUrlChange,
  affiliateTestResultStatus,
  onAffiliateTestResultStatusChange,
  onSaveAffiliateTestResult,
  savingAffiliateTestResult,
  onCloseAffiliateTestResultModal,
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
    <>
      <div className="panel affiliate-test-result-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Auto Test Report</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAffiliateTestResult}>
                Add Ads Test Result
              </button>
            </div>
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
                  <option key={option} value={option}>
                    {option}
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
              <input
                id="affiliateTestResultStatusFilter"
                value={affiliateTestResultFilters.status}
                onChange={(event) =>
                  onAffiliateTestResultFiltersChange({
                    ...affiliateTestResultFilters,
                    status: event.target.value,
                  })
                }
              />
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
          {affiliateTestResultsLoading ? <p>Loading Ads Test Results...</p> : null}

          {!affiliateTestResultsLoading && affiliateTestResults.length === 0 ? (
            <p>No Ads Test Results found.</p>
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
                    <th>Actions</th>
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
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditAffiliateTestResult(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAffiliateTestResult(item.id)}
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
            pagination={pagination}
            isLoading={affiliateTestResultsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAffiliateTestResultModal ? (
        <InlineFormCard
          title={
            editingAffiliateTestResultId
              ? `Update Ads Test Result #${editingAffiliateTestResultId}`
              : 'Add Ads Test Result'
          }
          onClose={onCloseAffiliateTestResultModal}
        >
          <form className="modal-form" onSubmit={onSaveAffiliateTestResult}>
            <label htmlFor="affiliateTestResultNetwork">Affiliate Network</label>
            <select
              id="affiliateTestResultNetwork"
              value={affiliateTestResultNetwork}
              onChange={(event) => onAffiliateTestResultNetworkChange(event.target.value)}
              required
            >
              <option value="">Select affiliate network</option>
              {affiliateNetworkOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateTestResultRegion">Region</label>
            <select
              id="affiliateTestResultRegion"
              value={affiliateTestResultRegion}
              onChange={(event) => onAffiliateTestResultRegionChange(event.target.value)}
              required
            >
              <option value="">Select region</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateTestResultSiteName">Site Name</label>
            <input
              id="affiliateTestResultSiteName"
              value={affiliateTestResultSiteName}
              onChange={(event) => onAffiliateTestResultSiteNameChange(event.target.value)}
              required
            />

            <label htmlFor="affiliateTestResultSiteUrl">Site URL</label>
            <input
              id="affiliateTestResultSiteUrl"
              type="url"
              value={affiliateTestResultSiteUrl}
              onChange={(event) => onAffiliateTestResultSiteUrlChange(event.target.value)}
            />

            <label htmlFor="affiliateTestResultTrackingUrl">Tracking URL</label>
            <input
              id="affiliateTestResultTrackingUrl"
              type="url"
              value={affiliateTestResultTrackingUrl}
              onChange={(event) => onAffiliateTestResultTrackingUrlChange(event.target.value)}
            />

            <label htmlFor="affiliateTestResultFinalUrl">Final URL</label>
            <input
              id="affiliateTestResultFinalUrl"
              type="url"
              value={affiliateTestResultFinalUrl}
              onChange={(event) => onAffiliateTestResultFinalUrlChange(event.target.value)}
            />

            <label htmlFor="affiliateTestResultStatus">Status</label>
            <input
              id="affiliateTestResultStatus"
              value={affiliateTestResultStatus}
              onChange={(event) => onAffiliateTestResultStatusChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAffiliateTestResult}>
                {savingAffiliateTestResult
                  ? 'Saving...'
                  : editingAffiliateTestResultId
                    ? 'Update Ads Test Result'
                    : 'Add Ads Test Result'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAffiliateTestResultModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AffiliateTestResultManagementSection
