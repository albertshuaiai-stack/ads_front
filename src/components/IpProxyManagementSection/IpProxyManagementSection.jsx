import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function IpProxyManagementSection({
  ipProxies,
  ipProxiesLoading,
  ipProxiesError,
  ipProxiesMessage,
  ipProxyFilters,
  onIpProxyFiltersChange,
  onApplyIpProxyFilters,
  onReloadIpProxyFilters,
  onCreateIpProxy,
  onEditIpProxy,
  onDeleteIpProxy,
  showIpProxyModal,
  editingIpProxyId,
  ipProxyType,
  onIpProxyTypeChange,
  ipProxyProtocol,
  onIpProxyProtocolChange,
  ipProxyInfo,
  onIpProxyInfoChange,
  ipProxyStatus,
  onIpProxyStatusChange,
  onSaveIpProxy,
  savingIpProxy,
  onCloseIpProxyModal,
  showOwnerFilter,
  ownerOptions,
  ipProxyTypeOptions,
  ipProxyProtocolOptions,
  ipProxyStatusOptions,
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
            <h3>IP Proxy Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateIpProxy}>
                Add IP Proxy
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyIpProxyFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="ipProxyManagementOwnerFilter">Owner</label>
                <select
                  id="ipProxyManagementOwnerFilter"
                  value={ipProxyFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onIpProxyFiltersChange({
                      ...ipProxyFilters,
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
              <label htmlFor="ipProxyManagementProxyTypeFilter">Proxy Type</label>
              <select
                id="ipProxyManagementProxyTypeFilter"
                value={ipProxyFilters.proxyType}
                onChange={(event) =>
                  onIpProxyFiltersChange({
                    ...ipProxyFilters,
                    proxyType: event.target.value,
                  })
                }
              >
                <option value="">All proxy types</option>
                {ipProxyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="ipProxyManagementProxyProtocolFilter">Proxy Protocol</label>
              <select
                id="ipProxyManagementProxyProtocolFilter"
                value={ipProxyFilters.proxyProtocol}
                onChange={(event) =>
                  onIpProxyFiltersChange({
                    ...ipProxyFilters,
                    proxyProtocol: event.target.value,
                  })
                }
              >
                <option value="">All proxy protocols</option>
                {ipProxyProtocolOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="ipProxyManagementStatusFilter">Status</label>
              <select
                id="ipProxyManagementStatusFilter"
                value={ipProxyFilters.status}
                onChange={(event) =>
                  onIpProxyFiltersChange({
                    ...ipProxyFilters,
                    status: event.target.value,
                  })
                }
              >
                <option value="">All statuses</option>
                {ipProxyStatusOptions.map((option) => (
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
              <button type="button" className="secondary" onClick={onReloadIpProxyFilters}>
                Reload All
              </button>
            </div>
          </form>

          {ipProxiesError ? (
            <p className="status error" role="alert">
              {ipProxiesError}
            </p>
          ) : null}
          {ipProxiesMessage ? <p className="status success">{ipProxiesMessage}</p> : null}
          {ipProxiesLoading ? <p>Loading IP Proxies...</p> : null}

          {!ipProxiesLoading && ipProxies.length === 0 ? (
            <p>No IP Proxies found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Proxy Type</th>
                    <th>Proxy Protocol</th>
                    <th>Proxy Info</th>
                    <th>Status</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ipProxies.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.proxyType)}</td>
                      <td>{formatTableValue(item.proxyProtocol)}</td>
                      <td>{formatTableValue(item.proxyInfo)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditIpProxy(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteIpProxy(item.id)}
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
            isLoading={ipProxiesLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showIpProxyModal ? (
        <InlineFormCard
          title={editingIpProxyId ? `Update IP Proxy #${editingIpProxyId}` : 'Add IP Proxy'}
          onClose={onCloseIpProxyModal}
        >
          <form className="modal-form" onSubmit={onSaveIpProxy}>
            <label htmlFor="ipProxyManagementProxyType">Proxy Type</label>
            <select
              id="ipProxyManagementProxyType"
              value={ipProxyType}
              onChange={(event) => onIpProxyTypeChange(event.target.value)}
            >
              <option value="">Select proxy type</option>
              {ipProxyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="ipProxyManagementProxyProtocol">Proxy Protocol</label>
            <select
              id="ipProxyManagementProxyProtocol"
              value={ipProxyProtocol}
              onChange={(event) => onIpProxyProtocolChange(event.target.value)}
            >
              <option value="">Select proxy protocol</option>
              {ipProxyProtocolOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="ipProxyManagementProxyInfo">Proxy Info</label>
            <input
              id="ipProxyManagementProxyInfo"
              value={ipProxyInfo}
              onChange={(event) => onIpProxyInfoChange(event.target.value)}
              required
            />
            <p className="field-help">Tips: username:password@host:port</p>

            <label htmlFor="ipProxyManagementStatus">Status</label>
            <select
              id="ipProxyManagementStatus"
              value={ipProxyStatus}
              onChange={(event) => onIpProxyStatusChange(event.target.value)}
            >
              <option value="">Select status</option>
              {ipProxyStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingIpProxy}>
                {savingIpProxy
                  ? 'Saving...'
                  : editingIpProxyId
                    ? 'Update IP Proxy'
                    : 'Add IP Proxy'}
              </button>
              <button type="button" className="secondary" onClick={onCloseIpProxyModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default IpProxyManagementSection
