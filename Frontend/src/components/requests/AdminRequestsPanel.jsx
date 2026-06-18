import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';
import { formatDateOnly } from 'utils/formatDate';

export default function AdminRequestsPanel({
  tab,
  queueSummary,
  borrowRequests,
  extensionRequests,
  loading,
  onTabChange,
  onReviewBorrow,
  onReviewExtension,
}) {
  return (
    <>
      <div className="tab-bar">
        <button type="button" className={tab === 'summary' ? 'tab active' : 'tab'} onClick={() => onTabChange('summary')}>
          Queue overview ({queueSummary.length})
        </button>
        <button type="button" className={tab === 'ready' ? 'tab active' : 'tab'} onClick={() => onTabChange('ready')}>
          Ready for pickup ({borrowRequests.filter((r) => r.status === 'ready').length})
        </button>
        <button type="button" className={tab === 'extension' ? 'tab active' : 'tab'} onClick={() => onTabChange('extension')}>
          Extensions ({extensionRequests.length})
        </button>
      </div>

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
          borrowRequests.filter((r) => r.status === 'ready').length === 0 ? (
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
        ) : extensionRequests.length === 0 ? (
          <p className="text-muted">No pending extension requests.</p>
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
