import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import { formatDateTimeDisplayValue } from '../../utils/formatters'

function formatSyncTypeValue(value) {
  const normalized = String(value ?? '').trim().toUpperCase()

  if (normalized === 'MANUALLY' || normalized === 'MANUAL') {
    return 'MANUAL'
  }

  return formatTableValue(value)
}

function isTaskInProgress(status) {
  const normalized = String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '')

  return normalized === 'INPROGRESS'
}

function isSchedulerSyncType(syncType) {
  return String(syncType ?? '').trim().toUpperCase() === 'SCHEDULER'
}

function AffiliateSyncTaskManagementSection({
  affiliateSyncTasks,
  affiliateSyncTasksLoading,
  affiliateSyncTasksError,
  affiliateSyncTasksMessage,
  affiliateSyncTaskFilters,
  onAffiliateSyncTaskFiltersChange,
  onApplyAffiliateSyncTaskFilters,
  onReloadAffiliateSyncTaskFilters,
  onCreateAffiliateSyncTask,
  onEditAffiliateSyncTask,
  onDeleteAffiliateSyncTask,
  onRunAffiliateSyncTask,
  showAffiliateSyncTaskModal,
  editingAffiliateSyncTaskId,
  affiliateSyncTaskConfigId,
  onAffiliateSyncTaskConfigIdChange,
  affiliateSyncTaskRegion,
  onAffiliateSyncTaskRegionChange,
  affiliateSyncTaskType,
  onAffiliateSyncTaskTypeChange,
  affiliateSyncTaskCron,
  onAffiliateSyncTaskCronChange,
  onSaveAffiliateSyncTask,
  savingAffiliateSyncTask,
  runningAffiliateSyncTaskId,
  onCloseAffiliateSyncTaskModal,
  showOwnerFilter,
  ownerOptions,
  affiliateSyncConfigOptions,
  affiliateSyncConfigOptionsLoading,
  countryOptions,
  syncTypeOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  const shouldShowCronField = affiliateSyncTaskType === 'SCHEDULER'

  return (
    <>
      <div className="panel affiliate-sync-task-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Auto Sync Task</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAffiliateSyncTask}>
                Add Ads Sync Task
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAffiliateSyncTaskFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="affiliateSyncTaskOwnerFilter">Owner</label>
                <select
                  id="affiliateSyncTaskOwnerFilter"
                  value={affiliateSyncTaskFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAffiliateSyncTaskFiltersChange({
                      ...affiliateSyncTaskFilters,
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
              <label htmlFor="affiliateSyncTaskConfigFilter">Ads Sync Config</label>
              <select
                id="affiliateSyncTaskConfigFilter"
                value={affiliateSyncTaskFilters.affiliateAdsSyncConfigId}
                onChange={(event) =>
                  onAffiliateSyncTaskFiltersChange({
                    ...affiliateSyncTaskFilters,
                    affiliateAdsSyncConfigId: event.target.value,
                  })
                }
                disabled={affiliateSyncConfigOptionsLoading}
              >
                <option value="">All configs</option>
                {affiliateSyncConfigOptions.map((option) => (
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
              <button type="button" className="secondary" onClick={onReloadAffiliateSyncTaskFilters}>
                Reload All
              </button>
            </div>
          </form>

          {affiliateSyncTasksError ? (
            <p className="status error" role="alert">
              {affiliateSyncTasksError}
            </p>
          ) : null}
          {affiliateSyncTasksMessage ? <p className="status success">{affiliateSyncTasksMessage}</p> : null}
          {affiliateSyncTasksLoading ? <p>Loading Ads Sync Tasks...</p> : null}

          {!affiliateSyncTasksLoading && affiliateSyncTasks.length === 0 ? (
            <p>No Ads Sync Tasks found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ads Sync Config ID</th>
                    <th>Region</th>
                    <th>Sync Type</th>
                    <th>Cron</th>
                    <th>Total Count</th>
                    <th>Success Count</th>
                    <th>Failed Count</th>
                    <th>Status</th>
                    <th>Pre Start Date</th>
                    <th>Pre End Date</th>
                    <th>Pre Duration</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateSyncTasks.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.affiliateAdsSyncConfigId)}</td>
                      <td>{formatTableValue(item.region)}</td>
                      <td>{formatSyncTypeValue(item.syncType)}</td>
                      <td>{formatTableValue(item.cron)}</td>
                      <td>{formatTableValue(item.totalCount)}</td>
                      <td>{formatTableValue(item.successCount)}</td>
                      <td>{formatTableValue(item.failedCount)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateTimeDisplayValue(item.preStartDate)}</td>
                      <td>{formatDateTimeDisplayValue(item.preEndDate)}</td>
                      <td>{formatTableValue(item.preDuration)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        {isTaskInProgress(item.status) || isSchedulerSyncType(item.syncType) ? null : (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onRunAffiliateSyncTask(item.id)}
                            disabled={runningAffiliateSyncTaskId === item.id}
                          >
                            {runningAffiliateSyncTaskId === item.id ? 'Syncing...' : 'Sync Ads'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditAffiliateSyncTask(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAffiliateSyncTask(item.id)}
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
            isLoading={affiliateSyncTasksLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAffiliateSyncTaskModal ? (
        <InlineFormCard
          title={editingAffiliateSyncTaskId ? `Update Ads Sync Task #${editingAffiliateSyncTaskId}` : 'Add Ads Sync Task'}
          onClose={onCloseAffiliateSyncTaskModal}
        >
          <form className="modal-form" onSubmit={onSaveAffiliateSyncTask}>
            <label htmlFor="affiliateSyncTaskConfigId">Ads Sync Config</label>
            <select
              id="affiliateSyncTaskConfigId"
              value={affiliateSyncTaskConfigId}
              onChange={(event) => onAffiliateSyncTaskConfigIdChange(event.target.value)}
              disabled={affiliateSyncConfigOptionsLoading}
              required
            >
              <option value="">Select ads sync config</option>
              {affiliateSyncConfigOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateSyncTaskRegion">Region</label>
            <select
              id="affiliateSyncTaskRegion"
              value={affiliateSyncTaskRegion}
              onChange={(event) => onAffiliateSyncTaskRegionChange(event.target.value)}
              required
            >
              <option value="">Select region</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateSyncTaskType">Sync Type</label>
            <select
              id="affiliateSyncTaskType"
              value={affiliateSyncTaskType}
              onChange={(event) => onAffiliateSyncTaskTypeChange(event.target.value)}
              required
            >
              <option value="">Select sync type</option>
              {syncTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {shouldShowCronField ? (
              <>
                <label htmlFor="affiliateSyncTaskCron">Cron</label>
                <input
                  id="affiliateSyncTaskCron"
                  value={affiliateSyncTaskCron}
                  onChange={(event) => onAffiliateSyncTaskCronChange(event.target.value)}
                  required
                />
              </>
            ) : null}

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAffiliateSyncTask}>
                {savingAffiliateSyncTask
                  ? 'Saving...'
                  : editingAffiliateSyncTaskId
                    ? 'Update Ads Sync Task'
                    : 'Add Ads Sync Task'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAffiliateSyncTaskModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AffiliateSyncTaskManagementSection
