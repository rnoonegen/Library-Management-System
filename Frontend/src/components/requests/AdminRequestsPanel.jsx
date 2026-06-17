import Button from 'components/common/Button';

export default function AdminRequestsPanel({
  tab,
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
        <button
          type="button"
          className={tab === 'borrow' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('borrow')}
        >
          Borrow ({borrowRequests.length})
        </button>
        <button
          type="button"
          className={tab === 'extension' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('extension')}
        >
          Extension ({extensionRequests.length})
        </button>
      </div>

      <div className="tab-panel">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : tab === 'borrow' ? (
          borrowRequests.length === 0 ? (
            <p className="text-muted">No pending borrow requests.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowRequests.map((row) => (
                    <tr key={row.id}>
                      <td>{row.user_name} ({row.user_username})</td>
                      <td>{row.book_title}</td>
                      <td>{row.created_at?.split('T')[0]}</td>
                      <td className="table-actions">
                        <Button variant="primary" onClick={() => onReviewBorrow(row.id, 'approve')}>Approve</Button>
                        <Button variant="danger" onClick={() => onReviewBorrow(row.id, 'reject')}>Reject</Button>
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
                  <th>Current Due</th>
                  <th>Requested Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {extensionRequests.map((row) => (
                  <tr key={row.id}>
                    <td>{row.user_name}</td>
                    <td>{row.book_title}</td>
                    <td>{row.current_due_date?.split('T')[0]}</td>
                    <td>{row.requested_due_date?.split('T')[0]}</td>
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

