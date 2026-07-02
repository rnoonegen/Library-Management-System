import Pagination from 'components/common/Pagination';
import BookTypeTabs from 'components/books/BookTypeTabs';
import BooksControlsPanel from 'components/books/BooksControlsPanel';
import BookCatalogCard from 'components/books/BookCatalogCard';
import BookDetailModal from 'components/books/BookDetailModal';
import { hasActiveBookFilters } from 'utils/bookFilterParams';
import { useState } from 'react';

export default function BooksContent({
  books,
  loading,
  search,
  subjects,
  languages,
  priceSort,
  bookType,
  typeCounts,
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
  onPriceSortChange,
  onClearFilters,
  onBookTypeChange,
  onEdit,
  onDelete,
  onPageChange,
}) {
  const [viewBook, setViewBook] = useState(null);
  const hasFilters = hasActiveBookFilters({ search, subjects, languages, bookType, priceSort });
  const emptyMessage = hasFilters ? 'No books found' : 'No books yet';
  const emptyHint = hasFilters
    ? 'Try different search terms or filters.'
    : 'Add your first book to get started.';

  return (
    <>
      <BookTypeTabs activeType={bookType} counts={typeCounts} onChange={onBookTypeChange} />

      <BooksControlsPanel
        search={search}
        onSearchChange={onSearchChange}
        bookType={bookType}
        subjects={subjects}
        languages={languages}
        priceSort={priceSort}
        onSubjectsChange={onSubjectsChange}
        onLanguagesChange={onLanguagesChange}
        onPriceSortChange={onPriceSortChange}
        onClearFilters={onClearFilters}
        showClear={hasFilters}
        loading={loading}
        total={total}
        start={start}
        end={end}
      />

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
          <div className="books-grid books-catalog-grid">
            {books.map((book) => (
              <BookCatalogCard
                key={book.id}
                book={book}
                variant="admin"
                onView={setViewBook}
                onEdit={onEdit}
                onDelete={onDelete}
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

      <BookDetailModal
        book={viewBook}
        isOpen={!!viewBook}
        onClose={() => setViewBook(null)}
      />
    </>
  );
}
