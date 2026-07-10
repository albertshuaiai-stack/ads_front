import './MatrixAffiliateEditor.css'

function MatrixAffiliateEditor({ rows, platformOptions, onChangeRow, onRemoveRow }) {
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
            <span>Affiliate URL</span>
            <input
              value={row.affiliteUrl}
              onChange={(event) => onChangeRow(index, 'affiliteUrl', event.target.value)}
              placeholder="https://..."
              type="url"
            />
          </label>
          <label className="form-field">
            <span>Display Number</span>
            <input
              min="0"
              onChange={(event) => onChangeRow(index, 'displayNumber', event.target.value)}
              placeholder="0"
              type="number"
              value={row.displayNumber}
            />
          </label>
          <label className="form-field">
            <span>Remarks</span>
            <input
              value={row.remarks}
              onChange={(event) => onChangeRow(index, 'remarks', event.target.value)}
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
