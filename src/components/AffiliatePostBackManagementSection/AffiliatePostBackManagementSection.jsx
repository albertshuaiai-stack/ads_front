import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue } from '../../lib/adsPortal'
import { formatDateTimeDisplayValueWithDashedDate } from '../../utils/formatters'

function AffiliatePostBackManagementSection({
  affiliatePostBacks,
  affiliatePostBacksLoading,
  affiliatePostBacksError,
  affiliatePostBacksMessage,
  affiliatePostBackFilters,
  affiliatePostBackStatusOptions,
  affiliateSiteOptions,
  onAffiliatePostBackFiltersChange,
  onApplyAffiliatePostBackFilters,
  onReloadAffiliatePostBackFilters,
  showOwnerFilter,
  ownerOptions,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="panel affiliate-post-back-management">
      <div className="user-list">
        <div className="list-header">
          <h3>Post Back</h3>
        </div>

        <form className="filter-form" onSubmit={onApplyAffiliatePostBackFilters}>
          {showOwnerFilter ? (
            <div className="filter-item">
              <label htmlFor="affiliatePostBackOwnerFilter">Owner</label>
              <select
                id="affiliatePostBackOwnerFilter"
                value={affiliatePostBackFilters.ownerPhoneNumber}
                onChange={(event) =>
                  onAffiliatePostBackFiltersChange({
                    ...affiliatePostBackFilters,
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
            <label htmlFor="affiliatePostBackSiteFilter">Affiliate Site</label>
            <select
              id="affiliatePostBackSiteFilter"
              value={affiliatePostBackFilters.affiliateSite}
              onChange={(event) =>
                onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  affiliateSite: event.target.value,
                })
              }
            >
              <option value="">All affiliate sites</option>
              {affiliateSiteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="affiliatePostBackOrderNoFilter">Order No</label>
            <input
              id="affiliatePostBackOrderNoFilter"
              type="text"
              value={affiliatePostBackFilters.orderNo}
              onChange={(event) =>
                onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  orderNo: event.target.value,
                })
              }
              placeholder="Search order no"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="affiliatePostBackStatusFilter">Status</label>
            <select
              id="affiliatePostBackStatusFilter"
              value={affiliatePostBackFilters.status}
              onChange={(event) =>
                onAffiliatePostBackFiltersChange({
                  ...affiliatePostBackFilters,
                  status: event.target.value,
                })
              }
            >
              <option value="">All statuses</option>
              {affiliatePostBackStatusOptions.map((option) => (
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
            <button type="button" className="secondary" onClick={onReloadAffiliatePostBackFilters}>
              Reload All
            </button>
          </div>
        </form>

        {affiliatePostBacksError ? (
          <p className="status error" role="alert">
            {affiliatePostBacksError}
          </p>
        ) : null}
        {affiliatePostBacksMessage ? <p className="status success">{affiliatePostBacksMessage}</p> : null}
        {affiliatePostBacksLoading ? <p>Loading Post Back records...</p> : null}

        {!affiliatePostBacksLoading && affiliatePostBacks.length === 0 ? (
          <p>No Post Back records found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Affiliate Site</th>
                  <th>Advertiser Shop ID</th>
                  <th>Advertiser Shop Name</th>
                  <th>Sign ID</th>
                  <th>Order No</th>
                  <th>Order Time</th>
                  <th>Order Amount</th>
                  <th>User Commission Amount</th>
                  <th>Status</th>
                  <th>Sub ID</th>
                  <th>Sub ID2</th>
                  <th>Click Time</th>
                </tr>
              </thead>
              <tbody>
                {affiliatePostBacks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{formatTableValue(item.affiliateSite)}</td>
                    <td>{formatTableValue(item.advertiserShopId)}</td>
                    <td>{formatTableValue(item.advertiserShopName)}</td>
                    <td>{formatTableValue(item.signId)}</td>
                    <td>{formatTableValue(item.orderNo)}</td>
                    <td>{formatDateTimeDisplayValueWithDashedDate(item.orderTime)}</td>
                    <td>{formatTableValue(item.orderAmount)}</td>
                    <td>{formatTableValue(item.userCommissionAmount)}</td>
                    <td>{formatTableValue(item.status)}</td>
                    <td>{formatTableValue(item.subId)}</td>
                    <td>{formatTableValue(item.subId2)}</td>
                    <td>{formatDateTimeDisplayValueWithDashedDate(item.clickTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          pagination={pagination}
          isLoading={affiliatePostBacksLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}

export default AffiliatePostBackManagementSection
