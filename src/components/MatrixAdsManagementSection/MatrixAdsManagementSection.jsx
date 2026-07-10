import InlineFormCard from '../InlineFormCard/InlineFormCard'
import MatrixAffiliateEditor from '../MatrixAffiliateEditor/MatrixAffiliateEditor'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue, getStatusToneClass, toFieldLabel } from '../../lib/adsPortal'
import { toCountryCode } from '../../lib/countryOptions'
import './MatrixAdsManagementSection.css'

function MatrixAdsManagementSection({
  matrixAds,
  matrixAdsLoading,
  matrixAdsError,
  matrixAdsMessage,
  matrixAdsColumns,
  matrixAdsFilters,
  adsStatusOptions,
  countryOptions,
  platformOptions,
  platformsLoading,
  onCreateMatrixAds,
  canCreateMatrixAds,
  matrixAdsQuotaMessage,
  onMatrixAdsFiltersChange,
  onApplyMatrixAdsFilters,
  onToggleMatrixAdsStatus,
  onEditMatrixAds,
  onDeleteMatrixAds,
  formatAdsStatusLabel,
  getAdsStatusActionLabel,
  getNextAdsStatus,
  showMatrixAdsModal,
  editingMatrixAdsId,
  matrixCampainName,
  onMatrixCampainNameChange,
  matrixCampainCountry,
  onMatrixCampainCountryChange,
  matrixLandingPageUrl,
  onMatrixLandingPageUrlChange,
  matrixDynamicProxyInfo,
  onMatrixDynamicProxyInfoChange,
  matrixDynamicProxyInfoBackup,
  onMatrixDynamicProxyInfoBackupChange,
  matrixIntervalTime,
  onMatrixIntervalTimeChange,
  matrixStatus,
  onMatrixStatusChange,
  matrixAffiliateRows,
  onAddMatrixAffiliateRow,
  onUpdateMatrixAffiliateRow,
  onRemoveMatrixAffiliateRow,
  onSaveMatrixAds,
  savingMatrixAds,
  onCloseMatrixAdsModal,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel matrix-ads-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Matrix Ads Tasks</h3>
            <div className="toolbar-actions">
              <button
                type="button"
                className="primary"
                onClick={onCreateMatrixAds}
                disabled={!canCreateMatrixAds}
              >
                Add Matrix Ads Task
              </button>
            </div>
          </div>
          {matrixAdsQuotaMessage ? <p className="field-help">{matrixAdsQuotaMessage}</p> : null}

          <form className="filter-form" onSubmit={onApplyMatrixAdsFilters}>
            <div className="filter-item">
              <label htmlFor="matrixCampainFilter">Campaign Name</label>
              <input
                id="matrixCampainFilter"
                value={matrixAdsFilters.campainName}
                onChange={(event) =>
                  onMatrixAdsFiltersChange({
                    ...matrixAdsFilters,
                    campainName: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="matrixPlatformFilter">Platform</label>
              <select
                id="matrixPlatformFilter"
                value={matrixAdsFilters.platformName}
                onChange={(event) =>
                  onMatrixAdsFiltersChange({
                    ...matrixAdsFilters,
                    platformName: event.target.value,
                  })
                }
                disabled={platformsLoading || platformOptions.length === 0}
              >
                <option value="">All platforms</option>
                {platformOptions.map((platformName) => (
                  <option key={platformName} value={platformName}>
                    {platformName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="matrixStatusFilter">Status</label>
              <select
                id="matrixStatusFilter"
                value={matrixAdsFilters.status}
                onChange={(event) =>
                  onMatrixAdsFiltersChange({
                    ...matrixAdsFilters,
                    status: event.target.value,
                  })
                }
              >
                <option value="">All statuses</option>
                {adsStatusOptions.map((option) => (
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
            </div>
          </form>

          {matrixAdsError ? (
            <p className="status error" role="alert">
              {matrixAdsError}
            </p>
          ) : null}
          {matrixAdsMessage ? <p className="status success">{matrixAdsMessage}</p> : null}
          {matrixAdsLoading ? <p>Loading Matrix Ads Tasks...</p> : null}

          {!matrixAdsLoading && matrixAds.length === 0 ? (
            <p>No Matrix Ads Tasks found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {matrixAdsColumns.map((column) => (
                      <th key={column}>{toFieldLabel(column)}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixAds.map((item) => (
                    <tr key={item.id} className={getStatusToneClass(item?.status)}>
                      {matrixAdsColumns.map((column) => (
                        <td key={column}>
                          {column === 'status'
                            ? (
                                <span className={`status-badge ${getStatusToneClass(item?.status)}`}>
                                  {formatAdsStatusLabel(item?.[column])}
                                </span>
                              )
                            : column === 'campainCountry'
                              ? formatTableValue(toCountryCode(item?.[column]))
                              : formatTableValue(item?.[column])}
                        </td>
                      ))}
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleMatrixAdsStatus(item, getNextAdsStatus(item.status))}
                        >
                          {getAdsStatusActionLabel(item.status)}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditMatrixAds(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteMatrixAds(item.id)}
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
            isLoading={matrixAdsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showMatrixAdsModal ? (
        <InlineFormCard
          title={
            editingMatrixAdsId
              ? `Update Matrix Ads Task #${editingMatrixAdsId}`
              : 'Add Matrix Ads Task'
          }
          onClose={onCloseMatrixAdsModal}
        >
          <form className="modal-form" onSubmit={onSaveMatrixAds}>
            <label htmlFor="matrixCampainName">Campaign Name</label>
            <input
              id="matrixCampainName"
              value={matrixCampainName}
              onChange={(event) => onMatrixCampainNameChange(event.target.value)}
              required
            />

            <label htmlFor="matrixCampainCountry">Campaign Country</label>
            <select
              id="matrixCampainCountry"
              value={matrixCampainCountry}
              onChange={(event) => onMatrixCampainCountryChange(event.target.value)}
            >
              <option value="">Select a country</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="matrixLandingPageUrl">Landing Page URL</label>
            <input
              id="matrixLandingPageUrl"
              value={matrixLandingPageUrl}
              onChange={(event) => onMatrixLandingPageUrlChange(event.target.value)}
            />

            <label htmlFor="matrixDynamicProxyInfo">Dynamic Proxy Info</label>
            <input
              id="matrixDynamicProxyInfo"
              value={matrixDynamicProxyInfo}
              onChange={(event) => onMatrixDynamicProxyInfoChange(event.target.value)}
              placeholder="Supported Format:username:password@host:port - Https"
            />

            <label htmlFor="matrixDynamicProxyInfoBackup">Dynamic Proxy Info Backup</label>
            <input
              id="matrixDynamicProxyInfoBackup"
              value={matrixDynamicProxyInfoBackup}
              onChange={(event) => onMatrixDynamicProxyInfoBackupChange(event.target.value)}
            />

            <label htmlFor="matrixIntervalTime">Interval Time</label>
            <input
              id="matrixIntervalTime"
              type="number"
              value={matrixIntervalTime}
              onChange={(event) => onMatrixIntervalTimeChange(event.target.value)}
            />

            <label htmlFor="matrixStatus">Status</label>
            <select
              id="matrixStatus"
              value={matrixStatus}
              onChange={(event) => onMatrixStatusChange(event.target.value)}
            >
              {adsStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="matrix-ads-management__affiliate-section">
              <div className="matrix-ads-management__affiliate-header">
                <label>Affiliate Infos</label>
                <button type="button" className="secondary" onClick={onAddMatrixAffiliateRow}>
                  Add Affiliate Row
                </button>
              </div>
              <MatrixAffiliateEditor
                onChangeRow={onUpdateMatrixAffiliateRow}
                onRemoveRow={onRemoveMatrixAffiliateRow}
                platformOptions={platformOptions}
                rows={matrixAffiliateRows}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingMatrixAds}>
                {savingMatrixAds
                  ? 'Saving...'
                  : editingMatrixAdsId
                    ? 'Update Matrix Ads Task'
                    : 'Add Matrix Ads Task'}
              </button>
              <button type="button" className="secondary" onClick={onCloseMatrixAdsModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default MatrixAdsManagementSection
