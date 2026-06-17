import StatusBadge from 'components/common/StatusBadge';

export default function UserRequestsPanel({
  tab,
  borrowRequests,
  extensionRequests,
  loading,
  onTabChange,
}) {
  return (
    <>
      <div className="tab-bar">
        <button
          type="button"
          className={tab === 'borrow' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('borrow')}
        >
          Borrow requests ({borrowRequests.length})
        </button>
        <button
          type="button"
          className={tab === 'extension' ? 'tab active' : 'tab'}
          onClick={() => onTabChange('extension')}
        >
          Extension requests ({extensionRequests.length})
        </button>
      </div>

      <div className="tab-panel">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : tab === 'borrow' ? (
          borrowRequests.length === 0 ? (
            <p className="text-muted">No borrow requests yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Admin note</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowRequests.map((row) => (
                    <tr key={row.id}>
                      <td>{row.book_title}</td>
                      <td>{row.created_at?.split('T')[0]}</td>
                      <td><StatusBadge status={row.status} /></td>
                      <td>{row.admin_note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : extensionRequests.length === 0 ? (
          <p className="text-muted">No extension requests yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Requested due date</th>
                  <th>Status</th>
                  <th>Admin note</th>
                </tr>
              </thead>
              <tbody>
                {extensionRequests.map((row) => (
                  <tr key={row.id}>
                    <td>{row.book_title}</td>
                    <td>{row.requested_due_date?.split('T')[0]}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>{row.admin_note || '—'}</td>
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

