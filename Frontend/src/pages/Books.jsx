import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal, { useModal } from '../components/Modal';

const emptyBook = {
  isbn: '',
  title: '',
  publisher: '',
  author: '',
  qty: 1,
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
      isbn: book.isbn || '',
      title: book.title,
      publisher: book.publisher || '',
      author: book.author,
      qty: book.qty,
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
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Publisher</th>
                  <th>Author</th>
                  <th>Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.isbn}</td>
                    <td>{book.title}</td>
                    <td>{book.publisher || '—'}</td>
                    <td>{book.author}</td>
                    <td>
                      <span className={book.qty > 0 ? 'badge badge-success' : 'badge badge-danger'}>
                        {book.qty}
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
              <label>ISBN *</label>
              <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Publisher</label>
              <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
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
