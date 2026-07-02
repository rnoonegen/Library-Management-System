import Modal from 'components/common/Modal';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

export default function UserExtensionModal({
  isOpen,
  selected,
  reason,
  submitting,
  onClose,
  onSubmit,
  onReasonChange,
}) {
  if (!isOpen || !selected) return null;

  const currentDue = selected.due_date?.split('T')[0];
  const newDue = selected.extended_due_date?.split('T')[0];

  return (
    <Modal title="Request Renewal" onClose={onClose}>
      <form onSubmit={onSubmit}>
        <p className="text-muted" style={{ marginTop: 0 }}>
          Renewals add <strong>14 days</strong> to your current due date (once per calendar month, any book).
        </p>
        <div className="renewal-summary">
          <p><strong>Book:</strong> {selected.book_title}</p>
          <p><strong>Current due:</strong> {currentDue}</p>
          <p className="book-status-owned"><strong>New due date:</strong> {newDue}</p>
        </div>
        <FormField
          id="reason"
          label="Reason (optional)"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Request renewal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
