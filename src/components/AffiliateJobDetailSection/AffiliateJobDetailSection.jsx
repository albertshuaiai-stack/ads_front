import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function formatBooleanValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return formatTableValue(value)
}

function AffiliateJobDetailSection({
  affiliateJobDetails,
  affiliateJobDetailsLoading,
  affiliateJobDetailsError,
  affiliateJobDetailsMessage,
  onReloadAffiliateJobDetailFilters,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel affiliate-job-detail">
      <div className="user-list">
        <div className="list-header">
          <h3>Auto Job</h3>
          <div className="toolbar-actions">
            <button
              type="button"
              className="secondary"
              onClick={onReloadAffiliateJobDetailFilters}
              disabled={affiliateJobDetailsLoading}
            >
              Reload All
            </button>
          </div>
        </div>

        {affiliateJobDetailsError ? (
          <p className="status error" role="alert">
            {affiliateJobDetailsError}
          </p>
        ) : null}
        {affiliateJobDetailsMessage ? <p className="status success">{affiliateJobDetailsMessage}</p> : null}
        {affiliateJobDetailsLoading ? <p>Loading job details...</p> : null}

        {!affiliateJobDetailsLoading && affiliateJobDetails.length === 0 ? (
          <p>No job details found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sched Name</th>
                  <th>Job Name</th>
                  <th>Job Group</th>
                  <th>Job Class Name</th>
                  <th>Description</th>
                  <th>Durable</th>
                  <th>Nonconcurrent</th>
                  <th>Update Data</th>
                  <th>Requests Recovery</th>
                </tr>
              </thead>
              <tbody>
                {affiliateJobDetails.map((item, index) => (
                  <tr key={`${item.schedName || 'sched'}-${item.jobName || 'job'}-${item.jobGroup || 'group'}-${index}`}>
                    <td>{formatTableValue(item.schedName)}</td>
                    <td>{formatTableValue(item.jobName)}</td>
                    <td>{formatTableValue(item.jobGroup)}</td>
                    <td>{formatTableValue(item.jobClassName)}</td>
                    <td>{formatTableValue(item.description)}</td>
                    <td>{formatBooleanValue(item.isDurable)}</td>
                    <td>{formatBooleanValue(item.isNonconcurrent)}</td>
                    <td>{formatBooleanValue(item.isUpdateData)}</td>
                    <td>{formatBooleanValue(item.requestsRecovery)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          pagination={pagination}
          isLoading={affiliateJobDetailsLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default AffiliateJobDetailSection
