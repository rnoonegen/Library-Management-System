import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Modal, { useModal } from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';

const PAGE_SIZE = 12;

function openDatePicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ignore browsers/contexts that block programmatic picker opening.
  }
}

const datePickerProps = {
  inputMode: 'none',
  onKeyDown: (e) => e.preventDefault(),
  onClick: openDatePicker,
};

const emptyBook = {
  isbn: '',
  title: '',
  publisher: '',
  author: '',
  qty: 1,
  price: '',
  subject: '',
  abstract: '',
  date_of_publication: '',
  grade_level: '',
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadBooks = (pageNum = page, searchTerm = search) => {
    setLoading(true);
    const params = { page: pageNum, limit: PAGE_SIZE };
    const trimmed = searchTerm.trim();
    if (trimmed) params.search = trimmed;

    api
      .getBooks(params)
      .then((result) => {
        setBooks(result.books);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        if (result.page !== page) setPage(result.page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    const trimmed = search.trim();
    if (trimmed) params.search = trimmed;

    api
      .getBooks(params)
      .then((result) => {
        setBooks(result.books);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const openCreate = () => {
    setForm(emptyBook);
    setEditingId(null);
    modal.open();
  };

  const openEdit = (book) => {
    setForm({
      isbn: book.isbn || '',
      title: book.title,
      publisher: book.publisher || '',
      author: book.author,
      qty: book.qty,
      price: book.price ?? '',
      subject: book.subject || '',
      abstract: book.abstract || '',
      date_of_publication: book.date_of_publication
        ? String(book.date_of_publication).slice(0, 10)
        : '',
      grade_level: book.grade_level || '',
    });
    setEditingId(book.id);
    modal.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        qty: parseInt(form.qty, 10),
        price: form.price === '' ? null : form.price,
        subject: form.subject || null,
        abstract: form.abstract || null,
        date_of_publication: form.date_of_publication || null,
        grade_level: form.grade_level || null,
      };
      if (editingId) {
        await api.updateBook(editingId, payload);
      } else {
        await api.createBook(payload);
      }
      modal.close();
      if (editingId) loadBooks(page);
      else setPage(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.deleteBook(id);
      const nextPage = books.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else loadBooks(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const fmt = (val) => (val == null || val === '' ? '—' : val);
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <div className="page books-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="books-toolbar">
        <SearchBar
          className="books-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search books by title..."
        />
        {!loading && total > 0 && (
          <span className="books-summary">
            Showing {start}–{end} of {total} books
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">
            📚
          </div>
          <strong>{search.trim() ? 'No books found' : 'No books yet'}</strong>
          <p>
            {search.trim()
              ? 'Try a different search term or clear the filter.'
              : 'Add your first book to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <article key={book.id} className="book-card">
                <div className="book-card-top">
                  <h3 className="book-card-title">{book.title}</h3>
                  <span className={book.qty > 0 ? 'badge badge-success' : 'badge badge-danger'}>
                    {book.qty > 0 ? `${book.qty} in stock` : 'Out of stock'}
                  </span>
                </div>

                <dl className="book-card-details">
                  <div className="book-detail">
                    <dt>ISBN</dt>
                    <dd>{book.isbn}</dd>
                  </div>
                  <div className="book-detail">
                    <dt>Author</dt>
                    <dd>{book.author}</dd>
                  </div>
                  <div className="book-detail">
                    <dt>Publisher</dt>
                    <dd>{fmt(book.publisher)}</dd>
                  </div>
                  <div className="book-detail">
                    <dt>Price</dt>
                    <dd>{book.price != null ? `₹${book.price}` : '—'}</dd>
                  </div>
                  <div className="book-detail">
                    <dt>Subject</dt>
                    <dd>{fmt(book.subject)}</dd>
                  </div>
                  <div className="book-detail">
                    <dt>Grade</dt>
                    <dd>{fmt(book.grade_level)}</dd>
                  </div>
                </dl>

                <div className="book-card-actions">
                  <button className="btn-secondary" onClick={() => openEdit(book)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(book.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="books-pagination" aria-label="Books pagination">
                <button
                  type="button"
                  className="btn-secondary pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {startPage > 1 && (
                    <>
                      <button type="button" className="pagination-page" onClick={() => setPage(1)}>
                        1
                      </button>
                      {startPage > 2 && <span className="pagination-ellipsis">…</span>}
                    </>
                  )}
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`pagination-page ${n === page ? 'active' : ''}`}
                      onClick={() => setPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  ))}
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
                      <button
                        type="button"
                        className="pagination-page"
                        onClick={() => setPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-secondary pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </nav>
          )}
        </>
      )}

      {modal.isOpen && (
        <Modal title={editingId ? 'Edit Book' : 'Add Book'} onClose={modal.close}>
          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-row">
              <div className="form-group">
                <label>ISBN *</label>
                <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Qty</label>
                <input
                  type="number"
                  min="0"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Author *</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Grade Level</label>
                <input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Abstract</label>
              <textarea
                rows={3}
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Date of Publication</label>
              <input
                type="date"
                value={form.date_of_publication}
                onChange={(e) => setForm({ ...form, date_of_publication: e.target.value })}
                {...datePickerProps}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={modal.close}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Add Book'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <button
        type="button"
        className="books-fab"
        onClick={openCreate}
        aria-label="Add book"
      >
        <span className="books-fab-icon" aria-hidden="true">
          +
        </span>
        <span className="books-fab-label">Add Book</span>
      </button>
    </div>
  );
}
