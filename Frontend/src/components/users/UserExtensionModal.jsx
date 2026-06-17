import Modal from 'components/common/Modal';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

export default function UserExtensionModal({
  isOpen,
  selected,
  dueDate,
  reason,
  onClose,
  onSubmit,
  onDueDateChange,
  onReasonChange,
}) {
  if (!isOpen || !selected) return null;

  return (
    <Modal title="Request Extension" onClose={onClose}>
      <form onSubmit={onSubmit}>
        <p className="text-muted">Current due: {selected.due_date?.split('T')[0]}</p>
        <FormField
          id="dueDate"
          label="New due date"
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          required
        />
        <FormField
          id="reason"
          label="Reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Submit</Button>
        </div>
      </form>
    </Modal>
  );
}

