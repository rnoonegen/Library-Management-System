import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal, { useModal } from '../components/Modal';

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

const emptyBorrow = {
  book_id: '',
  member_id: '',
  borrow_date: new Date().toISOString().split('T')[0],
  due_date: addDays(new Date().toISOString().split('T')[0], 14),
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyBorrow);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getTransactions(), api.getBooks(), api.getMembers()])
      .then(([txns, bookList, memberList]) => {
        setTransactions(txns);
        setBooks(bookList);
        setMembers(memberList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.borrowBook({
        ...form,
        book_id: parseInt(form.book_id, 10),
        member_id: parseInt(form.member_id, 10),
      });
      modal.close();
      setForm({
        ...emptyBorrow,
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: addDays(new Date().toISOString().split('T')[0], 14),
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.returnBook(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    const map = {
      borrowed: 'badge-info',
      returned: 'badge-success',
      overdue: 'badge-danger',
    };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const availableBooks = books.filter((b) => b.qty > 0);
  const activeMembers = members.filter((m) => m.status === 'active');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Borrow / Return</h2>
          <p>Track book loans and returns</p>
        </div>
        <button className="btn-primary" onClick={modal.open}>
          + Borrow Book
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="data-card">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">No transactions yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrowed</th>
                  <th>Due</th>
                  <th>Returned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.book_title}</td>
                    <td>{txn.member_name}</td>
                    <td>{txn.borrow_date?.split('T')[0] || txn.borrow_date}</td>
                    <td>{txn.due_date?.split('T')[0] || txn.due_date}</td>
                    <td>{txn.return_date?.split('T')[0] || txn.return_date || '—'}</td>
                    <td>{statusBadge(txn.status)}</td>
                    <td>
                      {txn.status !== 'returned' && (
                        <button className="btn-success" onClick={() => handleReturn(txn.id)}>
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <Modal title="Borrow Book" onClose={modal.close}>
          <form onSubmit={handleBorrow}>
            <div className="form-group">
              <label>Book *</label>
              <select
                value={form.book_id}
                onChange={(e) => setForm({ ...form, book_id: e.target.value })}
                required
              >
                <option value="">Select a book</option>
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.qty} available)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Member *</label>
              <select
                value={form.member_id}
                onChange={(e) => setForm({ ...form, member_id: e.target.value })}
                required
              >
                <option value="">Select a member</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Borrow Date *</label>
                <input
                  type="date"
                  value={form.borrow_date}
                  onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={modal.close}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Borrow
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
