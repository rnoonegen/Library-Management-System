import { useEffect, useState } from 'react';
import { api } from 'services/api';
import UserBooksContent from 'components/users/UserBooksContent';
import { useActionDialog } from 'hooks/useActionDialog';
import { PAGE_SIZE, buildPageNumbers } from 'utils/pagination';

function parseBorrowsForBooks(data) {
  if (Array.isArray(data)) {
    const active = data.filter((b) => b.status !== 'returned');
    return {
      borrows: data,
      atBorrowLimit: active.length >= 3,
    };
  }
  return {
    borrows: data.borrows ?? [],
    atBorrowLimit: data.atBorrowLimit ?? false,
  };
}

export default function UserBooks() {
  const [books, setBooks] = useState([]);
  const [borrowedBookIds, setBorrowedBookIds] = useState(new Set());
  const [holdsByBookId, setHoldsByBookId] = useState({});
  const [atBorrowLimit, setAtBorrowLimit] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const { askConfirm, ActionDialog } = useActionDialog();

  const loadUserContext = () =>
    Promise.all([api.getMyBorrows(), api.getMyBorrowRequests()]).then(
      ([borrowsData, holds]) => {
        const { borrows, atBorrowLimit: atLimit } = parseBorrowsForBooks(borrowsData);
        const borrowed = new Set(
          borrows.filter((b) => b.status !== 'returned').map((b) => b.book_id),
        );
        setBorrowedBookIds(borrowed);
        setAtBorrowLimit(atLimit);
        const activeHolds = {};
        holds
          .filter((h) => h.status === 'pending' || h.status === 'ready')
          .forEach((h) => {
            activeHolds[h.book_id] = h;
          });
        setHoldsByBookId(activeHolds);
      },
    );

  const loadBooks = (pageNum = page, searchTerm = search) => {
    setLoading(true);
    const params = { page: pageNum, limit: PAGE_SIZE };
    const trimmed = searchTerm.trim();
    if (trimmed) params.search = trimmed;

    Promise.all([api.getBooks(params), loadUserContext()])
      .then(([booksRes]) => {
        setBooks(booksRes.books ?? []);
        setTotal(booksRes.total ?? 0);
        setTotalPages(booksRes.totalPages ?? 1);
        if (booksRes.page && booksRes.page !== page) setPage(booksRes.page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks(page, search);
  }, [page, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  async function handleRequest(bookId, bookTitle) {
    setError('');
    const confirmed = await askConfirm({
      title: 'Join waitlist',
      message: bookTitle
        ? `Join the waitlist for "${bookTitle}"? You will be notified when a copy is ready for pickup.`
        : 'Join the waitlist for this book? You will be notified when a copy is ready for pickup.',
      confirmLabel: 'Join waitlist',
      variant: 'primary',
    });
    if (!confirmed) return;

    setRequestingId(bookId);
    try {
      await api.submitBorrowRequest(bookId);
      loadBooks(page, search);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  const { startPage, endPage, pageNumbers } = buildPageNumbers(page, totalPages);

  return (
    <div className="page books-page">
      {error && <div className="error-banner">{error}</div>}
      <UserBooksContent
        books={books}
        search={search}
        loading={loading}
        total={total}
        start={start}
        end={end}
        page={page}
        totalPages={totalPages}
        startPage={startPage}
        endPage={endPage}
        pageNumbers={pageNumbers}
        requestingId={requestingId}
        borrowedBookIds={borrowedBookIds}
        holdsByBookId={holdsByBookId}
        atBorrowLimit={atBorrowLimit}
        onSearchChange={handleSearchChange}
        onPageChange={setPage}
        onRequest={handleRequest}
      />
      <ActionDialog />
    </div>
  );
}
