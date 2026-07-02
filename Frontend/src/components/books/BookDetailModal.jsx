import Modal from 'components/common/Modal';
import BookImageCarousel from 'components/books/BookImageCarousel';
import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';
import { formatDateOnly } from 'utils/formatDate';
import { getBookImages } from 'utils/bookImageStore';

function DetailRow({ label, value }) {
  const display = value == null || value === '' ? '—' : value;
  return (
    <div className="book-detail-row">
      <dt>{label}</dt>
      <dd>{display}</dd>
    </div>
  );
}

export default function BookDetailModal({ book, isOpen, onClose, footer }) {
  if (!isOpen || !book) return null;

  const images = getBookImages(book.id);
  const isReference = book.book_type === BOOK_TYPES.reference;
  const isSell = book.book_type === BOOK_TYPES.sell;
  const available = book.qty > 0;

  const stockLabel = isReference
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
    <Modal title={book.title} onClose={onClose}>
      <div className="book-detail-modal">
        <BookImageCarousel images={images} className="book-detail-modal-carousel" />
        <dl className="book-detail-modal-fields">
          <DetailRow label="ISBN" value={book.isbn} />
          <DetailRow label="Author" value={book.author} />
          <DetailRow label="Publisher" value={book.publisher} />
          <DetailRow
            label="Type"
            value={BOOK_TYPE_LABELS[book.book_type] || BOOK_TYPE_LABELS.borrow}
          />
          <DetailRow label="Stock" value={stockLabel} />
          <DetailRow
            label="Price"
            value={book.price != null ? `₹${book.price}` : null}
          />
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
        {footer && <div className="book-detail-modal-footer">{footer}</div>}
      </div>
    </Modal>
  );
}
