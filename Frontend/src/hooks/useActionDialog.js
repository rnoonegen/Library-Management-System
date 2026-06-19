import { useCallback, useRef, useState } from 'react';
import ConfirmDialog from 'components/common/ConfirmDialog';
import ReasonDialog from 'components/common/ReasonDialog';

export function useActionDialog() {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback(() => {
    setDialog(null);
    resolverRef.current = null;
  }, []);

  const askConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ type: 'confirm', ...options });
    });
  }, []);

  const askReason = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ type: 'reason', ...options });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    close();
  }, [close]);

  const handleConfirmCancel = useCallback(() => {
    resolverRef.current?.(false);
    close();
  }, [close]);

  const handleReasonSubmit = useCallback((reason) => {
    resolverRef.current?.(reason);
    close();
  }, [close]);

  const handleReasonCancel = useCallback(() => {
    resolverRef.current?.(null);
    close();
  }, [close]);

  function ActionDialog() {
    if (!dialog) return null;

    if (dialog.type === 'confirm') {
      return (
        <ConfirmDialog
          open
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          variant={dialog.variant}
          loading={dialog.loading}
          onConfirm={handleConfirm}
          onCancel={handleConfirmCancel}
        />
      );
    }

    return (
      <ReasonDialog
        open
        title={dialog.title}
        message={dialog.message}
        reasonLabel={dialog.reasonLabel}
        placeholder={dialog.placeholder}
        required={dialog.required}
        submitLabel={dialog.submitLabel}
        cancelLabel={dialog.cancelLabel}
        loading={dialog.loading}
        onSubmit={handleReasonSubmit}
        onCancel={handleReasonCancel}
      />
    );
  }

  return { askConfirm, askReason, ActionDialog };
}
