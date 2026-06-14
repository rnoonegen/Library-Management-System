import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal, { useModal } from '../components/Modal';

const emptyBook = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  total_copies: 1,
  published_year: '',
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadBooks = () => {
    setLoading(true);
    api
      .getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const openCreate = () => {
    setForm(emptyBook);
    setEditingId(null);
    modal.open();
  };

  const openEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category || '',
      total_copies: book.total_copies,
      published_year: book.published_year || '',
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
        total_copies: parseInt(form.total_copies, 10),
        published_year: form.published_year ? parseInt(form.published_year, 10) : null,
      };
      if (editingId) {
        await api.updateBook(editingId, payload);
      } else {
        await api.createBook(payload);
      }
      modal.close();
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.deleteBook(id);
      loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Books</h2>
          <p>Manage your book catalog</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Book
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="data-card">
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">No books yet. Add your first book.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn || '—'}</td>
                    <td>{book.category || '—'}</td>
                    <td>{book.total_copies}</td>
                    <td>
                      <span className={book.available_copies > 0 ? 'badge badge-success' : 'badge badge-danger'}>
                        {book.available_copies}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-secondary" onClick={() => openEdit(book)}>
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(book.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <Modal title={editingId ? 'Edit Book' : 'Add Book'} onClose={modal.close}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ISBN</label>
                <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={form.total_copies}
                  onChange={(e) => setForm({ ...form, total_copies: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Published Year</label>
                <input
                  type="number"
                  value={form.published_year}
                  onChange={(e) => setForm({ ...form, published_year: e.target.value })}
                />
              </div>
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
    </div>
  );
}
