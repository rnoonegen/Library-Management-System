import Button from 'components/common/Button';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div
        className="modal confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h2 id="confirm-dialog-title">{title}</h2>
            {message && <p className="modal-subtitle">{message}</p>}
          </div>
        </div>
        <div className="modal-body">
          <div className="dialog-actions">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Please wait...' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
