import { useState } from 'react';
import Pagination from 'components/common/Pagination';
import BookTypeTabs from 'components/books/BookTypeTabs';
import BooksControlsPanel from 'components/books/BooksControlsPanel';
import BookCatalogCard from 'components/books/BookCatalogCard';
import BookDetailModal from 'components/books/BookDetailModal';
import UserBookActions from 'components/users/UserBookActions';
import { hasActiveBookFilters } from 'utils/bookFilterParams';

function bookActionProps(book, context) {
  return {
    book,
    alreadyBorrowed: context.borrowedBookIds?.has(book.id),
    activeHold: context.holdsByBookId?.[book.id],
    activePurchase: context.purchasesByBookId?.[book.id],
    atBorrowLimit: context.atBorrowLimit,
    requestingId: context.requestingId,
    buyingId: context.buyingId,
    onRequest: context.onRequest,
    onBuy: context.onBuy,
  };
}

export default function UserBooksContent({
  books,
  search,
  subjects,
  languages,
  priceSort,
  bookType,
  typeCounts,
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
  buyingId,
  borrowedBookIds,
  holdsByBookId,
  purchasesByBookId,
  atBorrowLimit,
  onSearchChange,
  onSubjectsChange,
  onLanguagesChange,
  onPriceSortChange,
  onClearFilters,
  onBookTypeChange,
  onPageChange,
  onRequest,
  onBuy,
}) {
  const [viewBook, setViewBook] = useState(null);
  const hasFilters = hasActiveBookFilters({ search, subjects, languages, bookType, priceSort });
  const emptyMessage = hasFilters ? 'No books found' : 'No books available';
  const emptyHint = hasFilters
    ? 'Try different search terms or filters.'
    : 'Check back later for new titles.';

  const actionContext = {
    borrowedBookIds,
    holdsByBookId,
    purchasesByBookId,
    atBorrowLimit,
    requestingId,
    buyingId,
    onRequest,
    onBuy,
  };

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
          <div className="empty-state-icon" aria-hidden="true">📚</div>
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
                variant="user"
                onView={setViewBook}
                footer={<UserBookActions {...bookActionProps(book, actionContext)} />}
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
        footer={
          viewBook ? (
            <UserBookActions {...bookActionProps(viewBook, actionContext)} />
          ) : null
        }
      />
    </>
  );
}
