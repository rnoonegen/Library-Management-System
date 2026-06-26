import { useEffect, useState } from 'react';
import { api } from 'services/api';
import UserRequestsPanel from 'components/requests/UserRequestsPanel';
import { useActionDialog } from 'hooks/useActionDialog';
import { filterByBookTitle, paginateItems } from 'utils/pagination';

export default function UserRequests() {
  const [tab, setTab] = useState('borrow');
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [borrowSearch, setBorrowSearch] = useState('');
  const [extensionSearch, setExtensionSearch] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [borrowPage, setBorrowPage] = useState(1);
  const [extensionPage, setExtensionPage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { askConfirm, ActionDialog } = useActionDialog();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getMyBorrowRequests(),
      api.getMyExtensionRequests(),
      api.getMyPurchaseOrders(),
    ])
      .then(([borrows, extensions, purchases]) => {
        setBorrowRequests(borrows);
        setExtensionRequests(extensions);
        setPurchaseOrders(purchases);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredBorrowRequests = filterByBookTitle(borrowRequests, borrowSearch);
  const filteredExtensionRequests = filterByBookTitle(extensionRequests, extensionSearch);
  const filteredPurchaseOrders = filterByBookTitle(purchaseOrders, purchaseSearch);
  const borrowPagination = paginateItems(filteredBorrowRequests, borrowPage);
  const extensionPagination = paginateItems(filteredExtensionRequests, extensionPage);
  const purchasePagination = paginateItems(filteredPurchaseOrders, purchasePage);

  useEffect(() => {
    if (borrowPage !== borrowPagination.page) setBorrowPage(borrowPagination.page);
  }, [borrowPage, borrowPagination.page]);

  useEffect(() => {
    if (extensionPage !== extensionPagination.page) setExtensionPage(extensionPagination.page);
  }, [extensionPage, extensionPagination.page]);

  useEffect(() => {
    if (purchasePage !== purchasePagination.page) setPurchasePage(purchasePagination.page);
  }, [purchasePage, purchasePagination.page]);

  function handleTabChange(nextTab) {
    setTab(nextTab);
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

  async function cancelPurchase(id) {
    const confirmed = await askConfirm({
      title: 'Cancel purchase order',
      message: 'Are you sure you want to cancel this purchase order?',
      confirmLabel: 'Cancel order',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.cancelPurchaseOrder(id);
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
        purchaseOrders={purchasePagination.items}
        loading={loading}
        borrowSearch={borrowSearch}
        extensionSearch={extensionSearch}
        purchaseSearch={purchaseSearch}
        borrowPagination={borrowPagination}
        extensionPagination={extensionPagination}
        purchasePagination={purchasePagination}
        borrowTotalAll={borrowRequests.length}
        extensionTotalAll={extensionRequests.length}
        purchaseTotalAll={purchaseOrders.length}
        onTabChange={handleTabChange}
        onBorrowSearchChange={(value) => { setBorrowSearch(value); setBorrowPage(1); }}
        onExtensionSearchChange={(value) => { setExtensionSearch(value); setExtensionPage(1); }}
        onPurchaseSearchChange={(value) => { setPurchaseSearch(value); setPurchasePage(1); }}
        onCancelHold={cancelHold}
        onCancelPurchase={cancelPurchase}
        onBorrowPageChange={setBorrowPage}
        onExtensionPageChange={setExtensionPage}
        onPurchasePageChange={setPurchasePage}
      />
      <ActionDialog />
    </div>
  );
}
