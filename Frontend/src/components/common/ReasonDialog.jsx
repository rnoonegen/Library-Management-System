import { useEffect, useState } from 'react';
import Button from 'components/common/Button';

export default function ReasonDialog({
  open,
  title,
  message,
  reasonLabel = 'Reason',
  placeholder = 'Enter a reason (optional)',
  required = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = reason.trim();
    if (required && !trimmed) {
      setError('Please enter a reason.');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div
        className="modal reason-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reason-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h2 id="reason-dialog-title">{title}</h2>
            {message && <p className="modal-subtitle">{message}</p>}
          </div>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reason-dialog-input">{reasonLabel}</label>
            <textarea
              id="reason-dialog-input"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={placeholder}
              disabled={loading}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="dialog-actions">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Please wait...' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
