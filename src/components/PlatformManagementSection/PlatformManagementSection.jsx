import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import './PlatformManagementSection.css'

function PlatformManagementSection({
  platforms,
  platformsLoading,
  platformsError,
  platformsMessage,
  onCreatePlatform,
  onEditPlatform,
  onDeletePlatform,
  showPlatformModal,
  editingPlatformId,
  platformName,
  onPlatformNameChange,
  paymentMethod,
  paymentMethodOptions,
  onPaymentMethodChange,
  platformRemarks,
  onPlatformRemarksChange,
  onSavePlatform,
  savingPlatform,
  onClosePlatformModal,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel platform-management">
        <div className="user-list">
          <div className="list-header">
            <h3>ADS Platforms</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreatePlatform}>
                Add Platform
              </button>
            </div>
          </div>

          {platformsError ? (
            <p className="status error" role="alert">
              {platformsError}
            </p>
          ) : null}
          {platformsMessage ? <p className="status success">{platformsMessage}</p> : null}
          {platformsLoading ? <p>Loading ADS Platforms...</p> : null}

          {!platformsLoading && platforms.length === 0 ? (
            <p>No ADS platforms found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Platform Name</th>
                    <th>Payment Method</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.platformName}</td>
                      <td>{item.paymentMethod}</td>
                      <td>{item.remarks}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditPlatform(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeletePlatform(item.id)}
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
            isLoading={platformsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showPlatformModal ? (
        <InlineFormCard
          title={editingPlatformId ? `Update ADS Platform #${editingPlatformId}` : 'Add ADS Platform'}
          onClose={onClosePlatformModal}
        >
          <form className="modal-form" onSubmit={onSavePlatform}>
            <label htmlFor="platformName">Platform Name</label>
            <input
              id="platformName"
              value={platformName}
              onChange={(event) => onPlatformNameChange(event.target.value)}
              required
            />

            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => onPaymentMethodChange(event.target.value)}
            >
              <option value="">Select payment method</option>
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="platformRemarks">Remarks</label>
            <input
              id="platformRemarks"
              value={platformRemarks}
              onChange={(event) => onPlatformRemarksChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingPlatform}>
                {savingPlatform
                  ? 'Saving...'
                  : editingPlatformId
                    ? 'Update ADS Platform'
                    : 'Add ADS Platform'}
              </button>
              <button type="button" className="secondary" onClick={onClosePlatformModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default PlatformManagementSection
