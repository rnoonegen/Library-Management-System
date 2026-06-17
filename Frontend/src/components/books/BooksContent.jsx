import SearchBar from 'components/common/SearchBar';

function BooksPagination({
  page,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="books-pagination" aria-label="Books pagination">
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

function BookCard({ book, onEdit, onDelete }) {
  const fmt = (val) => (val == null || val === '' ? '—' : val);

  return (
    <article key={book.id} className="book-card">
      <div className="book-card-top">
        <h3 className="book-card-title">{book.title}</h3>
        <span className={book.qty > 0 ? 'badge badge-success' : 'badge badge-danger'}>
          {book.qty > 0 ? `${book.qty} in stock` : 'Out of stock'}
        </span>
      </div>

      <dl className="book-card-details">
        <div className="book-detail">
          <dt>ISBN</dt>
          <dd>{book.isbn}</dd>
        </div>
        <div className="book-detail">
          <dt>Author</dt>
          <dd>{book.author}</dd>
        </div>
        <div className="book-detail">
          <dt>Publisher</dt>
          <dd>{fmt(book.publisher)}</dd>
        </div>
        <div className="book-detail">
          <dt>Price</dt>
          <dd>{book.price != null ? `₹${book.price}` : '—'}</dd>
        </div>
        <div className="book-detail">
          <dt>Subject</dt>
          <dd>{fmt(book.subject)}</dd>
        </div>
        <div className="book-detail">
          <dt>Grade</dt>
          <dd>{fmt(book.grade_level)}</dd>
        </div>
      </dl>

      <div className="book-card-actions">
        <button className="btn-secondary" onClick={() => onEdit(book)}>
          Edit
        </button>
        <button className="btn-danger" onClick={() => onDelete(book.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default function BooksContent({
  books,
  loading,
  search,
  total,
  start,
  end,
  totalPages,
  page,
  startPage,
  endPage,
  pageNumbers,
  onSearchChange,
  onEdit,
  onDelete,
  onPageChange,
}) {
  return (
    <>
      <div className="books-toolbar">
        <SearchBar
          className="books-search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search books by title..."
        />
        {!loading && total > 0 && (
          <span className="books-summary">
            Showing {start}–{end} of {total} books
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">
            📚
          </div>
          <strong>{search.trim() ? 'No books found' : 'No books yet'}</strong>
          <p>
            {search.trim()
              ? 'Try a different search term or clear the filter.'
              : 'Add your first book to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
          <BooksPagination
            page={page}
            totalPages={totalPages}
            startPage={startPage}
            endPage={endPage}
            pageNumbers={pageNumbers}
            onPageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}

