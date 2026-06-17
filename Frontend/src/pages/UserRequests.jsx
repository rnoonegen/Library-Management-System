import { useEffect, useState } from 'react';
import { api } from 'services/api';
import UserRequestsPanel from 'components/requests/UserRequestsPanel';

export default function UserRequests() {
  const [tab, setTab] = useState('borrow');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyBorrowRequests(), api.getMyExtensionRequests()])
      .then(([borrows, extensions]) => {
        setBorrowRequests(borrows);
        setExtensionRequests(extensions);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}
      <UserRequestsPanel
        tab={tab}
        borrowRequests={borrowRequests}
        extensionRequests={extensionRequests}
        loading={loading}
        onTabChange={setTab}
      />
    </div>
  );
}


