import { useCallback, useState } from 'react';
import BookRecordViewModal from 'components/books/BookRecordViewModal';

export function useBookRecordView() {
  const [viewState, setViewState] = useState(null);

  const openBookView = useCallback((bookId, config = {}) => {
    if (!bookId) return;
    setViewState({ bookId, ...config });
  }, []);

  const closeBookView = useCallback(() => {
    setViewState(null);
  }, []);

  const BookViewModal = viewState ? (
    <BookRecordViewModal
      bookId={viewState.bookId}
      isOpen
      onClose={closeBookView}
      recordTitle={viewState.recordTitle}
      recordDetails={viewState.recordDetails}
      footer={viewState.footer}
    />
  ) : null;

  return { openBookView, closeBookView, BookViewModal };
}
