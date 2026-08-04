import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function AdsAccountManagementSection({
  adsAccounts,
  adsAccountsLoading,
  adsAccountsError,
  adsAccountsMessage,
  adsAccountFilters,
  onAdsAccountFiltersChange,
  onApplyAdsAccountFilters,
  onReloadAdsAccountFilters,
  onCreateAdsAccount,
  onEditAdsAccount,
  onDeleteAdsAccount,
  showAdsAccountModal,
  editingAdsAccountId,
  adsAccountValue,
  onAdsAccountValueChange,
  adsAccountType,
  onAdsAccountTypeChange,
  adsAccountAgencyPlatform,
  onAdsAccountAgencyPlatformChange,
  adsAccountMccAccount,
  onAdsAccountMccAccountChange,
  adsAccountStatus,
  onAdsAccountStatusChange,
  onSaveAdsAccount,
  savingAdsAccount,
  onCloseAdsAccountModal,
  showOwnerFilter,
  ownerOptions,
  adsAccountTypeOptions,
  adsAccountAgencyPlatformOptions,
  adsAccountStatusOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  const shouldShowAgencyPlatformFilter = adsAccountFilters.accountType === 'Agency'
  const shouldShowAgencyPlatformField = adsAccountType === 'Agency'

  return (
    <>
      <div className="panel ads-account-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Ads Account Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAdsAccount}>
                Add Ads Account
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAdsAccountFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="adsAccountManagementOwnerFilter">Owner</label>
                <select
                  id="adsAccountManagementOwnerFilter"
                  value={adsAccountFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAdsAccountFiltersChange({
                      ...adsAccountFilters,
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
              <label htmlFor="adsAccountManagementAccountTypeFilter">Account Type</label>
              <select
                id="adsAccountManagementAccountTypeFilter"
                value={adsAccountFilters.accountType}
                onChange={(event) =>
                  onAdsAccountFiltersChange({
                    ...adsAccountFilters,
                    accountType: event.target.value,
                  })
                }
              >
                <option value="">All account types</option>
                {adsAccountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {shouldShowAgencyPlatformFilter ? (
              <div className="filter-item">
                <label htmlFor="adsAccountManagementAgencyPlatformFilter">Agency Platform</label>
                <select
                  id="adsAccountManagementAgencyPlatformFilter"
                  value={adsAccountFilters.agencyPlatform}
                  onChange={(event) =>
                    onAdsAccountFiltersChange({
                      ...adsAccountFilters,
                      agencyPlatform: event.target.value,
                    })
                  }
                >
                  <option value="">All agency platforms</option>
                  {adsAccountAgencyPlatformOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="filter-item">
              <label htmlFor="adsAccountManagementStatusFilter">Status</label>
              <select
                id="adsAccountManagementStatusFilter"
                value={adsAccountFilters.status}
                onChange={(event) =>
                  onAdsAccountFiltersChange({
                    ...adsAccountFilters,
                    status: event.target.value,
                  })
                }
              >
                <option value="">All statuses</option>
                {adsAccountStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="adsAccountManagementMccAccountFilter">MCC Account</label>
              <input
                id="adsAccountManagementMccAccountFilter"
                value={adsAccountFilters.mccAccount}
                onChange={(event) =>
                  onAdsAccountFiltersChange({
                    ...adsAccountFilters,
                    mccAccount: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="adsAccountManagementAdsAccountFilter">Ads Account</label>
              <input
                id="adsAccountManagementAdsAccountFilter"
                value={adsAccountFilters.adsAccount}
                onChange={(event) =>
                  onAdsAccountFiltersChange({
                    ...adsAccountFilters,
                    adsAccount: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadAdsAccountFilters}>
                Reload All
              </button>
            </div>
          </form>

          {adsAccountsError ? (
            <p className="status error" role="alert">
              {adsAccountsError}
            </p>
          ) : null}
          {adsAccountsMessage ? <p className="status success">{adsAccountsMessage}</p> : null}
          {adsAccountsLoading ? <p>Loading Ads Accounts...</p> : null}

          {!adsAccountsLoading && adsAccounts.length === 0 ? (
            <p>No Ads Accounts found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ads Account</th>
                    <th>MCC Account</th>
                    <th>Agency Platform</th>
                    <th>Account Type</th>
                    <th>Status</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adsAccounts.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.adsAccount)}</td>
                      <td>{formatTableValue(item.mccAccount)}</td>
                      <td>{formatTableValue(item.agencyPlatform)}</td>
                      <td>{formatTableValue(item.accountType)}</td>
                      <td>{formatTableValue(item.status)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditAdsAccount(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAdsAccount(item.id)}
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
            isLoading={adsAccountsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAdsAccountModal ? (
        <InlineFormCard
          title={editingAdsAccountId ? `Update Ads Account #${editingAdsAccountId}` : 'Add Ads Account'}
          onClose={onCloseAdsAccountModal}
        >
          <form className="modal-form" onSubmit={onSaveAdsAccount}>
            <label htmlFor="adsAccountManagementAdsAccount">Ads Account</label>
            <input
              id="adsAccountManagementAdsAccount"
              value={adsAccountValue}
              onChange={(event) => onAdsAccountValueChange(event.target.value)}
              required
            />

            <label htmlFor="adsAccountManagementMccAccount">MCC Account</label>
            <input
              id="adsAccountManagementMccAccount"
              value={adsAccountMccAccount}
              onChange={(event) => onAdsAccountMccAccountChange(event.target.value)}
            />

            <label htmlFor="adsAccountManagementAccountType">Account Type</label>
            <select
              id="adsAccountManagementAccountType"
              value={adsAccountType}
              onChange={(event) => onAdsAccountTypeChange(event.target.value)}
            >
              <option value="">Select account type</option>
              {adsAccountTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {shouldShowAgencyPlatformField ? (
              <>
                <label htmlFor="adsAccountManagementAgencyPlatform">Agency Platform</label>
                <select
                  id="adsAccountManagementAgencyPlatform"
                  value={adsAccountAgencyPlatform}
                  onChange={(event) => onAdsAccountAgencyPlatformChange(event.target.value)}
                >
                  <option value="">Select agency platform</option>
                  {adsAccountAgencyPlatformOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            ) : null}

            <label htmlFor="adsAccountManagementStatus">Status</label>
            <select
              id="adsAccountManagementStatus"
              value={adsAccountStatus}
              onChange={(event) => onAdsAccountStatusChange(event.target.value)}
            >
              <option value="">Select status</option>
              {adsAccountStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAdsAccount}>
                {savingAdsAccount
                  ? 'Saving...'
                  : editingAdsAccountId
                    ? 'Update Ads Account'
                    : 'Add Ads Account'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAdsAccountModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default AdsAccountManagementSection
