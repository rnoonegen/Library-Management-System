import Button from 'components/common/Button';
import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import BookFilters from 'components/books/BookFilters';
import { hasBookFilters } from 'utils/bookFilterParams';

function waitlistLabel(hold) {
  if (hold.status === 'ready') return 'Ready — visit library';
  if (hold.queue_position) return `On waitlist (#${hold.queue_position})`;
  return 'On waitlist';
}

function UserBookCard({
  book,
  alreadyBorrowed,
  activeHold,
  atBorrowLimit,
  requestingId,
  onRequest,
}) {
  const available = book.qty > 0;
  const canJoin = !available && !alreadyBorrowed && !activeHold && !atBorrowLimit;

  return (
    <article className="book-card user-book-card">
      <div className="book-card-top">
        <h3 className="book-card-title">{book.title}</h3>
        <span className={available ? 'badge badge-success' : 'badge badge-danger'}>
          {available ? `${book.qty} available` : 'Unavailable'}
        </span>
      </div>

      {(book.subject || book.language) && (
        <div className="book-card-tags">
          {book.subject && <span className="book-tag">{book.subject}</span>}
          {book.language && <span className="book-tag book-tag-language">{book.language}</span>}
        </div>
      )}

      <dl className="book-card-details">
        <div className="book-detail">
          <dt>Author</dt>
          <dd>{book.author || '—'}</dd>
        </div>
        <div className="book-detail">
          <dt>Publisher</dt>
          <dd>{book.publisher || '—'}</dd>
        </div>
        <div className="book-detail">
          <dt>Subject</dt>
          <dd>{book.subject || '—'}</dd>
        </div>
        <div className="book-detail">
          <dt>Language</dt>
          <dd>{book.language || '—'}</dd>
        </div>
      </dl>

      <div className="book-card-actions user-book-card-actions">
        {alreadyBorrowed ? (
          <>
            <p className="book-status-owned" style={{ margin: 0 }}>You have this book</p>
            <p className="book-status-owned" style={{ margin: 0, fontSize: '0.875rem' }}>
              Return before joining the waitlist again.
            </p>
          </>
        ) : activeHold ? (
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            {waitlistLabel(activeHold)} — see My Requests
          </p>
        ) : atBorrowLimit && !available ? (
          <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem' }}>
            You already fulfilled the limit (max 3 active books).
          </p>
        ) : available ? (
          <p className="book-status-available" style={{ margin: 0, fontSize: '0.875rem' }}>
            Visit the library to borrow this book.
          </p>
        ) : (
          <Button
            variant="primary"
            disabled={!canJoin || requestingId === book.id}
            onClick={() => onRequest(book.id, book.title)}
          >
            {requestingId === book.id ? 'Joining...' : 'Join waitlist'}
          </Button>
        )}
      </div>
    </article>
  );
}

export default function UserBooksContent({
  books,
  search,
  selectedSubjects,
  selectedLanguages,
  filterOptions,
  loading,
  total,
  start,
  end,
  page,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  requestingId,
  borrowedBookIds,
  holdsByBookId,
  atBorrowLimit,
  onSearchChange,
  onSubjectsChange,
  onLanguagesChange,
  onClearFilters,
  onPageChange,
  onRequest,
}) {
  const hasActiveFilters = hasBookFilters(search, selectedSubjects, selectedLanguages, filterOptions);
  const emptyMessage = hasActiveFilters ? 'No books found' : 'No books available';
  const emptyHint = hasActiveFilters
    ? 'Try a different search term or clear the filters.'
    : 'Check back later for new titles.';

  return (
    <>
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
        />
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">📚</div>
          <strong>{emptyMessage}</strong>
          <p>{emptyHint}</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <UserBookCard
                key={book.id}
                book={book}
                alreadyBorrowed={borrowedBookIds?.has(book.id)}
                activeHold={holdsByBookId?.[book.id]}
                atBorrowLimit={atBorrowLimit}
                requestingId={requestingId}
                onRequest={onRequest}
              />
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
