import './PageHeader.css'

function PageHeader({
  title,
  currentUser,
  currentUserRole,
  currentUserApiKey,
  currentUserExpireDate,
  runningNormalAdsCount,
  normalAdsTotalCount,
  runningMatrixAdsCount,
  matrixAdsTotalCount,
}) {
  return (
    <header className="page-header">
      <h1>{title}</h1>

      <div className="page-header__meta">
        <div className="page-header__meta-left">
          <div>
            <strong>User:</strong> {currentUser || '—'}
          </div>
          <div>
            <strong>Role:</strong> {currentUserRole || '—'}
          </div>
          <div className="page-header__api-key">
            <strong>API_KEY:</strong> <span>{currentUserApiKey || '—'}</span>
          </div>
          <div>
            <strong>Expire Date:</strong> {currentUserExpireDate || '—'}
          </div>
        </div>
        <div className="page-header__meta-right">
          <div>
            <strong>Normal Ads Tasks:</strong> {runningNormalAdsCount} / {normalAdsTotalCount ?? '—'}
          </div>
          <div>
            <strong>Matrix Ads Tasks:</strong> {runningMatrixAdsCount} / {matrixAdsTotalCount ?? '—'}
          </div>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
