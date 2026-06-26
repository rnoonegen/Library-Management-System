import Modal from 'components/common/Modal';
import { BOOK_LANGUAGES, BOOK_SUBJECTS, BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';

export default function BookFormModal({
  isOpen,
  editingId,
  form,
  datePickerProps,
  maxPublicationDate,
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
              min={editingId ? 0 : 1}
              step="1"
              value={form.qty}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setForm({ ...form, qty: '' });
                  return;
                }
                const parsed = parseInt(raw, 10);
                const floor = editingId ? 0 : 1;
                setForm({
                  ...form,
                  qty: Number.isNaN(parsed) ? floor : Math.max(floor, parsed),
                });
              }}
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
            <label>Book Type *</label>
            <select
              value={form.book_type}
              onChange={(e) => setForm({ ...form, book_type: e.target.value })}
              required
            >
              <option value={BOOK_TYPES.borrow}>{BOOK_TYPE_LABELS.borrow} — can be taken home</option>
              <option value={BOOK_TYPES.reference}>{BOOK_TYPE_LABELS.reference} — in-library reading only</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grade Level</label>
            <input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} />
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
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Select subject</option>
              {form.subject && !BOOK_SUBJECTS.includes(form.subject) && (
                <option value={form.subject}>{form.subject}</option>
              )}
              {BOOK_SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="">Select language</option>
              {form.language && !BOOK_LANGUAGES.includes(form.language) && (
                <option value={form.language}>{form.language}</option>
              )}
              {BOOK_LANGUAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
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
            max={maxPublicationDate}
            value={form.date_of_publication}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || value <= maxPublicationDate) {
                setForm({ ...form, date_of_publication: value });
              }
            }}
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
