import { useEffect, useState } from 'react';
import { api } from 'services/api';
import UserBooksContent from 'components/users/UserBooksContent';

export default function UserBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    api
      .getBooks({ limit: 100 })
      .then((res) => setBooks(res.books ?? res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const list = Array.isArray(books) ? books : [];
  const term = search.trim().toLowerCase();
  const filtered = term
    ? list.filter((b) => b.title?.toLowerCase().includes(term))
    : list;

  async function handleRequest(bookId) {
    setError('');
    setRequestingId(bookId);
    try {
      await api.submitBorrowRequest(bookId);
      alert('Request submitted. Admin will review it.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}
      <UserBooksContent
        books={filtered}
        search={search}
        loading={loading}
        requestingId={requestingId}
        onSearchChange={setSearch}
        onRequest={handleRequest}
      />
    </div>
  );
}


