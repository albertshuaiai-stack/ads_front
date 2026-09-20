import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function ToolIpManagementSection({
  toolIps,
  toolIpsLoading,
  toolIpsError,
  toolIpsMessage,
  toolIpFilters,
  onToolIpFiltersChange,
  onApplyToolIpFilters,
  onReloadToolIpFilters,
  onCreateToolIp,
  onEditToolIp,
  onDeleteToolIp,
  showToolIpModal,
  editingToolIpId,
  toolIpString,
  onToolIpStringChange,
  toolIpRemarks,
  onToolIpRemarksChange,
  toolIpStartDate,
  onToolIpStartDateChange,
  toolIpExpireDate,
  onToolIpExpireDateChange,
  onSaveToolIp,
  savingToolIp,
  onCloseToolIpModal,
  showOwnerFilter,
  ownerOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel ip-proxy-management">
        <div className="user-list">
          <div className="list-header">
            <h3>IP Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateToolIp}>
                Add IP
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyToolIpFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="toolIpManagementOwnerFilter">Ads Owner</label>
                <select
                  id="toolIpManagementOwnerFilter"
                  value={toolIpFilters.adsOwner}
                  onChange={(event) =>
                    onToolIpFiltersChange({
                      ...toolIpFilters,
                      adsOwner: event.target.value,
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
              <label htmlFor="toolIpManagementIpStringFilter">IP</label>
              <input
                id="toolIpManagementIpStringFilter"
                value={toolIpFilters.ipString}
                onChange={(event) =>
                  onToolIpFiltersChange({
                    ...toolIpFilters,
                    ipString: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadToolIpFilters}>
                Reload All
              </button>
            </div>
          </form>

          {toolIpsError ? (
            <p className="status error" role="alert">
              {toolIpsError}
            </p>
          ) : null}
          {toolIpsMessage ? <p className="status success">{toolIpsMessage}</p> : null}
          {toolIpsLoading ? <p>Loading IPs...</p> : null}

          {!toolIpsLoading && toolIps.length === 0 ? (
            <p>No IPs found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>IP</th>
                    <th>Start Date</th>
                    <th>Expire Date</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toolIps.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.ip || item.ipString)}</td>
                      <td>{formatDateDisplayValue(item.startDate)}</td>
                      <td>{formatDateDisplayValue(item.expireDate)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditToolIp(item)}>
                          Edit
                        </button>
                        <button type="button" className="secondary" onClick={() => onDeleteToolIp(item.id)}>
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
            isLoading={toolIpsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showToolIpModal ? (
        <InlineFormCard
          title={editingToolIpId ? `Update IP #${editingToolIpId}` : 'Add IP'}
          onClose={onCloseToolIpModal}
        >
          <form className="modal-form" onSubmit={onSaveToolIp}>
            <label htmlFor="toolIpManagementIpString">IP</label>
            <input
              id="toolIpManagementIpString"
              value={toolIpString}
              onChange={(event) => onToolIpStringChange(event.target.value)}
              required
            />

            <label htmlFor="toolIpManagementStartDate">Start Date</label>
            <input
              id="toolIpManagementStartDate"
              type="date"
              value={toolIpStartDate}
              onChange={(event) => onToolIpStartDateChange(event.target.value)}
            />

            <label htmlFor="toolIpManagementExpireDate">Expire Date</label>
            <input
              id="toolIpManagementExpireDate"
              type="date"
              value={toolIpExpireDate}
              onChange={(event) => onToolIpExpireDateChange(event.target.value)}
            />

            <label htmlFor="toolIpManagementRemarks">Remarks</label>
            <input
              id="toolIpManagementRemarks"
              value={toolIpRemarks}
              onChange={(event) => onToolIpRemarksChange(event.target.value)}
            />


            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingToolIp}>
                {savingToolIp ? 'Saving...' : editingToolIpId ? 'Update IP' : 'Add IP'}
              </button>
              <button type="button" className="secondary" onClick={onCloseToolIpModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default ToolIpManagementSection
