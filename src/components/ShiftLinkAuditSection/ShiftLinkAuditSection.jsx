import { firstDefinedValue, formatTableValue, getStatusToneClass } from '../../lib/adsPortal'
import './ShiftLinkAuditSection.css'

function ShiftLinkAuditSection({
  adsUrls,
  adsLoading,
  adsError,
  adsUrlColumns,
  auditFilters,
  adsTypeOptions,
  platformOptions,
  campainOptions,
  onAuditAdsTypeChange,
  onAuditPlatformChange,
  onAuditCampainChange,
  formatAdsStatusLabel,
}) {
  return (
    <div className="panel shift-link-audit">
      <div className="user-list">
        <div className="list-header">
          <h3>Shift Link Audit</h3>
        </div>

        <div className="filter-form">
          <div className="filter-item">
            <label htmlFor="shiftLinkAuditAdsType">Ads Type</label>
            <select
              id="shiftLinkAuditAdsType"
              value={auditFilters.adsType}
              onChange={(event) => onAuditAdsTypeChange(event.target.value)}
              disabled={adsTypeOptions.length === 0}
            >
              <option value="">All ads types</option>
              {adsTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="shiftLinkAuditPlatformName">Platform Name</label>
            <select
              id="shiftLinkAuditPlatformName"
              value={auditFilters.platformName}
              onChange={(event) => onAuditPlatformChange(event.target.value)}
              disabled={platformOptions.length === 0}
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
            <label htmlFor="shiftLinkAuditCampainName">Campain Name</label>
            <select
              id="shiftLinkAuditCampainName"
              value={auditFilters.campainName}
              onChange={(event) => onAuditCampainChange(event.target.value)}
              disabled={campainOptions.length === 0}
            >
              <option value="">All campains</option>
              {campainOptions.map((campainName) => (
                <option key={campainName} value={campainName}>
                  {campainName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {adsError ? (
          <p className="status error" role="alert">
            {adsError}
          </p>
        ) : null}
        {adsLoading ? <p>Loading Shift Link Audit...</p> : null}

        {!adsLoading && adsUrls.length === 0 ? (
          <p>No Shift Links found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {adsUrlColumns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adsUrls.map((item) => (
                  <tr key={item.id} className={getStatusToneClass(firstDefinedValue(item, ['status']))}>
                    {adsUrlColumns.map((column) => (
                      <td key={column.key} className={column.key === 'fullUrl' ? 'truncate' : ''}>
                        {column.key === 'status'
                          ? (
                              <span
                                className={`status-badge ${getStatusToneClass(
                                  firstDefinedValue(item, column.fields),
                                )}`}
                              >
                                {formatAdsStatusLabel(firstDefinedValue(item, column.fields))}
                              </span>
                            )
                          : formatTableValue(firstDefinedValue(item, column.fields))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShiftLinkAuditSection
