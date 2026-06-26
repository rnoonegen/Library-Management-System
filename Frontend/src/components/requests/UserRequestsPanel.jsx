import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';
import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import { formatDateOnly } from 'utils/formatDate';

function WaitlistCard({ row, onCancelHold }) {
  return (
    <article className="transaction-card">
      <div className="transaction-card-top">
        <h3 className="transaction-card-title">{row.book_title}</h3>
        <StatusBadge status={row.status} />
      </div>
      <dl className="transaction-card-details">
        <div className="transaction-detail">
          <dt>Joined</dt>
          <dd>{formatDateOnly(row.created_at)}</dd>
        </div>
        <div className="transaction-detail">
          <dt>Queue</dt>
          <dd>{row.status === 'pending' ? `#${row.queue_position || '—'}` : '—'}</dd>
        </div>
        <div className="transaction-detail">
          <dt>Collect by</dt>
          <dd>{formatDateOnly(row.collect_by)}</dd>
        </div>
      </dl>
      <div className="transaction-card-actions">
        {row.status === 'pending' && onCancelHold && (
          <Button variant="secondary" onClick={() => onCancelHold(row.id)}>Cancel waitlist</Button>
        )}
        {row.status === 'ready' && (
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            Visit library by collect-by date
          </p>
        )}
      </div>
    </article>
  );
}

function PurchaseCard({ row, onCancelPurchase }) {
  return (
    <article className="transaction-card">
      <div className="transaction-card-top">
        <h3 className="transaction-card-title">{row.book_title}</h3>
        <StatusBadge status={row.status} />
      </div>
      <dl className="transaction-card-details">
        <div className="transaction-detail">
          <dt>Ordered</dt>
          <dd>{formatDateOnly(row.created_at)}</dd>
        </div>
        <div className="transaction-detail">
          <dt>Amount</dt>
          <dd>{row.amount != null ? `₹${row.amount}` : '—'}</dd>
        </div>
        <div className="transaction-detail transaction-detail-full">
          <dt>Admin note</dt>
          <dd>{row.admin_note || '—'}</dd>
        </div>
      </dl>
      <div className="transaction-card-actions">
        {(row.status === 'pending' || row.status === 'ready') && onCancelPurchase && (
          <Button variant="secondary" onClick={() => onCancelPurchase(row.id)}>Cancel order</Button>
        )}
        {row.status === 'ready' && (
          <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
            Visit library to pay and collect
          </p>
        )}
      </div>
    </article>
  );
}

function ExtensionCard({ row }) {
  return (
    <article className="transaction-card">
      <div className="transaction-card-top">
        <h3 className="transaction-card-title">{row.book_title}</h3>
        <StatusBadge status={row.status} />
      </div>
      <dl className="transaction-card-details">
        <div className="transaction-detail">
          <dt>Requested due</dt>
          <dd>{formatDateOnly(row.requested_due_date)}</dd>
        </div>
        <div className="transaction-detail transaction-detail-full">
          <dt>Admin note</dt>
          <dd>{row.admin_note || '—'}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function UserRequestsPanel({
  tab,
  borrowRequests,
  extensionRequests,
  purchaseOrders,
  loading,
  borrowSearch,
  extensionSearch,
  purchaseSearch,
  borrowPagination,
  extensionPagination,
  purchasePagination,
  borrowTotalAll,
  extensionTotalAll,
  purchaseTotalAll,
  onTabChange,
  onBorrowSearchChange,
  onExtensionSearchChange,
  onPurchaseSearchChange,
  onCancelHold,
  onCancelPurchase,
  onBorrowPageChange,
  onExtensionPageChange,
  onPurchasePageChange,
}) {
  const tabConfig = {
    borrow: {
      list: borrowRequests,
      pagination: borrowPagination,
      search: borrowSearch,
      totalAll: borrowTotalAll,
      onSearchChange: onBorrowSearchChange,
      onPageChange: onBorrowPageChange,
      label: 'waitlist entries',
    },
    purchase: {
      list: purchaseOrders,
      pagination: purchasePagination,
      search: purchaseSearch,
      totalAll: purchaseTotalAll,
      onSearchChange: onPurchaseSearchChange,
      onPageChange: onPurchasePageChange,
      label: 'purchase orders',
    },
    extension: {
      list: extensionRequests,
      pagination: extensionPagination,
      search: extensionSearch,
      totalAll: extensionTotalAll,
      onSearchChange: onExtensionSearchChange,
      onPageChange: onExtensionPageChange,
      label: 'extension requests',
    },
  };

  const active = tabConfig[tab] || tabConfig.borrow;

  return (
    <>
      <div className="tab-bar">
        <button type="button" className={tab === 'borrow' ? 'tab active' : 'tab'} onClick={() => onTabChange('borrow')}>
          Waitlist ({borrowTotalAll})
        </button>
        <button type="button" className={tab === 'purchase' ? 'tab active' : 'tab'} onClick={() => onTabChange('purchase')}>
          Purchases ({purchaseTotalAll})
        </button>
        <button type="button" className={tab === 'extension' ? 'tab active' : 'tab'} onClick={() => onTabChange('extension')}>
          Extensions ({extensionTotalAll})
        </button>
      </div>

      <div className="books-toolbar" style={{ marginTop: '1rem' }}>
        <SearchBar
          className="books-search"
          value={active.search}
          onChange={active.onSearchChange}
          placeholder="Search by book title..."
        />
        {!loading && active.pagination.total > 0 && (
          <span className="books-summary">
            Showing {active.pagination.start}–{active.pagination.end} of {active.pagination.total}{' '}
            {active.label}
          </span>
        )}
      </div>

      <div className="tab-panel">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : active.totalAll === 0 ? (
          <div className="books-empty">
            <div className="empty-state-icon" aria-hidden="true">
              {tab === 'borrow' ? '📋' : tab === 'purchase' ? '🛒' : '📅'}
            </div>
            <strong>
              {tab === 'borrow'
                ? 'No waitlist entries yet'
                : tab === 'purchase'
                  ? 'No purchase orders yet'
                  : 'No extension requests yet'}
            </strong>
            <p>
              {tab === 'borrow'
                ? 'Join a waitlist from the Books page when a title is unavailable.'
                : tab === 'purchase'
                  ? 'Order books from the Sell tab on the Books page.'
                  : 'Request an extension from My Borrows when eligible.'}
            </p>
          </div>
        ) : active.list.length === 0 ? (
          <div className="books-empty">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <strong>No results found</strong>
            <p>Try a different book title or clear the search.</p>
          </div>
        ) : (
          <>
            <div className="transactions-grid">
              {tab === 'borrow'
                ? active.list.map((row) => (
                    <WaitlistCard key={row.id} row={row} onCancelHold={onCancelHold} />
                  ))
                : tab === 'purchase'
                  ? active.list.map((row) => (
                      <PurchaseCard key={row.id} row={row} onCancelPurchase={onCancelPurchase} />
                    ))
                  : active.list.map((row) => (
                      <ExtensionCard key={row.id} row={row} />
                    ))}
            </div>
            <Pagination
              page={active.pagination.page}
              totalPages={active.pagination.totalPages}
              startPage={active.pagination.startPage}
              endPage={active.pagination.endPage}
              pageNumbers={active.pagination.pageNumbers}
              onPageChange={active.onPageChange}
              className="transactions-pagination"
            />
          </>
        )}
      </div>
    </>
  );
}
