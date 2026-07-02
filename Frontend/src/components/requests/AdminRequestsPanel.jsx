import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';
import PageTabs from 'components/common/PageTabs';
import { formatDateOnly } from 'utils/formatDate';

export default function AdminRequestsPanel({
  tab,
  queueSummary,
  borrowRequests,
  extensionRequests,
  purchaseOrders,
  loading,
  onTabChange,
  onReviewBorrow,
  onReviewExtension,
  onReviewPurchase,
}) {
  const readyBorrowCount = borrowRequests.filter((r) => r.status === 'ready').length;
  const activePurchaseCount = purchaseOrders.length;

  return (
    <>
      <PageTabs
        tabs={[
          { id: 'summary', label: 'Queue overview', count: queueSummary.length },
          { id: 'ready', label: 'Ready for pickup', count: readyBorrowCount },
          { id: 'purchase', label: 'Purchase orders', count: activePurchaseCount },
          { id: 'renewal', label: 'Renewal', count: extensionRequests.length },
        ]}
        activeId={tab}
        onChange={onTabChange}
        ariaLabel="Request queues"
      />

      <div className="tab-panel">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : tab === 'summary' ? (
          queueSummary.length === 0 ? (
            <p className="text-muted">No books with active waitlists right now.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Available</th>
                    <th>Waiting</th>
                    <th>Ready</th>
                    <th>Current borrower</th>
                    <th>Due date</th>
                  </tr>
                </thead>
                <tbody>
                  {queueSummary.map((row) => (
                    <tr key={row.book_id}>
                      <td>{row.book_title}</td>
                      <td>{row.available_qty}</td>
                      <td><strong>{row.pending_count}</strong></td>
                      <td>{row.ready_count}</td>
                      <td>{row.current_borrower_name || '—'}</td>
                      <td>{formatDateOnly(row.current_borrower_due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : tab === 'ready' ? (
          readyBorrowCount === 0 ? (
            <p className="text-muted">No books ready for pickup right now.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Collect by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowRequests.filter((r) => r.status === 'ready').map((row) => (
                    <tr key={row.id}>
                      <td>{row.user_name} ({row.user_username})</td>
                      <td>{row.book_title}</td>
                      <td>{formatDateOnly(row.collect_by)}</td>
                      <td className="table-actions">
                        <Button variant="primary" onClick={() => onReviewBorrow(row.id, 'fulfill')}>
                          Mark collected
                        </Button>
                        <Button variant="danger" onClick={() => onReviewBorrow(row.id, 'cancel')}>
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : tab === 'purchase' ? (
          activePurchaseCount === 0 ? (
            <p className="text-muted">No active purchase orders right now.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Ordered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((row) => (
                    <tr key={row.id}>
                      <td>{row.user_name} ({row.user_username})</td>
                      <td>{row.book_title}</td>
                      <td>{row.amount != null ? `₹${row.amount}` : '—'}</td>
                      <td><StatusBadge status={row.status} /></td>
                      <td>{formatDateOnly(row.created_at)}</td>
                      <td className="table-actions">
                        {row.status === 'pending' && (
                          <Button variant="primary" onClick={() => onReviewPurchase(row.id, 'ready')}>
                            Mark ready
                          </Button>
                        )}
                        {row.status === 'ready' && (
                          <Button variant="primary" onClick={() => onReviewPurchase(row.id, 'paid')}>
                            Mark paid
                          </Button>
                        )}
                        {(row.status === 'pending' || row.status === 'ready') && (
                          <Button variant="danger" onClick={() => onReviewPurchase(row.id, 'cancel')}>
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : extensionRequests.length === 0 ? (
          <p className="text-muted">No pending renewal requests.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Current due</th>
                  <th>Requested due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {extensionRequests.map((row) => (
                  <tr key={row.id}>
                    <td>{row.user_name}</td>
                    <td>{row.book_title}</td>
                    <td>{formatDateOnly(row.current_due_date)}</td>
                    <td>{formatDateOnly(row.requested_due_date)}</td>
                    <td className="table-actions">
                      <Button variant="primary" onClick={() => onReviewExtension(row.id, 'approve')}>Approve</Button>
                      <Button variant="danger" onClick={() => onReviewExtension(row.id, 'reject')}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
