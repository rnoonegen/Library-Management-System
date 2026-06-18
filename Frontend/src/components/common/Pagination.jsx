export default function Pagination({
  page,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  onPageChange,
  className = 'books-pagination',
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={className} aria-label="Pagination">
      <button
        type="button"
        className="btn-secondary pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <div className="pagination-pages">
        {startPage > 1 && (
          <>
            <button type="button" className="pagination-page" onClick={() => onPageChange(1)}>
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">…</span>}
          </>
        )}
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            className={`pagination-page ${n === page ? 'active' : ''}`}
            onClick={() => onPageChange(n)}
            aria-current={n === page ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
            <button
              type="button"
              className="pagination-page"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className="btn-secondary pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
