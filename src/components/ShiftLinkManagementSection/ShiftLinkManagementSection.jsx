import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { firstDefinedValue, formatTableValue, getStatusToneClass } from '../../lib/adsPortal'
import './ShiftLinkManagementSection.css'

function ShiftLinkManagementSection({
  adsUrls,
  adsLoading,
  adsError,
  adsMessage,
  adsUrlColumns,
  adsUrlFilters,
  adsTypeOptions,
  adsNameOptions,
  filterPlatformOptions,
  catalogLoading,
  catalogError,
  platformOptions,
  platformsLoading,
  platformsError,
  showOwnerFilter,
  ownerOptions,
  onCreateAds,
  onOpenBulkAdsUpload,
  onOpenFolderImport,
  onDownloadAdsTemplate,
  onAdsUrlFiltersChange,
  onApplyAdsUrlFilters,
  onReloadAdsUrlFilters,
  onToggleAdsStatus,
  onEditAds,
  onDeleteAds,
  formatAdsStatusLabel,
  getAdsStatusActionLabel,
  getNextAdsStatus,
  showAdsModal,
  editingAdsId,
  capMainName,
  onCapMainNameChange,
  adsType,
  onAdsTypeChange,
  platform,
  onPlatformChange,
  fullUrl,
  onFullUrlChange,
  displayNumber,
  onDisplayNumberChange,
  remark,
  onRemarkChange,
  onSaveAds,
  savingAds,
  onCloseAdsModal,
  showBulkAdsModal,
  bulkAdsSaving,
  bulkAdsError,
  bulkAdsMessage,
  onBulkAdsFileChange,
  onBulkUploadAds,
  onCloseBulkAdsModal,
  showFolderImportModal,
  folderImportAdsType,
  onFolderImportAdsTypeChange,
  folderImportDisplayNumber,
  onFolderImportDisplayNumberChange,
  folderImportSaving,
  folderImportError,
  folderImportMessage,
  onFolderImportFilesChange,
  onFolderImportShiftLinks,
  onCloseFolderImportModal,
  onOpenBulkDelete,
  showBulkDeleteModal,
  bulkDeleteMode,
  onBulkDeleteModeChange,
  bulkDeleteValue,
  onBulkDeleteValueChange,
  bulkDeleteSaving,
  bulkDeleteError,
  bulkDeleteMessage,
  onBulkDeleteShiftLinks,
  onCloseBulkDeleteModal,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel shift-link-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Shift Links</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateAds}>
                Add Shift Link
              </button>
              <button type="button" className="secondary" onClick={onOpenBulkAdsUpload}>
                Bulk Upload Excel
              </button>
              <button type="button" className="secondary" onClick={onOpenFolderImport}>
                Import from Folder
              </button>
              <button type="button" className="secondary" onClick={onOpenBulkDelete}>
                Bulk Delete
              </button>
              <button type="button" className="secondary" onClick={onDownloadAdsTemplate}>
                Download Template
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyAdsUrlFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="adsUrlOwnerFilter">Ads Owner</label>
                <select
                  id="adsUrlOwnerFilter"
                  value={adsUrlFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onAdsUrlFiltersChange({
                      ...adsUrlFilters,
                      ownerPhoneNumber: event.target.value,
                      platformName: '',
                      adsName: '',
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
              <label htmlFor="adsUrlAdsTypeFilter">Ads Type</label>
              <select
                id="adsUrlAdsTypeFilter"
                value={adsUrlFilters.adsType}
                onChange={(event) =>
                  onAdsUrlFiltersChange({
                    ...adsUrlFilters,
                    adsType: event.target.value,
                    platformName: '',
                    adsName: '',
                  })
                }
                disabled={catalogLoading || adsTypeOptions.length === 0}
              >
                <option value="">All ads types</option>
                {adsTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="adsUrlPlatformFilter">Platform Name</label>
              <select
                id="adsUrlPlatformFilter"
                value={adsUrlFilters.platformName}
                onChange={(event) =>
                  onAdsUrlFiltersChange({
                    ...adsUrlFilters,
                    platformName: event.target.value,
                    adsName: '',
                  })
                }
                disabled={
                  catalogLoading || !adsUrlFilters.adsType || filterPlatformOptions.length === 0
                }
              >
                <option value="">All platforms</option>
                {filterPlatformOptions.map((platformName) => (
                  <option key={platformName} value={platformName}>
                    {platformName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="adsUrlAdsNameFilter">Ads Name</label>
              <select
                id="adsUrlAdsNameFilter"
                value={adsUrlFilters.adsName}
                onChange={(event) =>
                  onAdsUrlFiltersChange({
                    ...adsUrlFilters,
                    adsName: event.target.value,
                  })
                }
                disabled={
                  catalogLoading ||
                  !adsUrlFilters.adsType ||
                  !adsUrlFilters.platformName ||
                  adsNameOptions.length === 0
                }
              >
                <option value="">All ads names</option>
                {adsNameOptions.map((adsName) => (
                  <option key={adsName} value={adsName}>
                    {adsName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadAdsUrlFilters}>
                Reload All
              </button>
            </div>
          </form>

          <p className="field-help">
            Use <code>adsType</code>, <code>platformName</code>, and <code>adsName</code> to
            narrow Shift Links with cascading filters.
          </p>

          {catalogError ? (
            <p className="status error" role="alert">
              {catalogError}
            </p>
          ) : null}
          {adsError ? (
            <p className="status error" role="alert">
              {adsError}
            </p>
          ) : null}
          {adsMessage ? <p className="status success">{adsMessage}</p> : null}
          {catalogLoading ? <p>Loading Shift Link filters...</p> : null}
          {adsLoading ? <p>Loading Shift Links...</p> : null}

          {!adsLoading && adsUrls.length === 0 ? (
            <p>No Shift Links found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {adsUrlColumns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adsUrls.map((item) => (
                    <tr key={item.id} className={getStatusToneClass(firstDefinedValue(item, ['status']))}>
                      {adsUrlColumns.map((column) => (
                        <td key={column.key} className={column.key === 'fullUrl' ? 'truncate' : ''}>
                          {column.key === 'status'
                            ? (
                                <span
                                  className={`status-badge ${getStatusToneClass(
                                    firstDefinedValue(item, column.fields),
                                  )}`}
                                >
                                  {formatAdsStatusLabel(firstDefinedValue(item, column.fields))}
                                </span>
                              )
                            : formatTableValue(firstDefinedValue(item, column.fields))}
                        </td>
                      ))}
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onToggleAdsStatus(item, getNextAdsStatus(item.status))}
                        >
                          {getAdsStatusActionLabel(item.status)}
                        </button>
                        <button type="button" className="secondary" onClick={() => onEditAds(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteAds(item.id)}
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
            isLoading={adsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showAdsModal ? (
        <InlineFormCard
          title={editingAdsId ? `Update Shift Link #${editingAdsId}` : 'Add Shift Link'}
          onClose={onCloseAdsModal}
        >
          <form className="modal-form" onSubmit={onSaveAds}>
            <label htmlFor="capMainName">Campaign Name</label>
            <input
              id="capMainName"
              value={capMainName}
              onChange={(event) => onCapMainNameChange(event.target.value)}
              required
            />

            <label htmlFor="adsType">Ads Type</label>
            <select
              id="adsType"
              value={adsType}
              onChange={(event) => onAdsTypeChange(event.target.value)}
              required
            >
              <option value="">Select ads type</option>
              {adsTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              value={platform}
              onChange={(event) => onPlatformChange(event.target.value)}
              required
              disabled={platformsLoading || platformOptions.length === 0}
            >
              <option value="">Select a platform</option>
              {platformOptions.map((platformName) => (
                <option key={platformName} value={platformName}>
                  {platformName}
                </option>
              ))}
            </select>
            {platformsLoading ? <p className="field-help">Loading platform list...</p> : null}
            {platformsError ? <p className="status error">{platformsError}</p> : null}
            {!platformsLoading && platformOptions.length === 0 ? (
              <p className="field-help">Create a platform first, then choose it here.</p>
            ) : null}

            <label htmlFor="fullUrl">Full URL</label>
            <input
              id="fullUrl"
              value={fullUrl}
              onChange={(event) => onFullUrlChange(event.target.value)}
              required
            />

            <label htmlFor="displayNumber">Display Capacity</label>
            <input
              id="displayNumber"
              type="number"
              min="0"
              step="1"
              value={displayNumber}
              onChange={(event) => onDisplayNumberChange(event.target.value)}
              placeholder="Enter display capacity"
            />

            <label htmlFor="remark">Remarks</label>
            <input
              id="remark"
              value={remark}
              onChange={(event) => onRemarkChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingAds}>
                {savingAds ? 'Saving...' : editingAdsId ? 'Update Shift Link' : 'Add Shift Link'}
              </button>
              <button type="button" className="secondary" onClick={onCloseAdsModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}

      {showBulkAdsModal ? (
        <InlineFormCard title="Bulk Upload Shift Links" onClose={onCloseBulkAdsModal}>
          <form className="modal-form" onSubmit={onBulkUploadAds}>
            <label htmlFor="bulkAdsFile">Excel File</label>
            <input
              id="bulkAdsFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) =>
                onBulkAdsFileChange(
                  event.target.files && event.target.files[0] ? event.target.files[0] : null,
                )
              }
              required
            />

            <p className="field-help">
              Use these Excel headers only: adsType, adsName, platformName, fullUrl,
              landingPageUrl, displayNumber, remarks.
            </p>

            {bulkAdsError ? (
              <p className="status error" role="alert">
                {bulkAdsError}
              </p>
            ) : null}
            {bulkAdsMessage ? <p className="status success">{bulkAdsMessage}</p> : null}

            <div className="form-actions">
              <button type="submit" className="primary" disabled={bulkAdsSaving}>
                {bulkAdsSaving ? 'Uploading...' : 'Upload Shift Links'}
              </button>
              <button type="button" className="secondary" onClick={onCloseBulkAdsModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}

      {showFolderImportModal ? (
        <InlineFormCard title="Import Shift Links from Folder" onClose={onCloseFolderImportModal}>
          <form className="modal-form" onSubmit={onFolderImportShiftLinks}>
            <label htmlFor="folderImportAdsType">Ads Type</label>
            <select
              id="folderImportAdsType"
              value={folderImportAdsType}
              onChange={(event) => onFolderImportAdsTypeChange(event.target.value)}
              required
            >
              <option value="">Select ads type</option>
              {adsTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="folderImportInput">Folder</label>
            <input
              id="folderImportInput"
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={(event) => onFolderImportFilesChange(event.target.files || null)}
              required
            />

            <label htmlFor="folderImportDisplayNumber">Display Number</label>
            <input
              id="folderImportDisplayNumber"
              type="number"
              min="0"
              step="1"
              value={folderImportDisplayNumber}
              onChange={(event) => onFolderImportDisplayNumberChange(event.target.value)}
              required
            />

            <p className="field-help">
              Folder structure: <code>root / platform / campaign-file</code>. First-level folders
              are platform names, file names (without extension) are Campaign Names, and each line
              inside a file is one Full URL. Display Number applies to every imported link. Missing
              platforms are created automatically.
            </p>

            {folderImportError ? (
              <p className="status error" role="alert" style={{ whiteSpace: 'pre-line' }}>
                {folderImportError}
              </p>
            ) : null}
            {folderImportMessage ? <p className="status success">{folderImportMessage}</p> : null}

            <div className="form-actions">
              <button type="submit" className="primary" disabled={folderImportSaving}>
                {folderImportSaving ? 'Importing...' : 'Import Shift Links'}
              </button>
              <button type="button" className="secondary" onClick={onCloseFolderImportModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}

      {showBulkDeleteModal ? (
        <InlineFormCard title="Bulk Delete Shift Links" onClose={onCloseBulkDeleteModal}>
          <form className="modal-form" onSubmit={onBulkDeleteShiftLinks}>
            <label htmlFor="bulkDeleteMode">Delete By</label>
            <select
              id="bulkDeleteMode"
              value={bulkDeleteMode}
              onChange={(event) => onBulkDeleteModeChange(event.target.value)}
            >
              <option value="campaign">Campaign Name</option>
              <option value="platform">Platform Name</option>
            </select>

            <label htmlFor="bulkDeleteValue">
              {bulkDeleteMode === 'platform' ? 'Platform Name' : 'Campaign Name'}
            </label>
            <input
              id="bulkDeleteValue"
              value={bulkDeleteValue}
              onChange={(event) => onBulkDeleteValueChange(event.target.value)}
              list="bulkDeleteValueOptions"
              required
            />
            <datalist id="bulkDeleteValueOptions">
              {(bulkDeleteMode === 'platform' ? platformOptions : adsNameOptions).map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>

            <p className="field-help">
              All shift links matching the selected{' '}
              {bulkDeleteMode === 'platform' ? 'Platform Name' : 'Campaign Name'} will be
              permanently deleted. This action cannot be undone.
            </p>

            {bulkDeleteError ? (
              <p className="status error" role="alert">
                {bulkDeleteError}
              </p>
            ) : null}
            {bulkDeleteMessage ? <p className="status success">{bulkDeleteMessage}</p> : null}

            <div className="form-actions">
              <button type="submit" className="primary" disabled={bulkDeleteSaving}>
                {bulkDeleteSaving ? 'Deleting...' : 'Delete'}
              </button>
              <button type="button" className="secondary" onClick={onCloseBulkDeleteModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default ShiftLinkManagementSection
