import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'

function BrandReviewManagementSection({
  brandReviews,
  brandReviewsLoading,
  brandReviewsError,
  brandReviewsMessage,
  brandReviewFilters,
  onBrandReviewFiltersChange,
  onApplyBrandReviewFilters,
  onReloadBrandReviewFilters,
  onCreateBrandReview,
  onEditBrandReview,
  onDeleteBrandReview,
  showBrandReviewModal,
  editingBrandReviewId,
  brandReviewBrand,
  onBrandReviewBrandChange,
  brandReviewScore,
  onBrandReviewScoreChange,
  brandReviewRemarks,
  onBrandReviewRemarksChange,
  onSaveBrandReview,
  savingBrandReview,
  onCloseBrandReviewModal,
  showOwnerFilter,
  ownerOptions,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel brand-review-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Brand Review</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateBrandReview}>
                Add Brand Review
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyBrandReviewFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="brandReviewManagementOwnerFilter">Ads Owner</label>
                <select
                  id="brandReviewManagementOwnerFilter"
                  value={brandReviewFilters.ownerPhoneNumber}
                  onChange={(event) =>
                    onBrandReviewFiltersChange({
                      ...brandReviewFilters,
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
              <label htmlFor="brandReviewManagementScoreFilter">Score</label>
              <select
                id="brandReviewManagementScoreFilter"
                value={brandReviewFilters.score}
                onChange={(event) =>
                  onBrandReviewFiltersChange({
                    ...brandReviewFilters,
                    score: event.target.value,
                  })
                }
              >
                <option value="">All scores</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="brandReviewManagementBrandFilter">Brand</label>
              <input
                id="brandReviewManagementBrandFilter"
                value={brandReviewFilters.brand}
                onChange={(event) =>
                  onBrandReviewFiltersChange({
                    ...brandReviewFilters,
                    brand: event.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadBrandReviewFilters}>
                Reload All
              </button>
            </div>
          </form>

          {brandReviewsError ? (
            <p className="status error" role="alert">
              {brandReviewsError}
            </p>
          ) : null}
          {brandReviewsMessage ? <p className="status success">{brandReviewsMessage}</p> : null}
          {brandReviewsLoading ? <p>Loading brand reviews...</p> : null}

          {!brandReviewsLoading && brandReviews.length === 0 ? (
            <p>No brand reviews found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Brand</th>
                    <th>Score</th>
                    <th>Remarks</th>
                    {showOwnerFilter ? <th>Ads Owner</th> : null}
                    <th>Create Date</th>
                    <th>Update Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brandReviews.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{formatTableValue(item.brand)}</td>
                      <td>{formatTableValue(item.score)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      {showOwnerFilter ? <td>{formatTableValue(item.adsOwner)}</td> : null}
                      <td>{formatDateDisplayValue(item.createDate)}</td>
                      <td>{formatDateDisplayValue(item.updateDate)}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditBrandReview(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteBrandReview(item.id)}
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
            isLoading={brandReviewsLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showBrandReviewModal ? (
        <InlineFormCard
          title={
            editingBrandReviewId ? `Update Brand Review #${editingBrandReviewId}` : 'Add Brand Review'
          }
          onClose={onCloseBrandReviewModal}
        >
          <form className="modal-form" onSubmit={onSaveBrandReview}>
            <label htmlFor="brandReviewManagementBrand">Brand</label>
            <input
              id="brandReviewManagementBrand"
              value={brandReviewBrand}
              onChange={(event) => onBrandReviewBrandChange(event.target.value)}
              required
            />

            <label htmlFor="brandReviewManagementScore">Score</label>
            <input
              id="brandReviewManagementScore"
              type="number"
              step="1"
              value={brandReviewScore}
              onChange={(event) => onBrandReviewScoreChange(event.target.value)}
              required
            />

            <label htmlFor="brandReviewManagementRemarks">Remarks</label>
            <input
              id="brandReviewManagementRemarks"
              value={brandReviewRemarks}
              onChange={(event) => onBrandReviewRemarksChange(event.target.value)}
            />


            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingBrandReview}>
                {savingBrandReview
                  ? 'Saving...'
                  : editingBrandReviewId
                    ? 'Update Brand Review'
                    : 'Add Brand Review'}
              </button>
              <button type="button" className="secondary" onClick={onCloseBrandReviewModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default BrandReviewManagementSection
