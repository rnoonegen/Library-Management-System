import Button from 'components/common/Button';
import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import BookTypeTabs from 'components/books/BookTypeTabs';
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



function UserBookCard({

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



  return (

    <article className="book-card user-book-card">

      <div className="book-card-top">

        <h3 className="book-card-title">{book.title}</h3>

        <span className={available ? 'badge badge-success' : 'badge badge-danger'}>

          {isReference

            ? (available ? 'Available in library' : 'Not available')

            : isSell

              ? (available ? `${book.qty} for sale` : 'Out of stock')

              : (available ? `${book.qty} available` : 'Unavailable')}

        </span>

      </div>

      <dl className="book-card-details">

        <div className="book-detail">

          <dt>Author</dt>

          <dd>{book.author || '—'}</dd>

        </div>

        <div className="book-detail">

          <dt>Publisher</dt>

          <dd>{book.publisher || '—'}</dd>

        </div>

        {isSell && (

          <div className="book-detail">

            <dt>Price</dt>

            <dd>{book.price != null ? `₹${book.price}` : '—'}</dd>

          </div>

        )}

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

        {isReference ? (

          <p className="book-status-reference" style={{ margin: 0, fontSize: '0.875rem' }}>

            Reference book — read in the library only. Cannot be borrowed or taken home.

          </p>

        ) : isSell ? (

          activePurchase ? (

            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>

              {purchaseLabel(activePurchase)} — see My Requests

            </p>

          ) : available ? (

            <Button

              variant="primary"

              disabled={buyingId === book.id}

              onClick={() => onBuy(book.id, book.title, book.price)}

            >

              {buyingId === book.id ? 'Ordering...' : `Buy — ₹${book.price}`}

            </Button>

          ) : (

            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>

              Out of stock — check back later.

            </p>

          )

        ) : alreadyBorrowed ? (

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
  onBookTypeChange,
  onPageChange,
  onRequest,
  onBuy,
}) {
  const hasSearch = Boolean(search.trim());
  const emptyMessage = hasSearch ? 'No books found' : 'No books available';
  const emptyHint = hasSearch
    ? 'Try a different search term.'
    : 'Check back later for new titles.';

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

                activePurchase={purchasesByBookId?.[book.id]}

                atBorrowLimit={atBorrowLimit}

                requestingId={requestingId}

                buyingId={buyingId}

                onRequest={onRequest}

                onBuy={onBuy}

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


