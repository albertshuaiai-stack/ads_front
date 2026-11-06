import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue, getStatusToneClass } from '../../lib/adsPortal'

// 中间链接上传、归类与落地页解析 / middle link upload, classification and landing resolve
function MiddleLinkSection({
  middleLinks,
  middleLinksLoading,
  middleLinksError,
  middleLinksMessage,
  filters,
  onFiltersChange,
  onApplyFilters,
  onReloadFilters,
  brandName,
  onBrandNameChange,
  urlsText,
  onUrlsTextChange,
  targetCount,
  onTargetCountChange,
  windowSeconds,
  onWindowSecondsChange,
  intervalSeconds,
  onIntervalSecondsChange,
  uploading,
  onUpload,
  onResolve,
  onDelete,
  resolvingId,
  showOwnerFilter,
  ownerOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel middle-link-management">
      <div className="user-list">
        <div className="list-header">
          <h3>Middle Links</h3>
        </div>

        <form className="filter-form" onSubmit={onUpload}>
          <div className="filter-item">
            <label htmlFor="middleLinkBrandName">Brand Name</label>
            <input
              id="middleLinkBrandName"
              value={brandName}
              onChange={(event) => onBrandNameChange(event.target.value)}
              placeholder="e.g. calvinklein"
              required
            />
          </div>

          <div className="filter-item">
            <label htmlFor="middleLinkTargetCount">Target Count</label>
            <input
              id="middleLinkTargetCount"
              type="number"
              min="1"
              max="200"
              value={targetCount}
              onChange={(event) => onTargetCountChange(event.target.value)}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="middleLinkWindowSeconds">Time Window (s)</label>
            <input
              id="middleLinkWindowSeconds"
              type="number"
              min="30"
              max="3600"
              value={windowSeconds}
              onChange={(event) => onWindowSecondsChange(event.target.value)}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="middleLinkIntervalSeconds">Interval (s)</label>
            <input
              id="middleLinkIntervalSeconds"
              type="number"
              min="1"
              value={intervalSeconds}
              onChange={(event) => onIntervalSecondsChange(event.target.value)}
            />
          </div>
        </form>

        <form className="modal-form" onSubmit={onUpload}>
          <label htmlFor="middleLinkUrls">Middle Link URLs (one per line)</label>
          <textarea
            id="middleLinkUrls"
            rows="5"
            value={urlsText}
            onChange={(event) => onUrlsTextChange(event.target.value)}
            placeholder="https://click.linksynergy.com/deeplink?u1=151919334x3522333213&id=..."
            required
          />
          <div className="form-actions">
            <button type="submit" className="primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Middle Links'}
            </button>
          </div>
        </form>

        <p className="field-help">
          Uploaded links are archived and classified to a Gmail account and platform by Match ID.
          Click Resolve to request a link repeatedly within the time window and collect landing
          pages (default 24); resolved landing pages are archived as Matrix Shift Links under the
          Brand Name. Reload to see progress.
        </p>

        <form className="filter-form" onSubmit={onApplyFilters}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="middleLinkOwnerFilter">Ads Owner</label>
              <select
                id="middleLinkOwnerFilter"
                value={filters.ownerPhoneNumber}
                onChange={(event) =>
                  onFiltersChange({ ...filters, ownerPhoneNumber: event.target.value })
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
            <label htmlFor="middleLinkBrandFilter">Brand Name</label>
            <input
              id="middleLinkBrandFilter"
              value={filters.brandName}
              onChange={(event) =>
                onFiltersChange({ ...filters, brandName: event.target.value })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="middleLinkStatusFilter">Status</label>
            <select
              id="middleLinkStatusFilter"
              value={filters.resolveStatus}
              onChange={(event) =>
                onFiltersChange({ ...filters, resolveStatus: event.target.value })
              }
            >
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="RESOLVING">RESOLVING</option>
              <option value="DONE">DONE</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">
              Search
            </button>
            <button type="button" className="secondary" onClick={onReloadFilters}>
              Reload All
            </button>
          </div>
        </form>

        {middleLinksError ? (
          <p className="status error" role="alert">
            {middleLinksError}
          </p>
        ) : null}
        {middleLinksMessage ? <p className="status success">{middleLinksMessage}</p> : null}
        {middleLinksLoading ? <p>Loading middle links...</p> : null}

        {!middleLinksLoading && middleLinks.length === 0 ? (
          <p>No middle links found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand</th>
                  <th>Gmail</th>
                  <th>Platform</th>
                  <th>Middle Link URL</th>
                  <th>Status</th>
                  <th>Resolved</th>
                  <th>Last Error</th>
                  <th>Create Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {middleLinks.map((item) => (
                  <tr key={item.id} className={getStatusToneClass(item.resolveStatus === 'DONE' ? 'RUNNING' : item.resolveStatus === 'FAILED' ? 'PAUSED' : '')}>
                    <td>{formatTableValue(item.id)}</td>
                    <td>{formatTableValue(item.brandName)}</td>
                    <td>{formatTableValue(item.userName)}</td>
                    <td>{formatTableValue(item.platformName)}</td>
                    <td className="truncate">{formatTableValue(item.fullUrl)}</td>
                    <td>{formatTableValue(item.resolveStatus)}</td>
                    <td>
                      {formatTableValue(item.resolvedCount)} / {formatTableValue(item.targetCount)}
                    </td>
                    <td className="truncate">{formatTableValue(item.lastError)}</td>
                    <td>{formatTableValue(formatDateDisplayValue(item.createDate))}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={resolvingId === item.id || item.resolveStatus === 'RESOLVING'}
                        onClick={() => onResolve(item)}
                      >
                        {item.resolveStatus === 'RESOLVING' ? 'Resolving...' : 'Resolve'}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={item.resolveStatus === 'RESOLVING'}
                        onClick={() => onDelete(item.id)}
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
          isLoading={middleLinksLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default MiddleLinkSection
