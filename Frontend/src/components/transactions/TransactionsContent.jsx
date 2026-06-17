import SearchBar from 'components/common/SearchBar';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'borrowed', label: 'Borrowed' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'returned', label: 'Returned' },
];

function StatusBadge({ status }) {
  const map = {
    borrowed: 'badge-borrowed',
    returned: 'badge-success',
    overdue: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-borrowed'}`}>{status}</span>;
}

function formatDate(value) {
  return value?.split('T')[0] || value || '';
}

function formatFine(amount) {
  return `₹${Number(amount || 0)}`;
}

function TransactionsPagination({
  safePage,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="transactions-pagination" aria-label="Transactions pagination">
      <button
        type="button"
        className="btn-secondary pagination-btn"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        Previous
      </button>
      <div className="pagination-pages">
        {startPage > 1 && (
          <>
            <button type="button" className="pagination-page" onClick={() => onPageChange(1)}>
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">…</span>}
          </>
        )}
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            className={`pagination-page ${n === safePage ? 'active' : ''}`}
            onClick={() => onPageChange(n)}
            aria-current={n === safePage ? 'page' : undefined}
          >
            {n}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
            <button type="button" className="pagination-page" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className="btn-secondary pagination-btn"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export default function TransactionsContent({
  loading,
  transactions,
  search,
  statusFilter,
  statusCounts,
  filteredTransactions,
  paginatedTransactions,
  safePage,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  start,
  end,
  searchTerm,
  emptyMessage,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onReturn,
  onPayment,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="transactions-toolbar">
        <SearchBar
          className="transactions-search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search by book title..."
        />
        {!loading && filteredTransactions.length > 0 && (
          <span className="transactions-summary">
            Showing {start}-{end} of {filteredTransactions.length} loans
          </span>
        )}
      </div>

      {!loading && transactions.length > 0 && (
        <div className="transactions-tabs" role="tablist" aria-label="Filter loans by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`transactions-tab transactions-tab-${tab.id} ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => onStatusChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="transactions-tab-count">{statusCounts[tab.id]}</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-state-icon" aria-hidden="true">🔄</div>
          <strong>No loans yet</strong>
          <p>Borrow a book to a user to see it here.</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-state-icon" aria-hidden="true">{searchTerm ? '🔍' : '📋'}</div>
          <strong>{searchTerm ? 'No loans found' : emptyMessage.title}</strong>
          <p>{searchTerm ? 'Try a different book title or clear the search.' : emptyMessage.hint}</p>
        </div>
      ) : (
        <>
          <div className="transactions-grid">
            {paginatedTransactions.map((txn) => (
              <article key={txn.id} className="transaction-card">
                <div className="transaction-card-top">
                  <h3 className="transaction-card-title">{txn.book_title}</h3>
                  <StatusBadge status={txn.status} />
                </div>

                <dl className="transaction-card-details">
                  <div className="transaction-detail"><dt>User</dt><dd>{txn.user_name}</dd></div>
                  <div className="transaction-detail"><dt>Borrowed</dt><dd>{formatDate(txn.borrow_date)}</dd></div>
                  <div className="transaction-detail"><dt>Due</dt><dd>{formatDate(txn.due_date)}</dd></div>
                  <div className="transaction-detail"><dt>Returned</dt><dd>{formatDate(txn.return_date) || '—'}</dd></div>
                  <div className="transaction-detail"><dt>Daily Fine</dt><dd>{formatFine(txn.daily_fine_amount)}/day</dd></div>
                  <div className="transaction-detail">
                    <dt>{txn.status === 'returned' ? 'Fine Paid' : 'Accrued Fine'}</dt>
                    <dd className={txn.accrued_fine > 0 ? 'fine-amount-due' : undefined}>
                      {formatFine(txn.accrued_fine)}
                      {txn.is_overdue && txn.overdue_days > 0 && (
                        <span className="fine-days-note"> ({txn.overdue_days} day{txn.overdue_days === 1 ? '' : 's'})</span>
                      )}
                    </dd>
                  </div>
                  {txn.payment_status === 'paid' && txn.status !== 'returned' && (
                    <div className="transaction-detail transaction-detail-full">
                      <dt>Payment</dt>
                      <dd className="fine-amount-paid">
                        Received {formatFine(txn.paid_amount)} on {formatDate(txn.paid_at)}
                      </dd>
                    </div>
                  )}
                </dl>

                {txn.status !== 'returned' && (
                  <div className="transaction-card-actions">
                    {txn.requires_payment && (
                      <button type="button" className="btn-primary" onClick={() => onPayment(txn.id)}>
                        Payment Received
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-success"
                      onClick={() => onReturn(txn.id)}
                      disabled={!txn.can_return}
                      title={txn.requires_payment ? 'Record payment before returning this book' : undefined}
                    >
                      Return Book
                    </button>
                  </div>
                )}

                {(txn.status === 'borrowed' || txn.status === 'overdue') && (
                  <div className="transaction-card-actions transaction-card-secondary-actions">
                    <button type="button" className="btn-secondary" onClick={() => onEdit(txn)}>Edit</button>
                    <button type="button" className="btn-danger" onClick={() => onDelete(txn.id)}>Delete</button>
                  </div>
                )}

                {txn.status === 'returned' && (
                  <div className="transaction-card-actions transaction-card-secondary-actions">
                    <button type="button" className="btn-danger" onClick={() => onDelete(txn.id)}>Delete</button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <TransactionsPagination
            safePage={safePage}
            totalPages={totalPages}
            startPage={startPage}
            endPage={endPage}
            pageNumbers={pageNumbers}
            onPageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}

