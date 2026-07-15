import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function OutcomeManagementSection({
  outcomes,
  outcomesLoading,
  outcomesError,
  outcomesMessage,
  outcomeFilters,
  onOutcomeFiltersChange,
  onApplyOutcomeFilters,
  onReloadOutcomeFilters,
  onCreateOutcome,
  onEditOutcome,
  onDeleteOutcome,
  showOutcomeModal,
  editingOutcomeId,
  outcomeType,
  onOutcomeTypeChange,
  outcomeAmount,
  onOutcomeAmountChange,
  outcomeCurrency,
  onOutcomeCurrencyChange,
  outcomePayDate,
  onOutcomePayDateChange,
  outcomeRemarks,
  onOutcomeRemarksChange,
  onSaveOutcome,
  savingOutcome,
  onCloseOutcomeModal,
  accountCurrencyOptions,
  outcomeTypeOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel outcome-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Outcome Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateOutcome}>
                Add Outcome
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyOutcomeFilters}>
            <div className="filter-item">
              <label htmlFor="outcomeManagementOutcomeTypeFilter">Outcome Type</label>
              <select
                id="outcomeManagementOutcomeTypeFilter"
                value={outcomeFilters.outcomeType}
                onChange={(event) =>
                  onOutcomeFiltersChange({
                    ...outcomeFilters,
                    outcomeType: event.target.value,
                  })
                }
              >
                <option value="">All outcome types</option>
                {outcomeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="outcomeManagementPayDateBeginFilter">Pay Date Begin</label>
              <input
                id="outcomeManagementPayDateBeginFilter"
                type="date"
                value={outcomeFilters.payDateBegin}
                onChange={(event) =>
                  onOutcomeFiltersChange({
                    ...outcomeFilters,
                    payDateBegin: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="outcomeManagementPayDateEndFilter">Pay Date End</label>
              <input
                id="outcomeManagementPayDateEndFilter"
                type="date"
                value={outcomeFilters.payDateEnd}
                onChange={(event) =>
                  onOutcomeFiltersChange({
                    ...outcomeFilters,
                    payDateEnd: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadOutcomeFilters}>
                Reload All
              </button>
            </div>
          </form>

          {outcomesError ? (
            <p className="status error" role="alert">
              {outcomesError}
            </p>
          ) : null}
          {outcomesMessage ? <p className="status success">{outcomesMessage}</p> : null}
          {outcomesLoading ? <p>Loading outcome records...</p> : null}

          {!outcomesLoading && outcomes.length === 0 ? (
            <p>No outcome records found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Outcome Type</th>
                    <th>Outcome Amount</th>
                    <th>Currency</th>
                    <th>Pay Date</th>
                    <th>Remarks</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.outcomeType)}</td>
                      <td>{formatTableValue(item.outcomeAmount)}</td>
                      <td>{formatTableValue(item.currency)}</td>
                      <td>{formatDateDisplayValue(item.payDate)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditOutcome(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteOutcome(item.id)}
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
            isLoading={outcomesLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showOutcomeModal ? (
        <InlineFormCard
          title={editingOutcomeId ? `Update Outcome #${editingOutcomeId}` : 'Add Outcome'}
          onClose={onCloseOutcomeModal}
        >
          <form className="modal-form" onSubmit={onSaveOutcome}>
            <label htmlFor="outcomeManagementOutcomeType">Outcome Type</label>
            <select
              id="outcomeManagementOutcomeType"
              value={outcomeType}
              onChange={(event) => onOutcomeTypeChange(event.target.value)}
              required
            >
              <option value="">Select outcome type</option>
              {outcomeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="outcomeManagementOutcomeAmount">Outcome Amount</label>
            <input
              id="outcomeManagementOutcomeAmount"
              type="number"
              step="0.01"
              value={outcomeAmount}
              onChange={(event) => onOutcomeAmountChange(event.target.value)}
              required
            />

            <label htmlFor="outcomeManagementCurrency">Currency</label>
            <select
              id="outcomeManagementCurrency"
              value={outcomeCurrency}
              onChange={(event) => onOutcomeCurrencyChange(event.target.value)}
            >
              <option value="">Select currency</option>
              {accountCurrencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="outcomeManagementPayDate">Pay Date</label>
            <input
              id="outcomeManagementPayDate"
              type="date"
              value={outcomePayDate}
              onChange={(event) => onOutcomePayDateChange(event.target.value)}
            />

            <label htmlFor="outcomeManagementRemarks">Remarks</label>
            <input
              id="outcomeManagementRemarks"
              value={outcomeRemarks}
              onChange={(event) => onOutcomeRemarksChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingOutcome}>
                {savingOutcome ? 'Saving...' : editingOutcomeId ? 'Update Outcome' : 'Add Outcome'}
              </button>
              <button type="button" className="secondary" onClick={onCloseOutcomeModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default OutcomeManagementSection
