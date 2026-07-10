import { firstDefinedValue, formatTableValue } from '../../lib/adsPortal'
import PaginationControls from '../PaginationControls/PaginationControls'
import './ShiftLinkLogSection.css'

function ShiftLinkLogSection({
  filters,
  adsTypeOptions,
  adsNameOptions,
  platformOptions,
  catalogLoading,
  catalogError,
  logs,
  logsLoading,
  logsError,
  hasLoadedLogs,
  logColumns,
  pagination,
  onFiltersChange,
  onSearch,
  onReload,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel shift-link-log">
      <div className="user-list">
        <div className="list-header">
          <h3>Shift Link Log</h3>
          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary"
              onClick={onReload}
              disabled={catalogLoading || logsLoading}
            >
              Reload All
            </button>
          </div>
        </div>

        <form className="filter-form" onSubmit={onSearch}>
          <div className="filter-item">
            <label htmlFor="shiftLinkLogAdsType">Ads Type</label>
            <select
              id="shiftLinkLogAdsType"
              value={filters.adsType}
              onChange={(event) =>
                onFiltersChange({
                  adsType: event.target.value,
                  adsName: '',
                  platformName: '',
                })
              }
              disabled={catalogLoading || adsTypeOptions.length === 0}
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
            <label htmlFor="shiftLinkLogAdsName">Ads Name</label>
            <select
              id="shiftLinkLogAdsName"
              value={filters.adsName}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  adsName: event.target.value,
                  platformName: '',
                })
              }
              disabled={catalogLoading || !filters.adsType || adsNameOptions.length === 0}
            >
              <option value="">All ads names</option>
              {adsNameOptions.map((adsName) => (
                <option key={adsName} value={adsName}>
                  {adsName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="shiftLinkLogPlatformName">Platform Name</label>
            <select
              id="shiftLinkLogPlatformName"
              value={filters.platformName}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  platformName: event.target.value,
                })
              }
              disabled={
                catalogLoading ||
                !filters.adsType ||
                !filters.adsName ||
                platformOptions.length === 0
              }
            >
              <option value="">All platforms</option>
              {platformOptions.map((platformName) => (
                <option key={platformName} value={platformName}>
                  {platformName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary"
              disabled={catalogLoading || logsLoading}
            >
              {logsLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        <p className="field-help">
          Shows the current logged-in user&apos;s Shift Link Logs by default. Use
          <code> adsType</code>, <code>adsName</code>, and <code>platformName</code> to narrow the
          results.
        </p>

        {catalogError ? (
          <p className="status error" role="alert">
            {catalogError}
          </p>
        ) : null}
        {logsError ? (
          <p className="status error" role="alert">
            {logsError}
          </p>
        ) : null}
        {catalogLoading ? <p>Loading Shift Link Log filters...</p> : null}
        {logsLoading ? <p>Loading Shift Link Logs...</p> : null}

        {!catalogLoading && !logsLoading && !hasLoadedLogs ? (
          <p className="field-help">
            Loading the current logged-in user&apos;s Shift Link Logs.
          </p>
        ) : null}

        {!catalogLoading && !logsLoading && hasLoadedLogs && logs.length === 0 ? (
          <p>No Shift Link Logs found.</p>
        ) : null}

        {!catalogLoading && !logsLoading && logs.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {logColumns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item) => (
                    <tr key={item.id ?? `${item.adsType}-${item.adsName}-${item.platformName}-${item.createDate}`}>
                      {logColumns.map((column) => (
                        <td key={column.key} className={column.key === 'fullUrl' ? 'truncate' : ''}>
                          {formatTableValue(firstDefinedValue(item, column.fields))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={pagination}
              isLoading={logsLoading}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ShiftLinkLogSection
