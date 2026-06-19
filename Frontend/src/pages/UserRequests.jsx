import { useEffect, useState } from 'react';
import { api } from 'services/api';
import UserRequestsPanel from 'components/requests/UserRequestsPanel';
import { useActionDialog } from 'hooks/useActionDialog';
import { filterByBookTitle, paginateItems } from 'utils/pagination';

export default function UserRequests() {
  const [tab, setTab] = useState('borrow');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [borrowSearch, setBorrowSearch] = useState('');
  const [extensionSearch, setExtensionSearch] = useState('');
  const [borrowPage, setBorrowPage] = useState(1);
  const [extensionPage, setExtensionPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { askConfirm, ActionDialog } = useActionDialog();

  const load = () => {
    setLoading(true);
    Promise.all([api.getMyBorrowRequests(), api.getMyExtensionRequests()])
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

  const filteredBorrowRequests = filterByBookTitle(borrowRequests, borrowSearch);
  const filteredExtensionRequests = filterByBookTitle(extensionRequests, extensionSearch);
  const borrowPagination = paginateItems(filteredBorrowRequests, borrowPage);
  const extensionPagination = paginateItems(filteredExtensionRequests, extensionPage);

  useEffect(() => {
    if (borrowPage !== borrowPagination.page) setBorrowPage(borrowPagination.page);
  }, [borrowPage, borrowPagination.page]);

  useEffect(() => {
    if (extensionPage !== extensionPagination.page) setExtensionPage(extensionPagination.page);
  }, [extensionPage, extensionPagination.page]);

  function handleTabChange(nextTab) {
    setTab(nextTab);
  }

  function handleBorrowSearchChange(value) {
    setBorrowSearch(value);
    setBorrowPage(1);
  }

  function handleExtensionSearchChange(value) {
    setExtensionSearch(value);
    setExtensionPage(1);
  }

  async function cancelHold(id) {
    const confirmed = await askConfirm({
      title: 'Cancel waitlist entry',
      message: 'Are you sure you want to cancel this waitlist entry?',
      confirmLabel: 'Cancel entry',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.cancelBorrowRequest(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}
      <UserRequestsPanel
        tab={tab}
        borrowRequests={borrowPagination.items}
        extensionRequests={extensionPagination.items}
        loading={loading}
        borrowSearch={borrowSearch}
        extensionSearch={extensionSearch}
        borrowPagination={borrowPagination}
        extensionPagination={extensionPagination}
        borrowTotalAll={borrowRequests.length}
        extensionTotalAll={extensionRequests.length}
        onTabChange={handleTabChange}
        onBorrowSearchChange={handleBorrowSearchChange}
        onExtensionSearchChange={handleExtensionSearchChange}
        onCancelHold={cancelHold}
        onBorrowPageChange={setBorrowPage}
        onExtensionPageChange={setExtensionPage}
      />
      <ActionDialog />
    </div>
  );
}
