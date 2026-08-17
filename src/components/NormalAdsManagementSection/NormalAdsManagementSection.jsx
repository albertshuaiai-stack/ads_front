import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue, getStatusToneClass, toFieldLabel } from '../../lib/adsPortal'
import { toCountryCode } from '../../lib/countryOptions'
import './NormalAdsManagementSection.css'

const NORMAL_TABLE_COLUMN_ORDER = [
  'platformName',
  'campainCountry',
  'campainName',
  'dynamicProxyInfo',
  'landingPageUrl',
  'intervalTime',
  'affiliteUrl',
  'lastExecuteTime',
  'nextExecuteTime',
  'lastSuccessDate',
  'successCount',
  'failedCount',
  'status',
]

const NORMAL_TABLE_COLUMN_LABELS = {
  platformName: 'Platform',
  campainCountry: 'Campaign Country',
  campainName: 'Campaign Name',
  dynamicProxyInfo: 'Dynamic Proxy Info',
  landingPageUrl: 'Landing Page Url',
  intervalTime: 'Interval Time(Mins)',
  affiliteUrl: 'Affiliate Url',
  lastExecuteTime: 'Last Execute Time',
  nextExecuteTime: 'Next Execute Time',
  lastSuccessDate: 'Last Success Date',
  successCount: 'Success Count',
  failedCount: 'Failed Count',
  status: 'Status',
}

function NormalAdsManagementSection({
  normalAds,
  normalAdsLoading,
  normalAdsError,
  normalAdsMessage,
  normalAdsColumns,
  normalAdsFilters,
  adsStatusOptions,
  filterPlatformOptions,
  countryOptions,
  showOwnerFilter,
  ownerOptions,
  onCreateNormalAds,
  canCreateNormalAds,
  normalAdsQuotaMessage,
  onNormalAdsFiltersChange,
  onApplyNormalAdsFilters,
  onToggleNormalAdsStatus,
  onEditNormalAds,
  onDeleteNormalAds,
  formatAdsStatusLabel,
  getAdsStatusActionLabel,
  getNextAdsStatus,
  showNormalAdsModal,
  editingNormalAdsId,
  normalCampainName,
  onNormalCampainNameChange,
  normalCampainCountry,
  onNormalCampainCountryChange,
  normalPlatformName,
  onNormalPlatformNameChange,
  normalAffiliteUrl,
  onNormalAffiliteUrlChange,
  normalLandingPageUrl,
  onNormalLandingPageUrlChange,
  normalDynamicProxyInfo,
  onNormalDynamicProxyInfoChange,
  normalDynamicProxyInfoBackup,
  onNormalDynamicProxyInfoBackupChange,
  normalIntervalTime,
  onNormalIntervalTimeChange,
  normalStatus,
  onNormalStatusChange,
  onSaveNormalAds,
  savingNormalAds,
  onCloseNormalAdsModal,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  const visibleNormalAdsColumns = NORMAL_TABLE_COLUMN_ORDER.filter((column) =>
    normalAdsColumns.includes(column),
  )

  return (
    <>
      <div className="panel normal-ads-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Normal Ads Tasks</h3>
            <div className="toolbar-actions">
              <button
                type="button"
                className="primary"
                onClick={onCreateNormalAds}
                disabled={!canCreateNormalAds}
              >
                Add Normal Ads Task
              </button>
            </div>
          </div>
          {normalAdsQuotaMessage ? <p className="field-help">{normalAdsQuotaMessage}</p> : null}

          <form className="filter-form" onSubmit={onApplyNormalAdsFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="normalOwnerFilter">Ads Owner</label>
                <select
                  id="normalOwnerFilter"
                  value={normalAdsFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onNormalAdsFiltersChange({
                      ...normalAdsFilters,
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
              <label htmlFor="normalPlatformFilter">Platform</label>
              <select
                id="normalPlatformFilter"
                value={normalAdsFilters.platformName}
                onChange={(event) =>
                  onNormalAdsFiltersChange({
                    ...normalAdsFilters,
                    platformName: event.target.value,
                  })
                }
              >
                <option value="">All platforms</option>
                {filterPlatformOptions.map((platformName) => (
                  <option key={platformName} value={platformName}>
                    {platformName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="normalStatusFilter">Status</label>
              <select
                id="normalStatusFilter"
                value={normalAdsFilters.status}
                onChange={(event) =>
                  onNormalAdsFiltersChange({
                    ...normalAdsFilters,
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
              <label htmlFor="normalCampainFilter">Campaign Name</label>
              <input
                id="normalCampainFilter"
                value={normalAdsFilters.campainName}
                onChange={(event) =>
                  onNormalAdsFiltersChange({
                    ...normalAdsFilters,
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

          {normalAdsError ? (
            <p className="status error" role="alert">
              {normalAdsError}
            </p>
          ) : null}
          {normalAdsMessage ? <p className="status success">{normalAdsMessage}</p> : null}
          {normalAdsLoading ? <p>Loading Normal Ads Tasks...</p> : null}

          {!normalAdsLoading && normalAds.length === 0 ? (
            <p>No Normal Ads Tasks found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {visibleNormalAdsColumns.map((column) => (
                      <th key={column}>{NORMAL_TABLE_COLUMN_LABELS[column] || toFieldLabel(column)}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {normalAds.map((item) => (
                    <tr key={item.id} className={getStatusToneClass(item?.status)}>
                      {visibleNormalAdsColumns.map((column) => (
                        <td key={column}>
                          {column === 'status'
                            ? (
                                <span className={`status-badge ${getStatusToneClass(item?.status)}`}>
                                  {formatAdsStatusLabel(item?.[column])}
                                </span>
                              )
                            : column === 'campainCountry'
                              ? formatTableValue(toCountryCode(item?.[column]))
                              : column === 'platformName'
                               ? formatTableValue(item?.platformName || item?.platform)
                              : formatTableValue(item?.[column])}
                        </td>
                      ))}
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleNormalAdsStatus(item, getNextAdsStatus(item.status))}
                        >
                          {getAdsStatusActionLabel(item.status)}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditNormalAds(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteNormalAds(item.id)}
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
            isLoading={normalAdsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showNormalAdsModal ? (
        <InlineFormCard
          title={
            editingNormalAdsId
              ? `Update Normal Ads Task #${editingNormalAdsId}`
              : 'Add Normal Ads Task'
          }
          onClose={onCloseNormalAdsModal}
        >
          <form className="modal-form" onSubmit={onSaveNormalAds}>
            <label htmlFor="normalCampainName">Campaign Name</label>
            <input
              id="normalCampainName"
              value={normalCampainName}
              onChange={(event) => onNormalCampainNameChange(event.target.value)}
              required
            />

            <label htmlFor="normalCampainCountry">Campaign Country</label>
            <select
              id="normalCampainCountry"
              value={normalCampainCountry}
              onChange={(event) => onNormalCampainCountryChange(event.target.value)}
            >
              <option value="">Select a country</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="normalPlatformName">Platform Name</label>
            <select
              id="normalPlatformName"
              value={normalPlatformName}
              onChange={(event) => onNormalPlatformNameChange(event.target.value)}
              disabled={filterPlatformOptions.length === 0}
            >
              <option value="">Select a platform</option>
              {filterPlatformOptions.map((platformName) => (
                <option key={platformName} value={platformName}>
                  {platformName}
                </option>
              ))}
            </select>

            <label htmlFor="normalAffiliteUrl">Affiliate URL</label>
            <input
              id="normalAffiliteUrl"
              value={normalAffiliteUrl}
              onChange={(event) => onNormalAffiliteUrlChange(event.target.value)}
            />

            <label htmlFor="normalLandingPageUrl">Landing Page URL</label>
            <input
              id="normalLandingPageUrl"
              value={normalLandingPageUrl}
              onChange={(event) => onNormalLandingPageUrlChange(event.target.value)}
            />

            <label htmlFor="normalDynamicProxyInfo">Dynamic Proxy Info</label>
            <input
              id="normalDynamicProxyInfo"
              value={normalDynamicProxyInfo}
              onChange={(event) => onNormalDynamicProxyInfoChange(event.target.value)}
              placeholder="username:password@host:port"
            />
            <p className="field-help">
              Support Format(<strong>Sockets5</strong>):username:password@host:port
            </p>

            <label htmlFor="normalDynamicProxyInfoBackup">Dynamic Proxy Info Backup</label>
            <input
              id="normalDynamicProxyInfoBackup"
              value={normalDynamicProxyInfoBackup}
              onChange={(event) => onNormalDynamicProxyInfoBackupChange(event.target.value)}
            />

            <label htmlFor="normalIntervalTime">Interval Time</label>
            <input
              id="normalIntervalTime"
              type="number"
              value={normalIntervalTime}
              onChange={(event) => onNormalIntervalTimeChange(event.target.value)}
            />

            <label htmlFor="normalStatus">Status</label>
            <select
              id="normalStatus"
              value={normalStatus}
              onChange={(event) => onNormalStatusChange(event.target.value)}
            >
              {adsStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingNormalAds}>
                {savingNormalAds
                  ? 'Saving...'
                  : editingNormalAdsId
                    ? 'Update Normal Ads Task'
                    : 'Add Normal Ads Task'}
              </button>
              <button type="button" className="secondary" onClick={onCloseNormalAdsModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default NormalAdsManagementSection
