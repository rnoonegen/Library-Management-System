import Button from 'components/common/Button';
import BookImageCarousel from 'components/books/BookImageCarousel';
import { getBookImages } from 'utils/bookImageStore';

export default function BookLinkedCard({
  bookId,
  bookTitle,
  badge,
  onView,
  children,
  actions,
  secondaryActions,
}) {
  const images = getBookImages(bookId);

  return (
    <article className="transaction-card transaction-catalog-card">
      <BookImageCarousel images={images} compact expandable />
      <div className="transaction-catalog-card-body">
        <div className="transaction-card-top">
          <h3 className="transaction-card-title" title={bookTitle}>
            {bookTitle}
          </h3>
          {badge && <div className="transaction-card-badge">{badge}</div>}
        </div>

        {children}

        <div className="transaction-card-actions transaction-catalog-card-actions">
          {bookId && (
            <Button variant="secondary" onClick={() => onView(bookId)}>
              View
            </Button>
          )}
          {actions}
        </div>

        {secondaryActions && (
          <div className="transaction-card-actions transaction-card-secondary-actions">
            {secondaryActions}
          </div>
        )}
      </div>
    </article>
  );
}
