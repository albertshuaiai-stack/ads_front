import '../MatrixAffiliateEditor/MatrixAffiliateEditor.css'

function ParameterRowEditor({ rows, onChangeRow, onRemoveRow }) {
  return (
    <div className="affiliate-editor">
      {rows.map((row, index) => (
        <div className="affiliate-row" key={index}>
          <label className="form-field">
            <span>Parameter Name</span>
            <input
              value={row.parameterName}
              onChange={(event) => onChangeRow(index, 'parameterName', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Parameter Value</span>
            <input
              value={row.parameterValue}
              onChange={(event) => onChangeRow(index, 'parameterValue', event.target.value)}
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

export default ParameterRowEditor
