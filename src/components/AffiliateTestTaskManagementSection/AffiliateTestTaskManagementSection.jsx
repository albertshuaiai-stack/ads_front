import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import { formatDateTimeDisplayValue } from '../../utils/formatters'

function isTaskInProgress(status) {
  const normalized = String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '')

  return normalized === 'INPROGRESS'
}

function AffiliateTestTaskManagementSection({
  affiliateTestTasks,
  affiliateTestTasksLoading,
  affiliateTestTasksError,
  affiliateTestTasksMessage,
  affiliateTestTaskFilters,
  onAffiliateTestTaskFiltersChange,
  onApplyAffiliateTestTaskFilters,
  onReloadAffiliateTestTaskFilters,
  onCreateAffiliateTestTask,
  onEditAffiliateTestTask,
  onDeleteAffiliateTestTask,
  onRunAffiliateTestTask,
  showAffiliateTestTaskModal,
  editingAffiliateTestTaskId,
  affiliateTestTaskConfigId,
  onAffiliateTestTaskConfigIdChange,
  affiliateTestTaskRegion,
  onAffiliateTestTaskRegionChange,
  affiliateTestTaskIpProxyInfoId,
  onAffiliateTestTaskIpProxyInfoIdChange,
  onSaveAffiliateTestTask,
  savingAffiliateTestTask,
  runningAffiliateTestTaskId,
  onCloseAffiliateTestTaskModal,
  showOwnerFilter,
  ownerOptions,
  affiliateSyncConfigOptions,
  affiliateSyncConfigOptionsLoading,
  ipProxyOptions,
  ipProxyOptionsLoading,
  countryOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel affiliate-test-task-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Ads Test Task</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAffiliateTestTask}>
                Add Ads Test Task
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAffiliateTestTaskFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="affiliateTestTaskOwnerFilter">Owner</label>
                <select
                  id="affiliateTestTaskOwnerFilter"
                  value={affiliateTestTaskFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAffiliateTestTaskFiltersChange({
                      ...affiliateTestTaskFilters,
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
              <label htmlFor="affiliateTestTaskConfigFilter">Ads Sync Config</label>
              <select
                id="affiliateTestTaskConfigFilter"
                value={affiliateTestTaskFilters.affiliateAdsSyncConfigId}
                onChange={(event) =>
                  onAffiliateTestTaskFiltersChange({
                    ...affiliateTestTaskFilters,
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
              <button type="button" className="secondary" onClick={onReloadAffiliateTestTaskFilters}>
                Reload All
              </button>
            </div>
          </form>

          {affiliateTestTasksError ? (
            <p className="status error" role="alert">
              {affiliateTestTasksError}
            </p>
          ) : null}
          {affiliateTestTasksMessage ? <p className="status success">{affiliateTestTasksMessage}</p> : null}
          {affiliateTestTasksLoading ? <p>Loading Ads Test Tasks...</p> : null}

          {!affiliateTestTasksLoading && affiliateTestTasks.length === 0 ? (
            <p>No Ads Test Tasks found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ads Sync Config ID</th>
                    <th>Region</th>
                    <th>IP Proxy Info ID</th>
                    <th>Total Count</th>
                    <th>Success Count</th>
                    <th>Failed Count</th>
                    <th>Pre Start Date</th>
                    <th>Pre End Date</th>
                    <th>Pre Duration</th>
                    <th>Status</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateTestTasks.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.affiliateAdsSyncConfigId)}</td>
                      <td>{formatTableValue(item.region)}</td>
                      <td>{formatTableValue(item.ipProxyInfoId)}</td>
                      <td>{formatTableValue(item.totalCount)}</td>
                      <td>{formatTableValue(item.successCount)}</td>
                      <td>{formatTableValue(item.failedCount)}</td>
                      <td>{formatDateTimeDisplayValue(item.preStartDate)}</td>
                      <td>{formatDateTimeDisplayValue(item.preEndDate)}</td>
                      <td>{formatTableValue(item.preDuration)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        {isTaskInProgress(item.status) ? null : (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onRunAffiliateTestTask(item.id)}
                            disabled={runningAffiliateTestTaskId === item.id}
                          >
                            {runningAffiliateTestTaskId === item.id ? 'Testing...' : 'Test Ads'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditAffiliateTestTask(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAffiliateTestTask(item.id)}
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
            isLoading={affiliateTestTasksLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAffiliateTestTaskModal ? (
        <InlineFormCard
          title={editingAffiliateTestTaskId ? `Update Ads Test Task #${editingAffiliateTestTaskId}` : 'Add Ads Test Task'}
          onClose={onCloseAffiliateTestTaskModal}
        >
          <form className="modal-form" onSubmit={onSaveAffiliateTestTask}>
            <label htmlFor="affiliateTestTaskConfigId">Ads Sync Config</label>
            <select
              id="affiliateTestTaskConfigId"
              value={affiliateTestTaskConfigId}
              onChange={(event) => onAffiliateTestTaskConfigIdChange(event.target.value)}
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

            <label htmlFor="affiliateTestTaskRegion">Region</label>
            <select
              id="affiliateTestTaskRegion"
              value={affiliateTestTaskRegion}
              onChange={(event) => onAffiliateTestTaskRegionChange(event.target.value)}
              required
            >
              <option value="">Select region</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateTestTaskIpProxyInfoId">IP Proxy</label>
            <select
              id="affiliateTestTaskIpProxyInfoId"
              value={affiliateTestTaskIpProxyInfoId}
              onChange={(event) => onAffiliateTestTaskIpProxyInfoIdChange(event.target.value)}
              disabled={ipProxyOptionsLoading}
              required
            >
              <option value="">Select IP proxy</option>
              {ipProxyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAffiliateTestTask}>
                {savingAffiliateTestTask
                  ? 'Saving...'
                  : editingAffiliateTestTaskId
                    ? 'Update Ads Test Task'
                    : 'Add Ads Test Task'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAffiliateTestTaskModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AffiliateTestTaskManagementSection
