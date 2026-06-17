import Button from 'components/common/Button';
import SearchBar from 'components/common/SearchBar';

export default function UserBooksContent({
  books,
  search,
  loading,
  requestingId,
  onSearchChange,
  onRequest,
}) {
  return (
    <>
      <div className="toolbar">
        <SearchBar value={search} onChange={onSearchChange} placeholder="Search books..." />
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : (
        <div className="card-grid">
          {books.map((book) => (
            <article key={book.id} className="data-card">
              <h3>{book.title}</h3>
              <p className="text-muted">{book.author || 'Unknown author'}</p>
              <p>Available: {book.qty}</p>
              <Button
                variant="primary"
                disabled={book.qty < 1 || requestingId === book.id}
                onClick={() => onRequest(book.id)}
              >
                {book.qty < 1 ? 'Unavailable' : requestingId === book.id ? 'Requesting...' : 'Request Book'}
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

