import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import ParameterRowEditor from '../ParameterRowEditor/ParameterRowEditor'
import { formatTableValue, parseResponsePayloadState } from '../../lib/adsPortal'
import './AffiliateSyncConfigManagementSection.css'

function AffiliateSyncConfigManagementSection({
  affiliateSyncConfigs,
  affiliateSyncConfigsLoading,
  affiliateSyncConfigsError,
  affiliateSyncConfigsMessage,
  affiliateSyncConfigFilters,
  onAffiliateSyncConfigFiltersChange,
  onApplyAffiliateSyncConfigFilters,
  onReloadAffiliateSyncConfigFilters,
  onCreateAffiliateSyncConfig,
  onEditAffiliateSyncConfig,
  onDeleteAffiliateSyncConfig,
  showAffiliateSyncConfigModal,
  editingAffiliateSyncConfigId,
  affiliateSyncConfigNetwork,
  onAffiliateSyncConfigNetworkChange,
  affiliateSyncConfigName,
  onAffiliateSyncConfigNameChange,
  affiliateSyncConfigUrl,
  onAffiliateSyncConfigUrlChange,
  affiliateSyncConfigMethod,
  onAffiliateSyncConfigMethodChange,
  affiliateSyncConfigRequestHeaderRows,
  onAddAffiliateSyncConfigRequestHeaderRow,
  onUpdateAffiliateSyncConfigRequestHeaderRow,
  onRemoveAffiliateSyncConfigRequestHeaderRow,
  affiliateSyncConfigRequestPayloadRows,
  onAddAffiliateSyncConfigRequestPayloadRow,
  onUpdateAffiliateSyncConfigRequestPayloadRow,
  onRemoveAffiliateSyncConfigRequestPayloadRow,
  affiliateSyncConfigResponsePayloadFormat,
  onAffiliateSyncConfigResponsePayloadFormatChange,
  affiliateSyncConfigResponsePayload,
  onAffiliateSyncConfigResponsePayloadChange,
  onSaveAffiliateSyncConfig,
  savingAffiliateSyncConfig,
  onCloseAffiliateSyncConfigModal,
  showOwnerFilter,
  ownerOptions,
  affiliateNetworkOptions,
  methodOptions,
  responseFormatOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel affiliate-sync-config-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Ads Sync Config</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAffiliateSyncConfig}>
                Add Ads Sync Config
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAffiliateSyncConfigFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="affiliateSyncConfigOwnerFilter">Owner</label>
                <select
                  id="affiliateSyncConfigOwnerFilter"
                  value={affiliateSyncConfigFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAffiliateSyncConfigFiltersChange({
                      ...affiliateSyncConfigFilters,
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
              <label htmlFor="affiliateSyncConfigNetworkFilter">Affiliate Network</label>
              <select
                id="affiliateSyncConfigNetworkFilter"
                value={affiliateSyncConfigFilters.affiliateNetwork}
                onChange={(event) =>
                  onAffiliateSyncConfigFiltersChange({
                    ...affiliateSyncConfigFilters,
                    affiliateNetwork: event.target.value,
                  })
                }
              >
                <option value="">All affiliate networks</option>
                {affiliateNetworkOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadAffiliateSyncConfigFilters}>
                Reload All
              </button>
            </div>
          </form>

          {affiliateSyncConfigsError ? (
            <p className="status error" role="alert">
              {affiliateSyncConfigsError}
            </p>
          ) : null}
          {affiliateSyncConfigsMessage ? <p className="status success">{affiliateSyncConfigsMessage}</p> : null}
          {affiliateSyncConfigsLoading ? <p>Loading Ads Sync Configs...</p> : null}

          {!affiliateSyncConfigsLoading && affiliateSyncConfigs.length === 0 ? (
            <p>No Ads Sync Configs found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Affiliate Network</th>
                    <th>Sync Name</th>
                    <th>URL</th>
                    <th>Method</th>
                    <th>Request Headers</th>
                    <th>Request Payload</th>
                    <th>Response Format</th>
                    <th>Response Payload</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateSyncConfigs.map((item) => {
                    const responsePayloadState = parseResponsePayloadState(item.responsePayload)

                    return (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{formatTableValue(item.affiliateNetwork)}</td>
                        <td>{formatTableValue(item.syncName)}</td>
                        <td>{formatTableValue(item.url)}</td>
                        <td>{formatTableValue(item.method)}</td>
                        <td>{formatTableValue(item.requestHeaders)}</td>
                        <td>{formatTableValue(item.requestPayload)}</td>
                        <td>{formatTableValue(responsePayloadState.format)}</td>
                        <td>{formatTableValue(responsePayloadState.content)}</td>
                        <td>{formatDateDisplayValue(item.createDate)}</td>
                        <td>{formatDateDisplayValue(item.updateDate)}</td>
                        <td className="actions">
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onEditAffiliateSyncConfig(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => onDeleteAffiliateSyncConfig(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <PaginationControls
            pagination={pagination}
            isLoading={affiliateSyncConfigsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAffiliateSyncConfigModal ? (
        <InlineFormCard
          title={
            editingAffiliateSyncConfigId
              ? `Update Ads Sync Config #${editingAffiliateSyncConfigId}`
              : 'Add Ads Sync Config'
          }
          onClose={onCloseAffiliateSyncConfigModal}
        >
          <form className="modal-form" onSubmit={onSaveAffiliateSyncConfig}>
            <label htmlFor="affiliateSyncConfigNetwork">Affiliate Network</label>
            <select
              id="affiliateSyncConfigNetwork"
              value={affiliateSyncConfigNetwork}
              onChange={(event) => onAffiliateSyncConfigNetworkChange(event.target.value)}
              required
            >
              <option value="">Select affiliate network</option>
              {affiliateNetworkOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label htmlFor="affiliateSyncConfigName">Sync Name</label>
            <input
              id="affiliateSyncConfigName"
              value={affiliateSyncConfigName}
              onChange={(event) => onAffiliateSyncConfigNameChange(event.target.value)}
              required
            />

            <label htmlFor="affiliateSyncConfigUrl">URL</label>
            <input
              id="affiliateSyncConfigUrl"
              type="url"
              value={affiliateSyncConfigUrl}
              onChange={(event) => onAffiliateSyncConfigUrlChange(event.target.value)}
              required
            />

            <label htmlFor="affiliateSyncConfigMethod">Method</label>
            <select
              id="affiliateSyncConfigMethod"
              value={affiliateSyncConfigMethod}
              onChange={(event) => onAffiliateSyncConfigMethodChange(event.target.value)}
              required
            >
              <option value="">Select method</option>
              {methodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="affiliate-sync-config-management__section">
              <div className="affiliate-sync-config-management__section-header">
                <label>Request Headers</label>
                <button type="button" className="secondary" onClick={onAddAffiliateSyncConfigRequestHeaderRow}>
                  Add Parameter Row
                </button>
              </div>
              <ParameterRowEditor
                rows={affiliateSyncConfigRequestHeaderRows}
                onChangeRow={onUpdateAffiliateSyncConfigRequestHeaderRow}
                onRemoveRow={onRemoveAffiliateSyncConfigRequestHeaderRow}
              />
            </div>

            <div className="affiliate-sync-config-management__section">
              <div className="affiliate-sync-config-management__section-header">
                <label>Request Payload</label>
                <button type="button" className="secondary" onClick={onAddAffiliateSyncConfigRequestPayloadRow}>
                  Add Parameter Row
                </button>
              </div>
              <ParameterRowEditor
                rows={affiliateSyncConfigRequestPayloadRows}
                onChangeRow={onUpdateAffiliateSyncConfigRequestPayloadRow}
                onRemoveRow={onRemoveAffiliateSyncConfigRequestPayloadRow}
              />
            </div>

            <div className="affiliate-sync-config-management__section">
              <label htmlFor="affiliateSyncConfigResponsePayloadFormat">Response Payload Format</label>
              <select
                id="affiliateSyncConfigResponsePayloadFormat"
                value={affiliateSyncConfigResponsePayloadFormat}
                onChange={(event) => onAffiliateSyncConfigResponsePayloadFormatChange(event.target.value)}
              >
                {responseFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label htmlFor="affiliateSyncConfigResponsePayload">Response Payload</label>
              <textarea
                id="affiliateSyncConfigResponsePayload"
                className="affiliate-sync-config-management__textarea"
                value={affiliateSyncConfigResponsePayload}
                onChange={(event) => onAffiliateSyncConfigResponsePayloadChange(event.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAffiliateSyncConfig}>
                {savingAffiliateSyncConfig
                  ? 'Saving...'
                  : editingAffiliateSyncConfigId
                    ? 'Update Ads Sync Config'
                    : 'Add Ads Sync Config'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAffiliateSyncConfigModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AffiliateSyncConfigManagementSection
