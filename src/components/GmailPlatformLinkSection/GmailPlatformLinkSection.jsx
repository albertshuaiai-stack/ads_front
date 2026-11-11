import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { formatTableValue, getStatusToneClass } from '../../lib/adsPortal'

// 评级行样式 / rating row tone
function ratingToneClass(rating) {
  if (rating === 'AVOID') return getStatusToneClass('PAUSED')
  if (rating === 'SAFE') return getStatusToneClass('RUNNING')
  return ''
}

// Gmail-返利平台-商家归类规则与统计 / Gmail-platform-merchant classify rules and stats
function GmailPlatformLinkSection({
  rules,
  rulesLoading,
  rulesError,
  rulesMessage,
  filters,
  onFiltersChange,
  onApplyFilters,
  onReloadFilters,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  showModal,
  editingId,
  ruleUserName,
  onRuleUserNameChange,
  rulePlatformName,
  onRulePlatformNameChange,
  ruleMatchId,
  onRuleMatchIdChange,
  ruleRemarks,
  onRuleRemarksChange,
  onSaveRule,
  savingRule,
  onCloseModal,
  userNameOptions,
  userNameOptionsLoading,
  platformOptions,
  platformsLoading,
  showOwnerFilter,
  ownerOptions,
  stats,
  merchantRatings,
  statsLoading,
  statsError,
  onReloadStats,
  formatDateDisplayValue,
  pagination,
  onPageChange,
  onPageSizeChange,
  historySection = null,
}) {
  return (
    <>
      <div className="panel gmail-platform-link-stats">
        <div className="user-list">
          <div className="list-header">
            <h3>Gmail / Platform / Merchant Stats</h3>
            <div className="toolbar-actions">
              <button type="button" className="secondary" onClick={onReloadStats}>
                Reload Stats
              </button>
            </div>
          </div>

          {statsError ? (
            <p className="status error" role="alert">
              {statsError}
            </p>
          ) : null}
          {statsLoading ? <p>Loading stats...</p> : null}

          {!statsLoading && stats.length === 0 ? (
            <p>No Shift Link stats found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Gmail (User Name)</th>
                    <th>Platform</th>
                    <th>Account Status</th>
                    <th>Merchants</th>
                    <th>Links</th>
                    <th>Merchant Names</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((item) => (
                    <tr
                      key={`${item.userName}/${item.platformName}`}
                      className={getStatusToneClass(item.accountStatus === 'LOCKED' ? 'PAUSED' : 'RUNNING')}
                    >
                      <td>{formatTableValue(item.userName)}</td>
                      <td>{formatTableValue(item.platformName)}</td>
                      <td>{formatTableValue(item.accountStatus)}</td>
                      <td>{formatTableValue(item.merchantCount)}</td>
                      <td>{formatTableValue(item.linkCount)}</td>
                      <td
                        className="truncate"
                        title={(item.merchants || [])
                          .map((merchant) => `${merchant.adsName} (${merchant.linkCount})`)
                          .join(', ')}
                      >
                        {(item.merchants || []).map((merchant, index) => (
                          <span key={merchant.adsName}>
                            {index > 0 ? ', ' : ''}
                            {merchant.merchantUrl ? (
                              <a
                                href={merchant.merchantUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="cell-link"
                              >
                                {merchant.adsName}
                              </a>
                            ) : (
                              merchant.adsName
                            )}
                            {` (${merchant.linkCount})`}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3>Merchant Ranking</h3>
          <p className="field-help">
            Rating by ban distribution of the accounts promoting each merchant: AVOID = every
            account promoting it was banned, CAUTION = partially banned, SAFE = no banned
            accounts, UNKNOWN = no matching cash back account row. Banned flags from History Data
            Entry below are included.
          </p>
          {!statsLoading && merchantRatings.length === 0 ? (
            <p>No merchants found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Rating</th>
                    <th>Links</th>
                    <th>Accounts</th>
                    <th>Banned</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {merchantRatings.map((merchant) => (
                    <tr key={merchant.adsName} className={ratingToneClass(merchant.rating)}>
                      <td>
                        {merchant.merchantUrl ? (
                          <a
                            href={merchant.merchantUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="cell-link"
                          >
                            {merchant.adsName}
                          </a>
                        ) : (
                          formatTableValue(merchant.adsName)
                        )}
                      </td>
                      <td>{formatTableValue(merchant.rating)}</td>
                      <td>{formatTableValue(merchant.linkCount)}</td>
                      <td>{formatTableValue(merchant.totalAccounts)}</td>
                      <td>{formatTableValue(merchant.bannedAccounts)}</td>
                      <td>{formatTableValue(merchant.activeAccounts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {historySection}

      <div className="panel gmail-platform-link-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Gmail Link Rules</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateRule}>
                Add Rule
              </button>
            </div>
          </div>

          <form className="filter-form" onSubmit={onApplyFilters}>
            {showOwnerFilter ? (
              <div className="filter-item">
                <label htmlFor="gmailPlatformLinkOwnerFilter">Ads Owner</label>
                <select
                  id="gmailPlatformLinkOwnerFilter"
                  value={filters.ownerPhoneNumber}
                  onChange={(event) =>
                    onFiltersChange({ ...filters, ownerPhoneNumber: event.target.value })
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
              <label htmlFor="gmailPlatformLinkUserNameFilter">Gmail (User Name)</label>
              <input
                id="gmailPlatformLinkUserNameFilter"
                value={filters.userName}
                onChange={(event) =>
                  onFiltersChange({ ...filters, userName: event.target.value })
                }
              />
            </div>

            <div className="filter-item">
              <label htmlFor="gmailPlatformLinkPlatformFilter">Platform</label>
              <input
                id="gmailPlatformLinkPlatformFilter"
                value={filters.platformName}
                onChange={(event) =>
                  onFiltersChange({ ...filters, platformName: event.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">
                Search
              </button>
              <button type="button" className="secondary" onClick={onReloadFilters}>
                Reload All
              </button>
            </div>
          </form>

          <p className="field-help">
            Match ID is the unique ID bound to a Gmail account and platform (e.g.{' '}
            <code>151919334</code> from <code>u1=151919334x...</code>). When a Shift Link is
            uploaded without a User Name, any link containing this ID is classified to the
            matching Gmail account automatically. Brand names come from the upload file name
            (Folder Import) or the adsName column (Excel), and are listed in the stats above.
          </p>

          {rulesError ? (
            <p className="status error" role="alert">
              {rulesError}
            </p>
          ) : null}
          {rulesMessage ? <p className="status success">{rulesMessage}</p> : null}
          {rulesLoading ? <p>Loading rules...</p> : null}

          {!rulesLoading && rules.length === 0 ? (
            <p>No rules found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Gmail (User Name)</th>
                    <th>Platform</th>
                    <th>Match ID</th>
                    <th>Remarks</th>
                    <th>Create Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((item) => (
                    <tr key={item.id}>
                      <td>{formatTableValue(item.userName)}</td>
                      <td>{formatTableValue(item.platformName)}</td>
                      <td className="truncate">{formatTableValue(item.matchId)}</td>
                      <td>{formatTableValue(item.remarks)}</td>
                      <td>{formatTableValue(formatDateDisplayValue(item.createDate))}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditRule(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteRule(item.id)}
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
            isLoading={rulesLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showModal ? (
        <InlineFormCard
          title={editingId ? `Update Rule #${editingId}` : 'Add Rule'}
          onClose={onCloseModal}
        >
          <form className="modal-form" onSubmit={onSaveRule}>
            <label htmlFor="gmailPlatformLinkUserName">Gmail (User Name)</label>
            <select
              id="gmailPlatformLinkUserName"
              value={ruleUserName}
              onChange={(event) => onRuleUserNameChange(event.target.value)}
              required
            >
              <option value="">Select user name</option>
              {userNameOptions.map((option) => (
                <option key={option.userName} value={option.userName}>
                  {option.userName}
                  {option.emailAddress ? ` (${option.emailAddress})` : ''}
                </option>
              ))}
            </select>
            {userNameOptionsLoading ? <p className="field-help">Loading user names...</p> : null}

            <label htmlFor="gmailPlatformLinkPlatformName">Platform</label>
            <select
              id="gmailPlatformLinkPlatformName"
              value={rulePlatformName}
              onChange={(event) => onRulePlatformNameChange(event.target.value)}
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

            <label htmlFor="gmailPlatformLinkMatchId">Match ID</label>
            <input
              id="gmailPlatformLinkMatchId"
              value={ruleMatchId}
              onChange={(event) => onRuleMatchIdChange(event.target.value)}
              placeholder="e.g. 151919334"
              required
            />
            <p className="field-help">
              The unique ID bound to this Gmail account and platform. Any uploaded link
              containing this ID is classified here. At least 4 characters.
            </p>

            <label htmlFor="gmailPlatformLinkRemarks">Remarks</label>
            <input
              id="gmailPlatformLinkRemarks"
              value={ruleRemarks}
              onChange={(event) => onRuleRemarksChange(event.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingRule}>
                {savingRule ? 'Saving...' : editingId ? 'Update Rule' : 'Add Rule'}
              </button>
              <button type="button" className="secondary" onClick={onCloseModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default GmailPlatformLinkSection
