import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function ToolCloudPhoneManagementSection({
  toolCloudPhones,
  toolCloudPhonesLoading,
  toolCloudPhonesError,
  toolCloudPhonesMessage,
  toolCloudPhoneFilters,
  onToolCloudPhoneFiltersChange,
  onApplyToolCloudPhoneFilters,
  onReloadToolCloudPhoneFilters,
  onCreateToolCloudPhone,
  onEditToolCloudPhone,
  onDeleteToolCloudPhone,
  showToolCloudPhoneModal,
  editingToolCloudPhoneId,
  toolCloudPhoneCountryCd,
  onToolCloudPhoneCountryCdChange,
  toolCloudPhoneNumber,
  onToolCloudPhoneNumberChange,
  toolCloudPhoneStartDate,
  onToolCloudPhoneStartDateChange,
  toolCloudPhoneExpireDate,
  onToolCloudPhoneExpireDateChange,
  toolCloudPhoneRemarks,
  onToolCloudPhoneRemarksChange,
  onSaveToolCloudPhone,
  savingToolCloudPhone,
  onCloseToolCloudPhoneModal,
  showOwnerFilter,
  ownerOptions,
  countryOptions,
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
            <h3>Cloud Phone Management</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateToolCloudPhone}>
                Add Cloud Phone
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyToolCloudPhoneFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="toolCloudPhoneManagementOwnerFilter">Ads Owner</label>
                <select
                  id="toolCloudPhoneManagementOwnerFilter"
                  value={toolCloudPhoneFilters.adsOwner}
                  onChange={(event) =>
                    onToolCloudPhoneFiltersChange({
                      ...toolCloudPhoneFilters,
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
              <label htmlFor="toolCloudPhoneManagementCountryCdFilter">Country</label>
              <select
                id="toolCloudPhoneManagementCountryCdFilter"
                value={toolCloudPhoneFilters.countryCd}
                onChange={(event) =>
                  onToolCloudPhoneFiltersChange({
                    ...toolCloudPhoneFilters,
                    countryCd: event.target.value,
                  })
                }
              >
                <option value="">All countries</option>
                {countryOptions.map((option) => (
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
              <button type="button" className="secondary" onClick={onReloadToolCloudPhoneFilters}>
                Reload All
              </button>
            </div>
          </form>

          {toolCloudPhonesError ? (
            <p className="status error" role="alert">
              {toolCloudPhonesError}
            </p>
          ) : null}
          {toolCloudPhonesMessage ? <p className="status success">{toolCloudPhonesMessage}</p> : null}
          {toolCloudPhonesLoading ? <p>Loading Cloud Phones...</p> : null}

          {!toolCloudPhonesLoading && toolCloudPhones.length === 0 ? (
            <p>No Cloud Phones found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Country</th>
                    <th>Phone Number</th>
                    <th>Start Date</th>
                    <th>Expire Date</th>
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {toolCloudPhones.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.countryCd)}</td>
                      <td>{formatTableValue(item.phoneNumber)}</td>
                      <td>{formatDateDisplayValue(item.startDate)}</td>
                      <td>{formatDateDisplayValue(item.expireDate)}</td>
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditToolCloudPhone(item)}>
                          Edit
                        </button>
                        <button type="button" className="secondary" onClick={() => onDeleteToolCloudPhone(item.id)}>
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
            isLoading={toolCloudPhonesLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showToolCloudPhoneModal ? (
        <InlineFormCard
          title={editingToolCloudPhoneId ? `Update Cloud Phone #${editingToolCloudPhoneId}` : 'Add Cloud Phone'}
          onClose={onCloseToolCloudPhoneModal}
        >
          <form className="modal-form" onSubmit={onSaveToolCloudPhone}>
            <label htmlFor="toolCloudPhoneManagementCountryCd">Country</label>
            <select
              id="toolCloudPhoneManagementCountryCd"
              value={toolCloudPhoneCountryCd}
              onChange={(event) => onToolCloudPhoneCountryCdChange(event.target.value)}
            >
              <option value="">Select a country</option>
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="toolCloudPhoneManagementPhoneNumber">Phone Number</label>
            <input
              id="toolCloudPhoneManagementPhoneNumber"
              value={toolCloudPhoneNumber}
              onChange={(event) => onToolCloudPhoneNumberChange(event.target.value)}
              required
            />

            <label htmlFor="toolCloudPhoneManagementStartDate">Start Date</label>
            <input
              id="toolCloudPhoneManagementStartDate"
              type="date"
              value={toolCloudPhoneStartDate}
              onChange={(event) => onToolCloudPhoneStartDateChange(event.target.value)}
            />

            <label htmlFor="toolCloudPhoneManagementExpireDate">Expire Date</label>
            <input
              id="toolCloudPhoneManagementExpireDate"
              type="date"
              value={toolCloudPhoneExpireDate}
              onChange={(event) => onToolCloudPhoneExpireDateChange(event.target.value)}
            />

            <label htmlFor="toolCloudPhoneManagementRemarks">Remarks</label>
            <input
              id="toolCloudPhoneManagementRemarks"
              value={toolCloudPhoneRemarks}
              onChange={(event) => onToolCloudPhoneRemarksChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingToolCloudPhone}>
                {savingToolCloudPhone
                  ? 'Saving...'
                  : editingToolCloudPhoneId
                    ? 'Update Cloud Phone'
                    : 'Add Cloud Phone'}
              </button>
              <button type="button" className="secondary" onClick={onCloseToolCloudPhoneModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default ToolCloudPhoneManagementSection
