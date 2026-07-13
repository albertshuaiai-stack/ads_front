import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function IncomeManagementSection({
  incomes,
  incomesLoading,
  incomesError,
  incomesMessage,
  incomeFilters,
  onIncomeFiltersChange,
  onApplyIncomeFilters,
  onReloadIncomeFilters,
  onCreateIncome,
  onEditIncome,
  onDeleteIncome,
  showIncomeModal,
  editingIncomeId,
  incomePlatformName,
  onIncomePlatformNameChange,
  incomeUserName,
  onIncomeUserNameChange,
  incomeAmount,
  onIncomeAmountChange,
  incomeCurrency,
  onIncomeCurrencyChange,
  incomePaymentMethod,
  onIncomePaymentMethodChange,
  incomePaypalAccount,
  onIncomePaypalAccountChange,
  incomePayoutDate,
  onIncomePayoutDateChange,
  incomeRemarks,
  onIncomeRemarksChange,
  onSaveIncome,
  savingIncome,
  onCloseIncomeModal,
  platformOptions,
  paymentMethodOptions,
  accountCurrencyOptions,
  paypalAccountOptions,
  paypalAccountOptionsLoading,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel income-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Income Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateIncome}>
                Add Income
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyIncomeFilters}>
            <div className="filter-item">
              <label htmlFor="incomeManagementPlatformNameFilter">Platform Name</label>
              <input
                id="incomeManagementPlatformNameFilter"
                list="incomeManagementPlatformNameOptions"
                value={incomeFilters.platformName}
                onChange={(event) =>
                  onIncomeFiltersChange({
                    ...incomeFilters,
                    platformName: event.target.value,
                  })
                }
              />
              <datalist id="incomeManagementPlatformNameOptions">
                {platformOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div className="filter-item">
              <label htmlFor="incomeManagementUserNameFilter">User Name</label>
              <input
                id="incomeManagementUserNameFilter"
                value={incomeFilters.userName}
                onChange={(event) =>
                  onIncomeFiltersChange({
                    ...incomeFilters,
                    userName: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="incomeManagementPaypalAccountFilter">PayPal Account</label>
              <input
                id="incomeManagementPaypalAccountFilter"
                list="incomeManagementPaypalAccountOptions"
                value={incomeFilters.paypalAccount}
                onChange={(event) =>
                  onIncomeFiltersChange({
                    ...incomeFilters,
                    paypalAccount: event.target.value,
                  })
                }
              />
              <datalist id="incomeManagementPaypalAccountOptions">
                {paypalAccountOptions.map((option) => (
                  <option key={option.paypalEmail} value={option.paypalEmail} />
                ))}
              </datalist>
            </div>

            <div className="filter-item">
              <label htmlFor="incomeManagementPayoutDateBeginFilter">Payout Date Begin</label>
              <input
                id="incomeManagementPayoutDateBeginFilter"
                type="date"
                value={incomeFilters.payoutDateBegin}
                onChange={(event) =>
                  onIncomeFiltersChange({
                    ...incomeFilters,
                    payoutDateBegin: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="incomeManagementPayoutDateEndFilter">Payout Date End</label>
              <input
                id="incomeManagementPayoutDateEndFilter"
                type="date"
                value={incomeFilters.payoutDateEnd}
                onChange={(event) =>
                  onIncomeFiltersChange({
                    ...incomeFilters,
                    payoutDateEnd: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadIncomeFilters}>
                Reload All
              </button>
            </div>
          </form>

          {incomesError ? (
            <p className="status error" role="alert">
              {incomesError}
            </p>
          ) : null}
          {incomesMessage ? <p className="status success">{incomesMessage}</p> : null}
          {incomesLoading ? <p>Loading income records...</p> : null}

          {!incomesLoading && incomes.length === 0 ? (
            <p>No income records found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Platform Name</th>
                    <th>User Name</th>
                    <th>Income Amount</th>
                    <th>Currency</th>
                    <th>Payment Method</th>
                    <th>PayPal Account</th>
                    <th>Payout Date</th>
                    <th>Remarks</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.platformName)}</td>
                      <td>{formatTableValue(item.userName)}</td>
                      <td>{formatTableValue(item.incomeAmount)}</td>
                      <td>{formatTableValue(item.currency)}</td>
                      <td>{formatTableValue(item.paymentMethod)}</td>
                      <td>{formatTableValue(item.paypalAccount)}</td>
                      <td>{formatDateDisplayValue(item.payoutDate)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditIncome(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteIncome(item.id)}
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
            isLoading={incomesLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showIncomeModal ? (
        <InlineFormCard
          title={editingIncomeId ? `Update Income #${editingIncomeId}` : 'Add Income'}
          onClose={onCloseIncomeModal}
        >
          <form className="modal-form" onSubmit={onSaveIncome}>
            <label htmlFor="incomeManagementPlatformName">Platform Name</label>
            <input
              id="incomeManagementPlatformName"
              list="incomeManagementPlatformNameOptionsForm"
              value={incomePlatformName}
              onChange={(event) => onIncomePlatformNameChange(event.target.value)}
              required
            />
            <datalist id="incomeManagementPlatformNameOptionsForm">
              {platformOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>

            <label htmlFor="incomeManagementUserName">User Name</label>
            <input
              id="incomeManagementUserName"
              value={incomeUserName}
              onChange={(event) => onIncomeUserNameChange(event.target.value)}
              required
            />

            <label htmlFor="incomeManagementIncomeAmount">Income Amount</label>
            <input
              id="incomeManagementIncomeAmount"
              type="number"
              step="0.01"
              value={incomeAmount}
              onChange={(event) => onIncomeAmountChange(event.target.value)}
              required
            />

            <label htmlFor="incomeManagementCurrency">Currency</label>
            <select
              id="incomeManagementCurrency"
              value={incomeCurrency}
              onChange={(event) => onIncomeCurrencyChange(event.target.value)}
            >
              <option value="">Select currency</option>
              {accountCurrencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="incomeManagementPaymentMethod">Payment Method</label>
            <select
              id="incomeManagementPaymentMethod"
              value={incomePaymentMethod}
              onChange={(event) => onIncomePaymentMethodChange(event.target.value)}
            >
              <option value="">Select payment method</option>
              {paymentMethodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="incomeManagementPaypalAccount">PayPal Account</label>
            <input
              id="incomeManagementPaypalAccount"
              list="incomeManagementPaypalAccountOptionsForm"
              value={incomePaypalAccount}
              onChange={(event) => onIncomePaypalAccountChange(event.target.value)}
            />
            <datalist id="incomeManagementPaypalAccountOptionsForm">
              {paypalAccountOptions.map((option) => (
                <option key={option.paypalEmail} value={option.paypalEmail} />
              ))}
            </datalist>
            {paypalAccountOptionsLoading ? <p className="field-help">Loading PayPal accounts...</p> : null}

            <label htmlFor="incomeManagementPayoutDate">Payout Date</label>
            <input
              id="incomeManagementPayoutDate"
              type="date"
              value={incomePayoutDate}
              onChange={(event) => onIncomePayoutDateChange(event.target.value)}
            />

            <label htmlFor="incomeManagementRemarks">Remarks</label>
            <input
              id="incomeManagementRemarks"
              value={incomeRemarks}
              onChange={(event) => onIncomeRemarksChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingIncome}>
                {savingIncome ? 'Saving...' : editingIncomeId ? 'Update Income' : 'Add Income'}
              </button>
              <button type="button" className="secondary" onClick={onCloseIncomeModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default IncomeManagementSection
