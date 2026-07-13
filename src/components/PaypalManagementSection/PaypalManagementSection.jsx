import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function PaypalManagementSection({
  paypals,
  paypalsLoading,
  paypalsError,
  paypalsMessage,
  paypalFilters,
  onPaypalFiltersChange,
  onApplyPaypalFilters,
  onReloadPaypalFilters,
  onCreatePaypal,
  onEditPaypal,
  onDeletePaypal,
  showPaypalModal,
  editingPaypalId,
  paypalEmail,
  onPaypalEmailChange,
  paypalPrimaryEmail,
  onPaypalPrimaryEmailChange,
  paypalIdValue,
  onPaypalIdValueChange,
  onSavePaypal,
  savingPaypal,
  onClosePaypalModal,
  pagination,
  onPageChange,
  onPageSizeChange,
  formatDateDisplayValue,
}) {
  return (
    <>
      <div className="panel paypal-management">
        <div className="user-list">
          <div className="list-header">
            <h3>PayPal Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreatePaypal}>
                Add PayPal
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyPaypalFilters}>
            <div className="filter-item">
              <label htmlFor="paypalManagementPaypalEmailFilter">PayPal Email</label>
              <input
                id="paypalManagementPaypalEmailFilter"
                type="email"
                value={paypalFilters.paypalEmail}
                onChange={(event) =>
                  onPaypalFiltersChange({
                    ...paypalFilters,
                    paypalEmail: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="paypalManagementPrimaryEmailFilter">Primary Email</label>
              <input
                id="paypalManagementPrimaryEmailFilter"
                type="email"
                value={paypalFilters.primaryEmail}
                onChange={(event) =>
                  onPaypalFiltersChange({
                    ...paypalFilters,
                    primaryEmail: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadPaypalFilters}>
                Reload All
              </button>
            </div>
          </form>

          {paypalsError ? (
            <p className="status error" role="alert">
              {paypalsError}
            </p>
          ) : null}
          {paypalsMessage ? <p className="status success">{paypalsMessage}</p> : null}
          {paypalsLoading ? <p>Loading PayPal accounts...</p> : null}

          {!paypalsLoading && paypals.length === 0 ? (
            <p>No PayPal accounts found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>PayPal Email</th>
                    <th>Primary Email</th>
                    <th>PayPal ID</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paypals.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.paypalEmail)}</td>
                      <td>{formatTableValue(item.primaryEmail)}</td>
                      <td>{formatTableValue(item.paypalId)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditPaypal(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeletePaypal(item.id)}
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
            isLoading={paypalsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showPaypalModal ? (
        <InlineFormCard
          title={editingPaypalId ? `Update PayPal #${editingPaypalId}` : 'Add PayPal'}
          onClose={onClosePaypalModal}
        >
          <form className="modal-form" onSubmit={onSavePaypal}>
            <label htmlFor="paypalManagementPaypalEmail">PayPal Email</label>
            <input
              id="paypalManagementPaypalEmail"
              type="email"
              value={paypalEmail}
              onChange={(event) => onPaypalEmailChange(event.target.value)}
              required
            />

            <label htmlFor="paypalManagementPrimaryEmail">Primary Email</label>
            <input
              id="paypalManagementPrimaryEmail"
              type="email"
              value={paypalPrimaryEmail}
              onChange={(event) => onPaypalPrimaryEmailChange(event.target.value)}
            />

            <label htmlFor="paypalManagementPaypalId">PayPal ID</label>
            <input
              id="paypalManagementPaypalId"
              value={paypalIdValue}
              onChange={(event) => onPaypalIdValueChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingPaypal}>
                {savingPaypal ? 'Saving...' : editingPaypalId ? 'Update PayPal' : 'Add PayPal'}
              </button>
              <button type="button" className="secondary" onClick={onClosePaypalModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default PaypalManagementSection
