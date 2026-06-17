import { useEffect, useState } from 'react';
import { api } from 'services/api';
import { useModal } from 'components/common/Modal';
import UserBorrowsContent from 'components/users/UserBorrowsContent';
import UserExtensionModal from 'components/users/UserExtensionModal';

export default function UserBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [reason, setReason] = useState('');
  const modal = useModal();

  const load = () => {
    setLoading(true);
    api
      .getMyBorrows()
      .then(setBorrows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  function openExtension(borrow) {
    setSelected(borrow);
    setDueDate('');
    setReason('');
    modal.open();
  }

  async function submitExtension(e) {
    e.preventDefault();
    try {
      await api.submitExtensionRequest({
        borrow_id: selected.id,
        requested_due_date: dueDate,
        reason,
      });
      modal.close();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="loading">Loading borrows...</div>;

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}

      <UserBorrowsContent borrows={borrows} onOpenExtension={openExtension} />

      <UserExtensionModal
        isOpen={modal.isOpen}
        selected={selected}
        dueDate={dueDate}
        reason={reason}
        onClose={modal.close}
        onSubmit={submitExtension}
        onDueDateChange={setDueDate}
        onReasonChange={setReason}
      />
    </div>
  );
}


