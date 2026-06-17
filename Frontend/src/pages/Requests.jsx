import { useEffect, useState } from 'react';
import { api } from 'services/api';
import AdminRequestsPanel from 'components/requests/AdminRequestsPanel';

export default function Requests() {
  const [tab, setTab] = useState('borrow');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.getBorrowRequests('pending'), api.getExtensionRequests('pending')])
      .then(([borrows, extensions]) => {
        setBorrowRequests(borrows);
        setExtensionRequests(extensions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function reviewBorrow(id, action) {
    const adminNote = action === 'reject' ? prompt('Rejection reason (optional):') : '';
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

      <AdminRequestsPanel
        tab={tab}
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

