import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function isInProgressStatus(value) {
  return String(value ?? '').trim().toUpperCase() === 'IN_PROGRESS'
}

function isSyncTask(value) {
  return String(value ?? '').trim().toUpperCase() === 'SYNC'
}

function isTestTask(value) {
  return String(value ?? '').trim().toUpperCase() === 'TEST'
}

function AffiliateAutoTaskManagementSection({
  affiliateAutoTasks,
  affiliateAutoTasksLoading,
  affiliateAutoTasksError,
  affiliateAutoTasksMessage,
  affiliateAutoTaskFilters,
  onAffiliateAutoTaskFiltersChange,
  onApplyAffiliateAutoTaskFilters,
  onReloadAffiliateAutoTaskFilters,
  onCreateAffiliateAutoTask,
  onEditAffiliateAutoTask,
  onDeleteAffiliateAutoTask,
  onRunAffiliateAutoTaskSync,
  onRunAffiliateAutoTaskTest,
  runningAffiliateAutoTaskId,
  showAffiliateAutoTaskModal,
  editingAffiliateAutoTaskId,
  affiliateAutoTaskNetwork,
  onAffiliateAutoTaskNetworkChange,
  affiliateAutoTaskType,
  onAffiliateAutoTaskTypeChange,
  affiliateAutoTaskRegion,
  onAffiliateAutoTaskRegionChange,
  onSaveAffiliateAutoTask,
  savingAffiliateAutoTask,
  onCloseAffiliateAutoTaskModal,
  showOwnerFilter,
  ownerOptions,
  affiliateAutoTaskNetworkOptions,
  affiliateAutoTaskTypeOptions,
  affiliateAutoTaskStatusOptions,
  countryOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel affiliate-auto-task-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Auto Task</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAffiliateAutoTask}>
                Add Auto Task
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAffiliateAutoTaskFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="affiliateAutoTaskOwnerFilter">Owner</label>
                <select
                  id="affiliateAutoTaskOwnerFilter"
                  value={affiliateAutoTaskFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAffiliateAutoTaskFiltersChange({
                      ...affiliateAutoTaskFilters,
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
              <label htmlFor="affiliateAutoTaskNetworkFilter">Affiliate Network</label>
              <select
                id="affiliateAutoTaskNetworkFilter"
                value={affiliateAutoTaskFilters.affiliateNetwork}
                onChange={(event) =>
                  onAffiliateAutoTaskFiltersChange({
                    ...affiliateAutoTaskFilters,
                    affiliateNetwork: event.target.value,
                  })
                }
              >
                <option value="">All affiliate networks</option>
                {affiliateAutoTaskNetworkOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="affiliateAutoTaskRegionFilter">Region</label>
              <select
                id="affiliateAutoTaskRegionFilter"
                value={affiliateAutoTaskFilters.region}
                onChange={(event) =>
                  onAffiliateAutoTaskFiltersChange({
                    ...affiliateAutoTaskFilters,
                    region: event.target.value,
                  })
                }
              >
                <option value="">All regions</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="affiliateAutoTaskStatusFilter">Status</label>
              <select
                id="affiliateAutoTaskStatusFilter"
                value={affiliateAutoTaskFilters.status}
                onChange={(event) =>
                  onAffiliateAutoTaskFiltersChange({
                    ...affiliateAutoTaskFilters,
                    status: event.target.value,
                  })
                }
              >
                <option value="">All statuses</option>
                {affiliateAutoTaskStatusOptions.map((option) => (
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
              <button type="button" className="secondary" onClick={onReloadAffiliateAutoTaskFilters}>
                Reload All
              </button>
            </div>
          </form>

          {affiliateAutoTasksError ? (
            <p className="status error" role="alert">
              {affiliateAutoTasksError}
            </p>
          ) : null}
          {affiliateAutoTasksMessage ? <p className="status success">{affiliateAutoTasksMessage}</p> : null}
          {affiliateAutoTasksLoading ? <p>Loading Auto Tasks...</p> : null}

          {!affiliateAutoTasksLoading && affiliateAutoTasks.length === 0 ? (
            <p>No Auto Tasks found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Affiliate Network</th>
                    <th>Auto Task Type</th>
                    <th>Region</th>
                    <th>Total Count</th>
                    <th>Success Count</th>
                    <th>Failed Count</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateAutoTasks.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.affiliateNetwork)}</td>
                      <td>{formatTableValue(item.autoTaskType)}</td>
                      <td>{formatTableValue(item.region)}</td>
                      <td>{formatTableValue(item.totalCount)}</td>
                      <td>{formatTableValue(item.successCount)}</td>
                      <td>{formatTableValue(item.failedCount)}</td>
                      <td>{formatDateDisplayValue(item.startDate)}</td>
                      <td>{formatDateDisplayValue(item.endDate)}</td>
                      <td>{formatTableValue(item.duration)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        {isSyncTask(item.autoTaskType) && !isInProgressStatus(item.status) ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onRunAffiliateAutoTaskSync(item.id)}
                            disabled={runningAffiliateAutoTaskId === item.id}
                          >
                            {runningAffiliateAutoTaskId === item.id ? 'Syncing...' : 'Sync'}
                          </button>
                        ) : null}
                        {isTestTask(item.autoTaskType) && !isInProgressStatus(item.status) ? (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onRunAffiliateAutoTaskTest(item.id)}
                            disabled={runningAffiliateAutoTaskId === item.id}
                          >
                            {runningAffiliateAutoTaskId === item.id ? 'Testing...' : 'Test'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditAffiliateAutoTask(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAffiliateAutoTask(item.id)}
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
            isLoading={affiliateAutoTasksLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAffiliateAutoTaskModal ? (
        <InlineFormCard
          title={
            editingAffiliateAutoTaskId
              ? `Update Auto Task #${editingAffiliateAutoTaskId}`
              : 'Add Auto Task'
          }
          onClose={onCloseAffiliateAutoTaskModal}
        >
          <form className="modal-form" onSubmit={onSaveAffiliateAutoTask}>
            <label htmlFor="affiliateAutoTaskNetwork">Affiliate Network</label>
            <select
              id="affiliateAutoTaskNetwork"
              value={affiliateAutoTaskNetwork}
              onChange={(event) => onAffiliateAutoTaskNetworkChange(event.target.value)}
              required
            >
              <option value="">Select affiliate network</option>
              {affiliateAutoTaskNetworkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateAutoTaskType">Auto Task Type</label>
            <select
              id="affiliateAutoTaskType"
              value={affiliateAutoTaskType}
              onChange={(event) => onAffiliateAutoTaskTypeChange(event.target.value)}
              required
            >
              <option value="">Select auto task type</option>
              {affiliateAutoTaskTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateAutoTaskRegion">Region</label>
            <select
              id="affiliateAutoTaskRegion"
              value={affiliateAutoTaskRegion}
              onChange={(event) => onAffiliateAutoTaskRegionChange(event.target.value)}
              required
            >
              <option value="">Select region</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAffiliateAutoTask}>
                {savingAffiliateAutoTask
                  ? 'Saving...'
                  : editingAffiliateAutoTaskId
                    ? 'Update Auto Task'
                    : 'Add Auto Task'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAffiliateAutoTaskModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AffiliateAutoTaskManagementSection
