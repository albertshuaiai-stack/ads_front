import './PaginationControls.css'

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function PaginationControls({
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
}) {
  const totalElements = pagination?.totalElements ?? 0
  const totalPages = pagination?.totalPages ?? 0
  const page = pagination?.page ?? 0
  const size = pagination?.size ?? PAGE_SIZE_OPTIONS[0]

  if (totalElements === 0) {
    return null
  }

  return (
    <div className="pagination-controls">
      <div className="pagination-controls__summary">
        Page {page + 1} of {Math.max(totalPages, 1)} · {totalElements} items
      </div>

      <div className="pagination-controls__actions">
        <label className="pagination-controls__size" htmlFor={`page-size-${size}`}>
          <span>Rows</span>
          <select
            id={`page-size-${size}`}
            value={size}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={isLoading}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={isLoading || page <= 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoading || page + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
