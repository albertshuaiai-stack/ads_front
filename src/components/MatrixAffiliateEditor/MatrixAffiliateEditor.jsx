import './MatrixAffiliateEditor.css'

function MatrixAffiliateEditor({ rows, platformOptions, userNameOptions = [], userNameOptionsLoading = false, onChangeRow, onRemoveRow }) {
  return (
    <div className="affiliate-editor">
      {rows.map((row, index) => (
        <div className="affiliate-row" key={index}>
          <label className="form-field">
            <span>Platform Name</span>
            <select
              value={row.platformName}
              onChange={(event) => onChangeRow(index, 'platformName', event.target.value)}
            >
              <option value="">Select platform</option>
              {platformOptions.map((platform) => (
                <option key={platform.id ?? platform.name ?? platform} value={platform.name ?? platform}>
                  {platform.name ?? platform}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>User Name</span>
            <select
              value={row.userName || ''}
              onChange={(event) => onChangeRow(index, 'userName', event.target.value)}
              disabled={userNameOptionsLoading}
            >
              <option value="">Select user</option>
              {userNameOptions.map((opt) => (
                <option key={opt.userName ?? opt.value ?? opt} value={opt.userName ?? opt.value ?? opt}>
                  {opt.userName ?? opt.emailAddress ?? opt.label ?? opt.value ?? opt}
                </option>
              ))}
            </select>
            {userNameOptionsLoading ? <p className="field-help">Loading user names...</p> : null}
          </label>

          <label className="form-field">
            <span>Affiliate URL</span>
            <input
              value={row.affiliteUrl}
              onChange={(event) => onChangeRow(index, 'affiliteUrl', event.target.value)}
              placeholder="https://..."
              type="url"
            />
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
