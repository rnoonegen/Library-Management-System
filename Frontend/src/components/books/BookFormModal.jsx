import Modal from 'components/common/Modal';

export default function BookFormModal({
  isOpen,
  editingId,
  form,
  datePickerProps,
  onClose,
  onSubmit,
  setForm,
}) {
  if (!isOpen) return null;

  return (
    <Modal title={editingId ? 'Edit Book' : 'Add Book'} onClose={onClose}>
      <form onSubmit={onSubmit} className="book-form">
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
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editingId ? 'Save Changes' : 'Add Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

