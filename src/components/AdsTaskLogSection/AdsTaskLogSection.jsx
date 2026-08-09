import { firstDefinedValue, formatTableValue } from '../../lib/adsPortal'
import PaginationControls from '../PaginationControls/PaginationControls'

function AdsTaskLogSection({
  filters,
  adsTypeOptions,
  logs,
  logsLoading,
  logsError,
  hasLoadedLogs,
  logColumns,
  pagination,
  showOwnerFilter,
  ownerOptions,
  formatDateDisplayValue,
  onFiltersChange,
  onSearch,
  onReload,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel ads-task-log">
      <div className="user-list">
        <div className="list-header">
          <h3>Ads Task Log</h3>
          <div className="toolbar-actions">
            <button type="button" className="secondary" onClick={onReload} disabled={logsLoading}>
              Reload All
            </button>
          </div>
        </div>

        <form className="filter-form" onSubmit={onSearch}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="adsTaskLogOwner">Ads Owner</label>
              <select
                id="adsTaskLogOwner"
                value={filters.ownerPhoneNumber}
                onChange={(event) =>
                  onFiltersChange({
                    ...filters,
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
            <label htmlFor="adsTaskLogAdsType">Ads Type</label>
            <select
              id="adsTaskLogAdsType"
              value={filters.adsType}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  adsType: event.target.value,
                })
              }
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
            <label htmlFor="adsTaskLogAdsName">Ads Name</label>
            <input
              id="adsTaskLogAdsName"
              value={filters.adsName}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  adsName: event.target.value,
                })
              }
              placeholder="Filter by ads name"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={logsLoading}>
              {logsLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {logsError ? (
          <p className="status error" role="alert">
            {logsError}
          </p>
        ) : null}
        {logsLoading ? <p>Loading Ads Task Logs...</p> : null}

        {!logsLoading && !hasLoadedLogs ? (
          <p className="field-help">Loading the current logged-in user&apos;s Ads Task Logs.</p>
        ) : null}

        {!logsLoading && hasLoadedLogs && logs.length === 0 ? <p>No Ads Task Logs found.</p> : null}

        {!logsLoading && logs.length > 0 ? (
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
                    <tr key={item.id ?? `${item.adsType}-${item.adsName}-${item.sequence}-${item.createDate}`}>
                      {logColumns.map((column) => {
                        const value = firstDefinedValue(item, column.fields)
                        const isDateColumn = column.key === 'createDate'
                        const isLongTextColumn = ['userAgent', 'requestUrl', 'responseUrl', 'location', 'errMsg'].includes(column.key)

                        return (
                          <td key={column.key} className={isLongTextColumn ? 'truncate' : ''}>
                            {isDateColumn ? formatDateDisplayValue(value) : formatTableValue(value)}
                          </td>
                        )
                      })}
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

export default AdsTaskLogSection
