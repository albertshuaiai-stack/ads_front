import './TestShiftLinkSection.css'

function formatResponseBody(response) {
  if (response == null) {
    return ''
  }

  if (typeof response === 'string') {
    return response
  }

  return JSON.stringify(response, null, 2)
}

function TestShiftLinkSection({
  campainName,
  onCampainNameChange,
  apiKey,
  onApiKeyChange,
  testError,
  normalAdsTestLoading,
  matrixAdsTestLoading,
  normalAdsTestResponse,
  matrixAdsTestResponse,
  onTestNormalAds,
  onTestMatrixAds,
}) {
  return (
    <div className="panel test-shift-link">
      <div className="user-list">
        <div className="list-header">
          <h3>Shift Link Testing</h3>
          <div className="toolbar-actions">
            <button
              type="button"
              className="primary"
              onClick={onTestNormalAds}
              disabled={normalAdsTestLoading}
            >
              {normalAdsTestLoading ? 'Testing Normal Ads...' : 'Test Normal Ads'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={onTestMatrixAds}
              disabled={matrixAdsTestLoading}
            >
              {matrixAdsTestLoading ? 'Testing Matrix Ads...' : 'Test Matrix Ads'}
            </button>
          </div>
        </div>

        <div className="filter-form">
          <div className="filter-item">
            <label htmlFor="testShiftLinkCampainName">Campaign Name</label>
            <input
              id="testShiftLinkCampainName"
              value={campainName}
              onChange={(event) => onCampainNameChange(event.target.value)}
              placeholder="Enter campain_name"
              required
            />
          </div>

          <div className="filter-item">
            <label htmlFor="testShiftLinkApiKey">API Key</label>
            <input
              id="testShiftLinkApiKey"
              value={apiKey}
              onChange={(event) => onApiKeyChange(event.target.value)}
              placeholder="Auto-filled from current user"
              required
            />
          </div>
        </div>

        <p className="field-help">
          Uses <code>/api/normal/ads</code> and <code>/api/matrix/ads</code> with
          <code> campain_name</code> and <code>api_key</code>.
        </p>

        {testError ? (
          <p className="status error" role="alert">
            {testError}
          </p>
        ) : null}

        <div className="test-shift-link__responses">
          <section className="test-shift-link__response-card">
            <h4>/api/normal/ads Response</h4>
            {normalAdsTestResponse == null ? (
              <p className="field-help">No response yet.</p>
            ) : (
              <pre>{formatResponseBody(normalAdsTestResponse)}</pre>
            )}
          </section>

          <section className="test-shift-link__response-card">
            <h4>/api/matrix/ads Response</h4>
            {matrixAdsTestResponse == null ? (
              <p className="field-help">No response yet.</p>
            ) : (
              <pre>{formatResponseBody(matrixAdsTestResponse)}</pre>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default TestShiftLinkSection
