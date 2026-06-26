import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import BookFilters from 'components/books/BookFilters';
import BookTypeTabs from 'components/books/BookTypeTabs';
import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';
import { hasBookFilters } from 'utils/bookFilterParams';

function BookCard({ book, onEdit, onDelete }) {
  const fmt = (val) => (val == null || val === '' ? '—' : val);
  const isReference = book.book_type === BOOK_TYPES.reference;
  const isSell = book.book_type === BOOK_TYPES.sell;
  const typeBadgeClass = isReference ? 'badge-info' : isSell ? 'badge-warning' : 'badge-borrowed';

  return (
    <article key={book.id} className="book-card">
      <div className="book-card-top">
        <h3 className="book-card-title">{book.title}</h3>
        <div className="book-card-badges">
          <span className={`badge ${typeBadgeClass}`}>
            {BOOK_TYPE_LABELS[book.book_type] || BOOK_TYPE_LABELS.borrow}
          </span>
          <span className={book.qty > 0 ? 'badge badge-success' : 'badge badge-danger'}>
            {book.qty > 0 ? `${book.qty} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

      {(book.subject || book.language) && (
        <div className="book-card-tags">
          {book.subject && <span className="book-tag">{book.subject}</span>}
          {book.language && <span className="book-tag book-tag-language">{book.language}</span>}
        </div>
      )}

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
          <dt>Language</dt>
          <dd>{fmt(book.language)}</dd>
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
  selectedSubjects,
  selectedLanguages,
  filterOptions,
  bookType,
  typeCounts,
  priceSort,
  total,
  start,
  end,
  totalPages,
  page,
  startPage,
  endPage,
  pageNumbers,
  onSearchChange,
  onSubjectsChange,
  onLanguagesChange,
  onClearFilters,
  onBookTypeChange,
  onPriceSortChange,
  onEdit,
  onDelete,
  onPageChange,
}) {
  const hasActiveFilters = hasBookFilters(
    search,
    selectedSubjects,
    selectedLanguages,
    filterOptions,
    priceSort,
  );
  const emptyMessage = hasActiveFilters ? 'No books found' : 'No books yet';
  const emptyHint = hasActiveFilters
    ? 'Try a different search term or clear the filters.'
    : 'Add your first book to get started.';

  return (
    <>
      <BookTypeTabs activeType={bookType} counts={typeCounts} onChange={onBookTypeChange} />

      <div className="books-toolbar">
        <div className="books-toolbar-main">
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

        <BookFilters
          subjects={filterOptions.subjects}
          languages={filterOptions.languages}
          selectedSubjects={selectedSubjects}
          selectedLanguages={selectedLanguages}
          onSubjectsChange={onSubjectsChange}
          onLanguagesChange={onLanguagesChange}
          onClear={onClearFilters}
          hasActiveFilters={hasActiveFilters}
          bookType={bookType}
          priceSort={priceSort}
          onPriceSortChange={onPriceSortChange}
        />
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">
            📚
          </div>
          <strong>{emptyMessage}</strong>
          <p>{emptyHint}</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
          <Pagination
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
