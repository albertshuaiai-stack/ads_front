import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function CashBachAccountManagementSection({
  accounts,
  accountsLoading,
  accountsError,
  accountsMessage,
  accountFilters,
  onAccountFiltersChange,
  onApplyAccountFilters,
  onReloadAccountFilters,
  platformOptions,
  platformsLoading,
  accountEmailOptions,
  accountEmailOptionsLoading,
  accountStatusOptions,
  accountPaymentStatusOptions,
  accountCurrencyOptions,
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
  showAccountModal,
  editingAccountId,
  accountEmailAddress,
  onAccountEmailAddressChange,
  accountUserName,
  onAccountUserNameChange,
  accountPlatformName,
  onAccountPlatformNameChange,
  accountPaymentStatus,
  onAccountPaymentStatusChange,
  accountStatus,
  onAccountStatusChange,
  accountRegisterDate,
  onAccountRegisterDateChange,
  accountBalance,
  onAccountBalanceChange,
  accountCurrency,
  onAccountCurrencyChange,
  accountRemarks,
  onAccountRemarksChange,
  onSaveAccount,
  savingAccount,
  onCloseAccountModal,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel cash-bach-account-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Cash Bach Account</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAccount}>
                Add Account
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAccountFilters}>
            <div className="filter-item">
              <label htmlFor="cashBachAccountUserNameFilter">User Name</label>
              <input
                id="cashBachAccountUserNameFilter"
                value={accountFilters.userName}
                onChange={(event) =>
                  onAccountFiltersChange({
                    ...accountFilters,
                    userName: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="cashBachAccountStatusFilter">Status</label>
              <select
                id="cashBachAccountStatusFilter"
                value={accountFilters.status}
                onChange={(event) =>
                  onAccountFiltersChange({
                    ...accountFilters,
                    status: event.target.value,
                  })
                }
              >
                <option value="">All statuses</option>
                {accountStatusOptions.map((option) => (
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
              <button type="button" className="secondary" onClick={onReloadAccountFilters}>
                Reload All
              </button>
            </div>
          </form>

          {accountsError ? (
            <p className="status error" role="alert">
              {accountsError}
            </p>
          ) : null}
          {accountsMessage ? <p className="status success">{accountsMessage}</p> : null}
          {accountsLoading ? <p>Loading Cash Bach Accounts...</p> : null}

          {!accountsLoading && accounts.length === 0 ? (
            <p>No Cash Bach Accounts found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email Address</th>
                    <th>User Name</th>
                    <th>Platform Name</th>
                    <th>Payment Status</th>
                    <th>Status</th>
                    <th>Register Date</th>
                    <th>Balance</th>
                    <th>Currency</th>
                    <th>Remarks</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.emailAddress)}</td>
                      <td>{formatTableValue(item.userName)}</td>
                      <td>{formatTableValue(item.platformName)}</td>
                      <td>{formatTableValue(item.paymentStatus)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateDisplayValue(item.registerDate)}</td>
                      <td>{formatTableValue(item.balance)}</td>
                      <td>{formatTableValue(item.currency)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditAccount(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAccount(item.id)}
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
            isLoading={accountsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAccountModal ? (
        <InlineFormCard
          title={editingAccountId ? `Update Account #${editingAccountId}` : 'Add Account'}
          onClose={onCloseAccountModal}
        >
          <form className="modal-form" onSubmit={onSaveAccount}>
            <label htmlFor="cashBachAccountEmailAddress">Email Address</label>
            <select
              id="cashBachAccountEmailAddress"
              value={accountEmailAddress}
              onChange={(event) => onAccountEmailAddressChange(event.target.value)}
              disabled={accountEmailOptionsLoading || accountEmailOptions.length === 0}
            >
              <option value="">Select email address</option>
              {accountEmailOptions.map((option) => (
                <option key={option.emailAddress} value={option.emailAddress}>
                  {option.emailAddress}
                </option>
              ))}
            </select>
            {accountEmailOptionsLoading ? <p className="field-help">Loading email addresses...</p> : null}

            <label htmlFor="cashBachAccountUserName">User Name</label>
            <input
              id="cashBachAccountUserName"
              value={accountUserName}
              onChange={(event) => onAccountUserNameChange(event.target.value)}
              required
            />

            <label htmlFor="cashBachAccountPlatformName">Platform Name</label>
            <select
              id="cashBachAccountPlatformName"
              value={accountPlatformName}
              onChange={(event) => onAccountPlatformNameChange(event.target.value)}
              disabled={platformsLoading || platformOptions.length === 0}
            >
              <option value="">Select platform</option>
              {platformOptions.map((platformName) => (
                <option key={platformName} value={platformName}>
                  {platformName}
                </option>
              ))}
            </select>

            <label htmlFor="cashBachAccountPaymentStatus">Payment Status</label>
            <select
              id="cashBachAccountPaymentStatus"
              value={accountPaymentStatus}
              onChange={(event) => onAccountPaymentStatusChange(event.target.value)}
            >
              <option value="">Select payment status</option>
              {accountPaymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="cashBachAccountStatus">Status</label>
            <select
              id="cashBachAccountStatus"
              value={accountStatus}
              onChange={(event) => onAccountStatusChange(event.target.value)}
            >
              <option value="">Select status</option>
              {accountStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="cashBachAccountRegisterDate">Register Date</label>
            <input
              id="cashBachAccountRegisterDate"
              type="date"
              value={accountRegisterDate}
              onChange={(event) => onAccountRegisterDateChange(event.target.value)}
            />

            <label htmlFor="cashBachAccountBalance">Balance</label>
            <input
              id="cashBachAccountBalance"
              type="number"
              step="0.01"
              value={accountBalance}
              onChange={(event) => onAccountBalanceChange(event.target.value)}
            />

            <label htmlFor="cashBachAccountCurrency">Currency</label>
            <select
              id="cashBachAccountCurrency"
              value={accountCurrency}
              onChange={(event) => onAccountCurrencyChange(event.target.value)}
            >
              <option value="">Select currency</option>
              {accountCurrencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="cashBachAccountRemarks">Remarks</label>
            <input
              id="cashBachAccountRemarks"
              value={accountRemarks}
              onChange={(event) => onAccountRemarksChange(event.target.value)}
            />
            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAccount}>
                {savingAccount ? 'Saving...' : editingAccountId ? 'Update Account' : 'Add Account'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAccountModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default CashBachAccountManagementSection
