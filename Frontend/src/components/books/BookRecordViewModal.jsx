import { useEffect, useState } from 'react';
import Modal from 'components/common/Modal';
import BookImageCarousel from 'components/books/BookImageCarousel';
import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';
import { formatDateOnly } from 'utils/formatDate';
import { getBookImages } from 'utils/bookImageStore';
import { api } from 'services/api';

function DetailRow({ label, value }) {
  const display = value == null || value === '' ? '—' : value;
  return (
    <div className="book-detail-row">
      <dt>{label}</dt>
      <dd>{display}</dd>
    </div>
  );
}

export default function BookRecordViewModal({
  bookId,
  isOpen,
  onClose,
  recordTitle = 'Details',
  recordDetails = [],
  footer,
}) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !bookId) {
      setBook(null);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .getBook(bookId)
      .then((data) => {
        if (!cancelled) setBook(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load book');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, bookId]);

  if (!isOpen) return null;

  const images = book ? getBookImages(book.id) : getBookImages(bookId);
  const isReference = book?.book_type === BOOK_TYPES.reference;
  const isSell = book?.book_type === BOOK_TYPES.sell;
  const available = (book?.qty ?? 0) > 0;

  const stockLabel = !book
    ? null
    : isReference
      ? available
        ? 'Available in library'
        : 'Not available'
      : isSell
        ? available
          ? `${book.qty} for sale`
          : 'Out of stock'
        : available
          ? `${book.qty} available`
          : 'Unavailable';

  return (
    <Modal title={book?.title || 'Book details'} onClose={onClose}>
      <div className="book-detail-modal">
        <BookImageCarousel images={images} className="book-detail-modal-carousel" expandable />

        {loading ? (
          <div className="loading">Loading book details...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : book ? (
          <dl className="book-detail-modal-fields">
            <DetailRow label="ISBN" value={book.isbn} />
            <DetailRow label="Author" value={book.author} />
            <DetailRow label="Publisher" value={book.publisher} />
            <DetailRow
              label="Type"
              value={BOOK_TYPE_LABELS[book.book_type] || BOOK_TYPE_LABELS.borrow}
            />
            <DetailRow label="Stock" value={stockLabel} />
            <DetailRow label="Price" value={book.price != null ? `₹${book.price}` : null} />
            <DetailRow label="Subject" value={book.subject} />
            <DetailRow label="Language" value={book.language} />
            <DetailRow label="Grade" value={book.grade_level} />
            <DetailRow
              label="Published"
              value={book.date_of_publication ? formatDateOnly(book.date_of_publication) : null}
            />
            {book.abstract && (
              <div className="book-detail-row book-detail-row-full">
                <dt>Abstract</dt>
                <dd>{book.abstract}</dd>
              </div>
            )}
          </dl>
        ) : null}

        {recordDetails.length > 0 && (
          <div className="book-record-section">
            <h3 className="book-record-section-title">{recordTitle}</h3>
            <dl className="book-detail-modal-fields">
              {recordDetails.map((row) => (
                <DetailRow key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </div>
        )}

        {footer && <div className="book-detail-modal-footer">{footer}</div>}
      </div>
    </Modal>
  );
}
