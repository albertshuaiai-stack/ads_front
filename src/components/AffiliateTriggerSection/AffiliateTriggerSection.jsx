import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import { formatDateTimeDisplayValue } from '../../utils/formatters'

function AffiliateTriggerSection({
  affiliateTriggers,
  affiliateTriggersLoading,
  affiliateTriggersError,
  affiliateTriggersMessage,
  affiliateTriggerFilters,
  onAffiliateTriggerFiltersChange,
  onApplyAffiliateTriggerFilters,
  onReloadAffiliateTriggerFilters,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel affiliate-trigger">
      <div className="user-list">
        <div className="list-header">
          <h3>Auto Trigger</h3>
        </div>

        <form className="filter-form" onSubmit={onApplyAffiliateTriggerFilters}>
          <div className="filter-item">
            <label htmlFor="affiliateTriggerSchedNameFilter">Sched Name</label>
            <input
              id="affiliateTriggerSchedNameFilter"
              value={affiliateTriggerFilters.schedName}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  schedName: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerNameFilter">Trigger Name</label>
            <input
              id="affiliateTriggerNameFilter"
              value={affiliateTriggerFilters.triggerName}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  triggerName: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerGroupFilter">Trigger Group</label>
            <input
              id="affiliateTriggerGroupFilter"
              value={affiliateTriggerFilters.triggerGroup}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  triggerGroup: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerJobNameFilter">Job Name</label>
            <input
              id="affiliateTriggerJobNameFilter"
              value={affiliateTriggerFilters.jobName}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  jobName: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerJobGroupFilter">Job Group</label>
            <input
              id="affiliateTriggerJobGroupFilter"
              value={affiliateTriggerFilters.jobGroup}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  jobGroup: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerStateFilter">Trigger State</label>
            <input
              id="affiliateTriggerStateFilter"
              value={affiliateTriggerFilters.triggerState}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  triggerState: event.target.value,
                })
              }
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliateTriggerTypeFilter">Trigger Type</label>
            <input
              id="affiliateTriggerTypeFilter"
              value={affiliateTriggerFilters.triggerType}
              onChange={(event) =>
                onAffiliateTriggerFiltersChange({
                  ...affiliateTriggerFilters,
                  triggerType: event.target.value,
                })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">
              Search
            </button>
            <button type="button" className="secondary" onClick={onReloadAffiliateTriggerFilters}>
              Reload All
            </button>
          </div>
        </form>

        {affiliateTriggersError ? (
          <p className="status error" role="alert">
            {affiliateTriggersError}
          </p>
        ) : null}
        {affiliateTriggersMessage ? <p className="status success">{affiliateTriggersMessage}</p> : null}
        {affiliateTriggersLoading ? <p>Loading triggers...</p> : null}

        {!affiliateTriggersLoading && affiliateTriggers.length === 0 ? (
          <p>No triggers found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sched Name</th>
                  <th>Trigger Name</th>
                  <th>Trigger Group</th>
                  <th>Job Name</th>
                  <th>Job Group</th>
                  <th>Description</th>
                  <th>State</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Start Time</th>
                  <th>Next Fire Time</th>
                  <th>Prev Fire Time</th>
                  <th>End Time</th>
                  <th>Calendar Name</th>
                  <th>Misfire Instr</th>
                </tr>
              </thead>
              <tbody>
                {affiliateTriggers.map((item, index) => (
                  <tr
                    key={`${item.schedName || 'sched'}-${item.triggerName || 'trigger'}-${item.triggerGroup || 'group'}-${index}`}
                  >
                    <td>{formatTableValue(item.schedName)}</td>
                    <td>{formatTableValue(item.triggerName)}</td>
                    <td>{formatTableValue(item.triggerGroup)}</td>
                    <td>{formatTableValue(item.jobName)}</td>
                    <td>{formatTableValue(item.jobGroup)}</td>
                    <td>{formatTableValue(item.description)}</td>
                    <td>{formatTableValue(item.triggerState)}</td>
                    <td>{formatTableValue(item.triggerType)}</td>
                    <td>{formatTableValue(item.priority)}</td>
                    <td>{formatDateTimeDisplayValue(item.startTime)}</td>
                    <td>{formatDateTimeDisplayValue(item.nextFireTime)}</td>
                    <td>{formatDateTimeDisplayValue(item.prevFireTime)}</td>
                    <td>{formatDateTimeDisplayValue(item.endTime)}</td>
                    <td>{formatTableValue(item.calendarName)}</td>
                    <td>{formatTableValue(item.misfireInstr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          pagination={pagination}
          isLoading={affiliateTriggersLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default AffiliateTriggerSection
