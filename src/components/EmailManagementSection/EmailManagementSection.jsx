import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function EmailManagementSection({
  emails,
  emailsLoading,
  emailsError,
  emailsMessage,
  emailFilters,
  onEmailFiltersChange,
  onApplyEmailFilters,
  onReloadEmailFilters,
  onCreateEmail,
  onEditEmail,
  onDeleteEmail,
  showEmailModal,
  editingEmailId,
  emailUserName,
  onEmailUserNameChange,
  emailBirthdayDate,
  onEmailBirthdayDateChange,
  emailAddress,
  onEmailAddressChange,
  emailPassword,
  onEmailPasswordChange,
  emailParentEmail,
  onEmailParentEmailChange,
  emailHomeAddress,
  onEmailHomeAddressChange,
  emailRemarks,
  onEmailRemarksChange,
  onSaveEmail,
  savingEmail,
  onCloseEmailModal,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel email-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Email Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateEmail}>
                Add Email
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyEmailFilters}>
            <div className="filter-item">
              <label htmlFor="emailManagementUserNameFilter">User Name</label>
              <input
                id="emailManagementUserNameFilter"
                value={emailFilters.userName}
                onChange={(event) =>
                  onEmailFiltersChange({
                    ...emailFilters,
                    userName: event.target.value,
                  })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="emailManagementEmailFilter">Email Address</label>
              <input
                id="emailManagementEmailFilter"
                value={emailFilters.emailAddress}
                onChange={(event) =>
                  onEmailFiltersChange({
                    ...emailFilters,
                    emailAddress: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadEmailFilters}>
                Reload All
              </button>
            </div>
          </form>

          {emailsError ? (
            <p className="status error" role="alert">
              {emailsError}
            </p>
          ) : null}
          {emailsMessage ? <p className="status success">{emailsMessage}</p> : null}
          {emailsLoading ? <p>Loading emails...</p> : null}

          {!emailsLoading && emails.length === 0 ? (
            <p>No emails found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User Name</th>
                    <th>Birthday Date</th>
                    <th>Email Address</th>
                    <th>Email Password</th>
                    <th>Parent Email</th>
                    <th>Address</th>
                    <th>Remarks</th>
                    <th>Ads Owner</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.userName)}</td>
                      <td>{formatDateDisplayValue(item.birthdayDate)}</td>
                      <td>{formatTableValue(item.emailAddress)}</td>
                      <td>{formatTableValue(item.emailPwd)}</td>
                      <td>{formatTableValue(item.parentEmail)}</td>
                      <td>{formatTableValue(item.address)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td>{formatTableValue(item.adsOwner)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditEmail(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteEmail(item.id)}
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
            isLoading={emailsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showEmailModal ? (
        <InlineFormCard
          title={editingEmailId ? `Update Email #${editingEmailId}` : 'Add Email'}
          onClose={onCloseEmailModal}
        >
          <form className="modal-form" onSubmit={onSaveEmail}>
            <label htmlFor="emailManagementUserName">User Name</label>
            <input
              id="emailManagementUserName"
              value={emailUserName}
              onChange={(event) => onEmailUserNameChange(event.target.value)}
              required
            />

            <label htmlFor="emailManagementBirthdayDate">Birthday Date</label>
            <input
              id="emailManagementBirthdayDate"
              type="date"
              value={emailBirthdayDate}
              onChange={(event) => onEmailBirthdayDateChange(event.target.value)}
            />

            <label htmlFor="emailManagementEmailAddress">Email Address</label>
            <input
              id="emailManagementEmailAddress"
              type="email"
              value={emailAddress}
              onChange={(event) => onEmailAddressChange(event.target.value)}
            />

            <label htmlFor="emailManagementEmailPassword">Email Password</label>
            <input
              id="emailManagementEmailPassword"
              value={emailPassword}
              onChange={(event) => onEmailPasswordChange(event.target.value)}
            />

            <label htmlFor="emailManagementParentEmail">Parent Email</label>
            <input
              id="emailManagementParentEmail"
              type="email"
              value={emailParentEmail}
              onChange={(event) => onEmailParentEmailChange(event.target.value)}
            />

            <label htmlFor="emailManagementAddress">Address</label>
            <input
              id="emailManagementAddress"
              value={emailHomeAddress}
              onChange={(event) => onEmailHomeAddressChange(event.target.value)}
            />

            <label htmlFor="emailManagementRemarks">Remarks</label>
            <input
              id="emailManagementRemarks"
              value={emailRemarks}
              onChange={(event) => onEmailRemarksChange(event.target.value)}
            />
            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingEmail}>
                {savingEmail ? 'Saving...' : editingEmailId ? 'Update Email' : 'Add Email'}
              </button>
              <button type="button" className="secondary" onClick={onCloseEmailModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default EmailManagementSection
