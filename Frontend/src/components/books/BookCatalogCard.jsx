import Button from 'components/common/Button';
import BookImageCarousel from 'components/books/BookImageCarousel';
import { getBookAvailabilityLabel, isBookAvailable } from 'constants/bookCatalog';
import { getBookImages } from 'utils/bookImageStore';

export default function BookCatalogCard({
  book,
  variant = 'user',
  onView,
  onEdit,
  onDelete,
  footer,
}) {
  const images = getBookImages(book.id);
  const available = isBookAvailable(book);
  const availabilityLabel = getBookAvailabilityLabel(book);

  return (
    <article className="book-catalog-card">
      <BookImageCarousel images={images} compact expandable />
      <div className="book-catalog-card-body">
        <h3 className="book-catalog-card-title" title={book.title}>
          {book.title}
        </h3>
        <span className={`book-catalog-card-stock badge ${available ? 'badge-success' : 'badge-danger'}`}>
          {availabilityLabel}
        </span>
        <div className="book-catalog-card-actions">
          <Button variant="secondary" onClick={() => onView(book)}>
            View
          </Button>
          {variant === 'admin' && (
            <>
              <button type="button" className="btn-secondary" onClick={() => onEdit(book)}>
                Edit
              </button>
              <button type="button" className="btn-danger" onClick={() => onDelete(book.id)}>
                Delete
              </button>
            </>
          )}
        </div>
        {footer && <div className="book-catalog-card-footer">{footer}</div>}
      </div>
    </article>
  );
}
