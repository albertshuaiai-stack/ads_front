import InlineFormCard from '../InlineFormCard/InlineFormCard'
import MatrixAffiliateEditor from '../MatrixAffiliateEditor/MatrixAffiliateEditor'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue, getStatusToneClass, toFieldLabel } from '../../lib/adsPortal'
import { toCountryCode } from '../../lib/countryOptions'
import './MatrixAdsManagementSection.css'

const MATRIX_TABLE_COLUMN_ORDER = [
  'platformName',
  'campainCountry',
  'campainName',
  'dynamicProxyInfo',
  'landingPageUrl',
  'intervalTime',
  'affiliateInfos',
  'lastExecuteTime',
  'nextExecuteTime',
  'lastSuccessDate',
  'successCount',
  'failedCount',
  'status',
]

const MATRIX_TABLE_COLUMN_LABELS = {
  platformName: 'Platform',
  campainCountry: 'Campaign Country',
  campainName: 'Campaign Name',
  dynamicProxyInfo: 'Dynamic Proxy Info',
  landingPageUrl: 'Landing Page Url',
  intervalTime: 'Interval Time(Mins)',
  affiliateInfos: 'Affiliate Url Count',
  lastExecuteTime: 'Last Execute Time',
  nextExecuteTime: 'Next Execute Time',
  lastSuccessDate: 'Last Success Date',
  successCount: 'Success Count',
  failedCount: 'Failed Count',
  status: 'Status',
}

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
  showOwnerFilter,
  ownerOptions,
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
  const visibleMatrixAdsColumns = MATRIX_TABLE_COLUMN_ORDER.filter((column) =>
    matrixAdsColumns.includes(column),
  )

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
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="matrixOwnerFilter">Ads Owner</label>
                <select
                  id="matrixOwnerFilter"
                  value={matrixAdsFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onMatrixAdsFiltersChange({
                      ...matrixAdsFilters,
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
                    {visibleMatrixAdsColumns.map((column) => (
                      <th key={column}>
                        {MATRIX_TABLE_COLUMN_LABELS[column] || toFieldLabel(column)}
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixAds.map((item) => (
                    <tr key={item.id} className={getStatusToneClass(item?.status)}>
                      {visibleMatrixAdsColumns.map((column) => (
                        <td key={column}>
                          {column === 'status'
                            ? (
                                <span className={`status-badge ${getStatusToneClass(item?.status)}`}>
                                  {formatAdsStatusLabel(item?.[column])}
                                </span>
                              )
                            : column === 'affiliateInfos'
                              ? Array.isArray(item?.[column])
                                ? item[column].length
                                : 0
                            : column === 'platformName'
                              ? formatTableValue(item?.platformName || item?.platform)
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
              placeholder="username:password@host:port"
            />
            <p className="field-help">
              Support Format(<strong>Sockets5</strong>):username:password@host:port
            </p>

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
