import './MatrixAffiliateEditor.css'

// 中间链接行：Gmail / 平台可留空，按 Match ID 自动归属 / middle link rows: gmail and platform may be blank and get classified by match id
function MatrixAffiliateEditor({ rows, platformOptions, userNameOptions = [], userNameOptionsLoading = false, onChangeRow, onRemoveRow }) {
  return (
    <div className="affiliate-editor">
      <p className="field-help">
        Leave Platform / Gmail blank to classify automatically by Gmail Link Rule. Fill Match ID when
        the middle link does not contain the key ID.
      </p>
      {rows.map((row, index) => (
        <div className="affiliate-row" key={index}>
          <label className="form-field">
            <span>Affiliate URL</span>
            <input
              value={row.affiliteUrl}
              onChange={(event) => onChangeRow(index, 'affiliteUrl', event.target.value)}
              placeholder="https://..."
              type="url"
            />
          </label>

          <label className="form-field">
            <span>Match ID</span>
            <input
              value={row.matchId || ''}
              onChange={(event) => onChangeRow(index, 'matchId', event.target.value)}
              placeholder="Auto detect from URL"
            />
          </label>

          <label className="form-field">
            <span>Platform Name</span>
            <select
              value={row.platformName}
              onChange={(event) => onChangeRow(index, 'platformName', event.target.value)}
            >
              <option value="">Auto (by Match ID)</option>
              {platformOptions.map((platform) => (
                <option key={platform.id ?? platform.name ?? platform} value={platform.name ?? platform}>
                  {platform.name ?? platform}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Gmail</span>
            <select
              value={row.userName || ''}
              onChange={(event) => onChangeRow(index, 'userName', event.target.value)}
              disabled={userNameOptionsLoading}
            >
              <option value="">Auto (by Match ID)</option>
              {userNameOptions.map((opt) => (
                <option key={opt.userName ?? opt.value ?? opt} value={opt.userName ?? opt.value ?? opt}>
                  {opt.userName ?? opt.emailAddress ?? opt.label ?? opt.value ?? opt}
                </option>
              ))}
            </select>
            {userNameOptionsLoading ? <p className="field-help">Loading user names...</p> : null}
          </label>

          <div className="affiliate-row__actions">
            <button type="button" onClick={() => onRemoveRow(index)} disabled={rows.length === 1}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MatrixAffiliateEditor
