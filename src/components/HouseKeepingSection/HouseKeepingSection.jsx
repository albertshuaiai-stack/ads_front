import { firstDefinedValue, formatTableValue } from '../../lib/adsPortal'
import {
  formatDateDisplayValue,
  formatDateTimeDisplayValueWithDashedDate,
} from '../../utils/formatters'
import PaginationControls from '../PaginationControls/PaginationControls'

function formatHouseKeepingValue(columnKey, value) {
  if (columnKey === 'houseKeepingDate') {
    return formatDateDisplayValue(value)
  }

  if (columnKey === 'startDate' || columnKey === 'endDate') {
    return formatDateTimeDisplayValueWithDashedDate(value)
  }

  return formatTableValue(value)
}

function HouseKeepingSection({
  logs,
  logsLoading,
  logsError,
  hasLoadedLogs,
  logColumns,
  pagination,
  onReload,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel house-keeping">
      <div className="user-list">
        <div className="list-header">
          <h3>House Keeping</h3>
          <div className="toolbar-actions">
            <button type="button" className="secondary" onClick={onReload} disabled={logsLoading}>
              Reload All
            </button>
          </div>
        </div>

        <p className="field-help">Shows the recent House Keeping execution logs.</p>

        {logsError ? (
          <p className="status error" role="alert">
            {logsError}
          </p>
        ) : null}
        {logsLoading ? <p>Loading House Keeping logs...</p> : null}

        {!logsLoading && !hasLoadedLogs ? <p className="field-help">Loading House Keeping logs.</p> : null}

        {!logsLoading && hasLoadedLogs && logs.length === 0 ? <p>No House Keeping logs found.</p> : null}

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
                  {logs.map((item, index) => (
                    <tr key={item.id ?? `${item.houseKeepingDate}-${item.startDate}-${index}`}>
                      {logColumns.map((column) => {
                        const value = firstDefinedValue(item, column.fields)

                        return (
                          <td key={column.key}>
                            {formatHouseKeepingValue(column.key, value)}
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

export default HouseKeepingSection
