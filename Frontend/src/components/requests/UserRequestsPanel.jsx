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
  loading,
  borrowSearch,
  extensionSearch,
  borrowPagination,
  extensionPagination,
  borrowTotalAll,
  extensionTotalAll,
  onTabChange,
  onBorrowSearchChange,
  onExtensionSearchChange,
  onCancelHold,
  onBorrowPageChange,
  onExtensionPageChange,
}) {
  const activeList = tab === 'borrow' ? borrowRequests : extensionRequests;
  const activePagination = tab === 'borrow' ? borrowPagination : extensionPagination;
  const activeSearch = tab === 'borrow' ? borrowSearch : extensionSearch;
  const activeTotalAll = tab === 'borrow' ? borrowTotalAll : extensionTotalAll;
  const onSearchChange = tab === 'borrow' ? onBorrowSearchChange : onExtensionSearchChange;
  const onPageChange = tab === 'borrow' ? onBorrowPageChange : onExtensionPageChange;

  return (
    <>
      <div className="tab-bar">
        <button type="button" className={tab === 'borrow' ? 'tab active' : 'tab'} onClick={() => onTabChange('borrow')}>
          Waitlist ({borrowTotalAll})
        </button>
        <button type="button" className={tab === 'extension' ? 'tab active' : 'tab'} onClick={() => onTabChange('extension')}>
          Extensions ({extensionTotalAll})
        </button>
      </div>

      <div className="books-toolbar" style={{ marginTop: '1rem' }}>
        <SearchBar
          className="books-search"
          value={activeSearch}
          onChange={onSearchChange}
          placeholder="Search by book title..."
        />
        {!loading && activePagination.total > 0 && (
          <span className="books-summary">
            Showing {activePagination.start}–{activePagination.end} of {activePagination.total}{' '}
            {tab === 'borrow' ? 'waitlist entries' : 'extension requests'}
          </span>
        )}
      </div>

      <div className="tab-panel">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTotalAll === 0 ? (
          <div className="books-empty">
            <div className="empty-state-icon" aria-hidden="true">{tab === 'borrow' ? '📋' : '📅'}</div>
            <strong>{tab === 'borrow' ? 'No waitlist entries yet' : 'No extension requests yet'}</strong>
            <p>
              {tab === 'borrow'
                ? 'Join a waitlist from the Books page when a title is unavailable.'
                : 'Request an extension from My Borrows when eligible.'}
            </p>
          </div>
        ) : activeList.length === 0 ? (
          <div className="books-empty">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <strong>No results found</strong>
            <p>Try a different book title or clear the search.</p>
          </div>
        ) : (
          <>
            <div className="transactions-grid">
              {tab === 'borrow'
                ? activeList.map((row) => (
                    <WaitlistCard key={row.id} row={row} onCancelHold={onCancelHold} />
                  ))
                : activeList.map((row) => (
                    <ExtensionCard key={row.id} row={row} />
                  ))}
            </div>
            <Pagination
              page={activePagination.page}
              totalPages={activePagination.totalPages}
              startPage={activePagination.startPage}
              endPage={activePagination.endPage}
              pageNumbers={activePagination.pageNumbers}
              onPageChange={onPageChange}
              className="transactions-pagination"
            />
          </>
        )}
      </div>
    </>
  );
}
