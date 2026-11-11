import { formatTableValue, getStatusToneClass } from '../../lib/adsPortal'

// 历史投放数据录入，结果汇入 Gmail / Platform / Merchant 统计
// history data entry, merged into the gmail / platform / merchant stats
function ShiftLinkHistorySection({
  rows,
  loading,
  error,
  message,
  form,
  onFormChange,
  importText,
  onImportTextChange,
  saving,
  onSave,
  onImport,
  onToggleBanned,
  onEdit,
  onDelete,
  onResetForm,
  userNameOptions = [],
  platformOptions = [],
}) {
  const updateField = (field, value) => onFormChange({ ...form, [field]: value })

  return (
    <div className="panel shift-link-history">
      <div className="user-list">
        <div className="list-header">
          <h3>History Data Entry</h3>
        </div>
        <p className="field-help">
          Enter past promotions by Gmail, Platform and Merchant, and whether the account was banned
          on that platform. Entries are added to the stats above: Links are added to the merchant
          count, and a banned entry marks the Gmail / Platform account as LOCKED, which drives the
          Merchant Ranking. The same Gmail + Platform + Merchant is overwritten instead of duplicated.
        </p>

        <form
          className="filter-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSave()
          }}
        >
          <div className="filter-item">
            <label htmlFor="historyUserName">Gmail (User Name)</label>
            <input
              id="historyUserName"
              list="historyUserNameOptions"
              value={form.userName}
              onChange={(event) => updateField('userName', event.target.value)}
              required
            />
            <datalist id="historyUserNameOptions">
              {userNameOptions.map((option) => (
                <option key={option.userName} value={option.userName} />
              ))}
            </datalist>
          </div>

          <div className="filter-item">
            <label htmlFor="historyPlatformName">Platform</label>
            <input
              id="historyPlatformName"
              list="historyPlatformOptions"
              value={form.platformName}
              onChange={(event) => updateField('platformName', event.target.value)}
              required
            />
            <datalist id="historyPlatformOptions">
              {platformOptions.map((platformName) => (
                <option key={platformName} value={platformName} />
              ))}
            </datalist>
          </div>

          <div className="filter-item">
            <label htmlFor="historyAdsName">Merchant</label>
            <input
              id="historyAdsName"
              value={form.adsName}
              onChange={(event) => updateField('adsName', event.target.value)}
              placeholder="e.g. lulus"
              required
            />
          </div>

          <div className="filter-item">
            <label htmlFor="historyLinkCount">Links</label>
            <input
              id="historyLinkCount"
              type="number"
              min="0"
              value={form.linkCount}
              onChange={(event) => updateField('linkCount', event.target.value)}
              placeholder="1"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="historyBanned">Platform Banned</label>
            <select
              id="historyBanned"
              value={form.banned ? 'yes' : 'no'}
              onChange={(event) => updateField('banned', event.target.value === 'yes')}
            >
              <option value="no">No (active)</option>
              <option value="yes">Yes (banned)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={saving}>
              {form.id ? 'Update' : 'Add'}
            </button>
            {form.id ? (
              <button type="button" className="secondary" onClick={onResetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault()
            onImport()
          }}
        >
          <label htmlFor="historyImportText">Bulk Import (one row per line)</label>
          <textarea
            id="historyImportText"
            rows="5"
            value={importText}
            onChange={(event) => onImportTextChange(event.target.value)}
            placeholder={'gmail, platform, merchant, banned, links\nmarkqi, befrugal, lulus, no, 24\nmarkqi, rakuten, oakley, yes'}
          />
          <p className="field-help">
            Columns: Gmail, Platform, Merchant, Banned (yes / no), Links (optional, default 1).
            Comma or Tab separated, so rows copied from Excel can be pasted directly. A header row is skipped.
          </p>
          <div className="form-actions">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Import'}
            </button>
          </div>
        </form>

        {error ? (
          <p className="status error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="status success">{message}</p> : null}
        {loading ? <p>Loading history...</p> : null}

        {!loading && rows.length === 0 ? (
          <p>No history data yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Gmail (User Name)</th>
                  <th>Platform</th>
                  <th>Merchant</th>
                  <th>Links</th>
                  <th>Platform Banned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.banned ? getStatusToneClass('PAUSED') : ''}>
                    <td>{formatTableValue(row.userName)}</td>
                    <td>{formatTableValue(row.platformName)}</td>
                    <td>{formatTableValue(row.adsName)}</td>
                    <td>{formatTableValue(row.linkCount)}</td>
                    <td>{row.banned ? 'Yes' : 'No'}</td>
                    <td className="actions">
                      <button type="button" className="secondary" disabled={saving} onClick={() => onToggleBanned(row)}>
                        {row.banned ? 'Mark Active' : 'Mark Banned'}
                      </button>
                      <button type="button" className="secondary" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className="secondary" disabled={saving} onClick={() => onDelete(row.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShiftLinkHistorySection
