import { useEffect, useState } from 'react';
import { api } from 'services/api';
import AdminRequestsPanel from 'components/requests/AdminRequestsPanel';

export default function Requests() {
  const [tab, setTab] = useState('summary');
  const [queueSummary, setQueueSummary] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getHoldQueueSummary(),
      api.getBorrowRequests('active'),
      api.getExtensionRequests('pending'),
    ])
      .then(([summary, borrows, extensions]) => {
        setQueueSummary(summary);
        setBorrowRequests(borrows);
        setExtensionRequests(extensions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function reviewBorrow(id, action) {
    const label = action === 'fulfill'
      ? 'Mark this book as collected and issue to the user?'
      : 'Cancel this hold? The user will be notified to join the waitlist again, and the next person in queue will be promoted.';
    if (!confirm(label)) return;
    const adminNote = action === 'cancel' ? prompt('Note (optional):') : '';
    try {
      await api.reviewBorrowRequest(id, { action, adminNote: adminNote || undefined });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function reviewExtension(id, action) {
    const adminNote = action === 'reject' ? prompt('Rejection reason (optional):') : '';
    try {
      await api.reviewExtensionRequest(id, { action, adminNote: adminNote || undefined });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}

      <div className="rules-banner">
        <p>
          Waitlists join automatically. When a book is returned, the next user is notified with a 3-day
          collect-by date. If they do not come, use <strong>Cancel</strong> on Ready for pickup — the
          next person in queue is notified automatically.
        </p>
      </div>

      <AdminRequestsPanel
        tab={tab}
        queueSummary={queueSummary}
        borrowRequests={borrowRequests}
        extensionRequests={extensionRequests}
        loading={loading}
        onTabChange={setTab}
        onReviewBorrow={reviewBorrow}
        onReviewExtension={reviewExtension}
      />
    </div>
  );
}
