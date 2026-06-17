import Modal from 'components/common/Modal';

export default function TransactionFormModal({
  isOpen,
  editingId,
  form,
  availableBooks,
  activeUsers,
  datePickerProps,
  onClose,
  onSubmit,
  setForm,
}) {
  if (!isOpen) return null;

  return (
    <Modal title={editingId ? 'Edit Loan' : 'Borrow Book'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        {editingId ? (
          <>
            <div className="form-group">
              <label>Book</label>
              <input value={form.book_title || ''} disabled />
            </div>
            <div className="form-group">
              <label>User</label>
              <input value={form.user_name || ''} disabled />
            </div>
          </>
        ) : (
          <>
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
              <label>User *</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                required
              >
                <option value="">Select a user</option>
                {activeUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="form-row">
          <div className="form-group">
            <label>Borrow Date *</label>
            <input
              type="date"
              value={form.borrow_date}
              onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}
              required
              {...datePickerProps}
            />
          </div>
          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
              {...datePickerProps}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Daily Fine Amount *</label>
          <select
            value={form.daily_fine_amount}
            onChange={(e) =>
              setForm({
                ...form,
                daily_fine_amount: parseInt(e.target.value, 10),
              })
            }
            required
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((amount) => (
              <option key={amount} value={amount}>
                ₹{amount} per day
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editingId ? 'Save Changes' : 'Borrow'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

