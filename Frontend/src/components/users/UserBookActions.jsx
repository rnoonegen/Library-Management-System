import Button from 'components/common/Button';
import { BOOK_TYPES } from 'constants/bookCatalog';

function waitlistLabel(hold) {
  if (hold.status === 'ready') return 'Ready — visit library';
  if (hold.queue_position) return `On waitlist (#${hold.queue_position})`;
  return 'On waitlist';
}

function purchaseLabel(order) {
  if (order.status === 'ready') return 'Ready — visit library to pay';
  if (order.status === 'pending') return 'Order pending — see My Requests';
  return 'Ordered';
}

export default function UserBookActions({
  book,
  alreadyBorrowed,
  activeHold,
  activePurchase,
  atBorrowLimit,
  requestingId,
  buyingId,
  onRequest,
  onBuy,
}) {
  const isReference = book.book_type === BOOK_TYPES.reference;
  const isSell = book.book_type === BOOK_TYPES.sell;
  const available = book.qty > 0;
  const canJoin = !isReference && !isSell && !available && !alreadyBorrowed && !activeHold && !atBorrowLimit;
  const canBuy = isSell && available && !activePurchase;

  if (isReference) {
    return (
      <p className="book-status-reference" style={{ margin: 0, fontSize: '0.875rem' }}>
        Reference book — read in the library only. Cannot be borrowed or taken home.
      </p>
    );
  }

  if (isSell) {
    if (activePurchase) {
      return (
        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
          {purchaseLabel(activePurchase)} — see My Requests
        </p>
      );
    }
    if (available) {
      return (
        <Button
          variant="primary"
          disabled={buyingId === book.id}
          onClick={() => onBuy(book.id, book.title, book.price)}
        >
          {buyingId === book.id ? 'Ordering...' : `Buy — ₹${book.price}`}
        </Button>
      );
    }
    return (
      <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
        Out of stock — check back later.
      </p>
    );
  }

  if (alreadyBorrowed) {
    return (
      <>
        <p className="book-status-owned" style={{ margin: 0 }}>You have this book</p>
        <p className="book-status-owned" style={{ margin: 0, fontSize: '0.875rem' }}>
          Return before joining the waitlist again.
        </p>
      </>
    );
  }

  if (activeHold) {
    return (
      <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
        {waitlistLabel(activeHold)} — see My Requests
      </p>
    );
  }

  if (atBorrowLimit && !available) {
    return (
      <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem' }}>
        You already fulfilled the limit (max 3 active books).
      </p>
    );
  }

  if (available) {
    return (
      <p className="book-status-available" style={{ margin: 0, fontSize: '0.875rem' }}>
        Visit the library to borrow this book.
      </p>
    );
  }

  return (
    <Button
      variant="primary"
      disabled={!canJoin || requestingId === book.id}
      onClick={() => onRequest(book.id, book.title)}
    >
      {requestingId === book.id ? 'Joining...' : 'Join waitlist'}
    </Button>
  );
}
