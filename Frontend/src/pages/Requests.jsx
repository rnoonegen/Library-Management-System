import { useEffect, useState } from 'react';
import { api } from 'services/api';
import AdminRequestsPanel from 'components/requests/AdminRequestsPanel';
import { useActionDialog } from 'hooks/useActionDialog';
import { PICKUP_DAYS } from 'constants/libraryRules';

export default function Requests() {
  const [tab, setTab] = useState('summary');
  const [queueSummary, setQueueSummary] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { askConfirm, askReason, ActionDialog } = useActionDialog();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getHoldQueueSummary(),
      api.getBorrowRequests({ status: 'active', limit: 100 }),
      api.getExtensionRequests({ status: 'pending', limit: 100 }),
      api.getPurchaseOrders({ status: 'active', limit: 100 }),
    ])
      .then(([summary, borrowResult, extensionResult, purchaseResult]) => {
        setQueueSummary(summary);
        setBorrowRequests(borrowResult.requests || borrowResult);
        setExtensionRequests(extensionResult.requests || extensionResult);
        setPurchaseOrders(purchaseResult.orders || purchaseResult);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function reviewBorrow(id, action) {
    setError('');
    try {
      if (action === 'fulfill') {
        const confirmed = await askConfirm({
          title: 'Mark as collected',
          message: 'Mark this book as collected and issue it to the user?',
          confirmLabel: 'Mark collected',
          variant: 'primary',
        });
        if (!confirmed) return;
        await api.reviewBorrowRequest(id, { action });
      } else {
        const adminNote = await askReason({
          title: 'Cancel hold',
          message:
            'The user will be notified to join the waitlist again, and the next person in queue will be promoted.',
          reasonLabel: 'Reason for cancellation',
          placeholder: 'Enter a reason (optional)',
          submitLabel: 'Submit',
        });
        if (adminNote === null) return;
        await api.reviewBorrowRequest(id, {
          action,
          adminNote: adminNote || undefined,
        });
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function reviewExtension(id, action) {
    setError('');
    try {
      if (action === 'approve') {
        const confirmed = await askConfirm({
          title: 'Approve extension',
          message: 'Extend the due date for this borrow as requested?',
          confirmLabel: 'Approve',
          variant: 'primary',
        });
        if (!confirmed) return;
        await api.reviewExtensionRequest(id, { action });
      } else {
        const adminNote = await askReason({
          title: 'Reject extension',
          message: 'The user will be notified that their extension request was denied.',
          reasonLabel: 'Rejection reason',
          placeholder: 'Enter a reason (optional)',
          submitLabel: 'Submit',
        });
        if (adminNote === null) return;
        await api.reviewExtensionRequest(id, {
          action,
          adminNote: adminNote || undefined,
        });
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function reviewPurchase(id, action) {
    setError('');
    try {
      if (action === 'ready') {
        const confirmed = await askConfirm({
          title: 'Mark order ready',
          message: 'Notify the user that the book is ready for pickup and payment at the library?',
          confirmLabel: 'Mark ready',
          variant: 'primary',
        });
        if (!confirmed) return;
        await api.reviewPurchaseOrder(id, { action });
      } else if (action === 'paid') {
        const confirmed = await askConfirm({
          title: 'Record payment',
          message: 'Confirm that the user has paid and collected the book?',
          confirmLabel: 'Mark paid',
          variant: 'primary',
        });
        if (!confirmed) return;
        await api.reviewPurchaseOrder(id, { action });
      } else {
        const adminNote = await askReason({
          title: 'Cancel purchase order',
          message: 'The user will be notified and the book copy will be returned to stock.',
          reasonLabel: 'Reason for cancellation',
          placeholder: 'Enter a reason (optional)',
          submitLabel: 'Submit',
        });
        if (adminNote === null) return;
        await api.reviewPurchaseOrder(id, {
          action,
          adminNote: adminNote || undefined,
        });
      }
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
          Waitlists join automatically. When a book is returned, the next user is notified with a {PICKUP_DAYS}-day
          collect-by date. Purchase orders: mark <strong>ready</strong> when prepared, then <strong>paid</strong> when
          the user pays and collects at the library.
        </p>
      </div>

      <AdminRequestsPanel
        tab={tab}
        queueSummary={queueSummary}
        borrowRequests={borrowRequests}
        extensionRequests={extensionRequests}
        purchaseOrders={purchaseOrders}
        loading={loading}
        onTabChange={setTab}
        onReviewBorrow={reviewBorrow}
        onReviewExtension={reviewExtension}
        onReviewPurchase={reviewPurchase}
      />
      <ActionDialog />
    </div>
  );
}
