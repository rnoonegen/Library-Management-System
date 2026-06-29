import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';
import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import BorrowStatusTabs from 'components/users/BorrowStatusTabs';
import { formatDateOnly } from 'utils/formatDate';
import { getBorrowEmptyMessage } from 'utils/borrowFilterParams';

export default function UserBorrowsContent({
  borrows,
  search,
  statusFilter,
  statusCounts,
  total,
  totalAll,
  start,
  end,
  page,
  totalPages,
  startPage,
  endPage,
  pageNumbers,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onOpenExtension,
}) {
  const hasSearch = Boolean(search.trim());
  const emptyMessage = getBorrowEmptyMessage(statusFilter, hasSearch);

  return (
    <>
      <BorrowStatusTabs
        activeStatus={statusFilter}
        counts={statusCounts}
        onChange={onStatusChange}
      />

      <div className="books-toolbar">
        <SearchBar
          className="books-search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search by book title..."
        />
        {total > 0 && (
          <span className="books-summary">
            Showing {start}–{end} of {total} loans
          </span>
        )}
      </div>

      {totalAll === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">📖</div>
          <strong>{emptyMessage.title}</strong>
          <p>{emptyMessage.hint}</p>
        </div>
      ) : total === 0 ? (
        <div className="books-empty">
          <div className="empty-state-icon" aria-hidden="true">{hasSearch ? '🔍' : '📋'}</div>
          <strong>{emptyMessage.title}</strong>
          <p>{emptyMessage.hint}</p>
        </div>
      ) : (
        <>
          <div className="transactions-grid">
            {borrows.map((row) => {
              const status = row.is_overdue && row.status !== 'returned' ? 'overdue' : row.status;
              return (
                <article key={row.id} className="transaction-card">
                  <div className="transaction-card-top">
                    <h3 className="transaction-card-title">{row.book_title}</h3>
                    <StatusBadge status={status} />
                  </div>

                  <dl className="transaction-card-details">
                    <div className="transaction-detail">
                      <dt>Borrowed</dt>
                      <dd>{formatDateOnly(row.borrow_date)}</dd>
                    </div>
                    <div className="transaction-detail">
                      <dt>Due</dt>
                      <dd>{formatDateOnly(row.due_date)}</dd>
                    </div>
                    {row.status === 'returned' && (
                      <div className="transaction-detail">
                        <dt>Returned</dt>
                        <dd>{formatDateOnly(row.return_date)}</dd>
                      </div>
                    )}
                  </dl>

                  {row.status !== 'returned' && (
                    <div className="transaction-card-actions">
                      {row.can_extend ? (
                        <Button variant="secondary" onClick={() => onOpenExtension(row)}>
                          Extend due date (+14 days)
                        </Button>
                      ) : row.extend_reason ? (
                        <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem' }}>
                          {row.extend_reason}
                        </p>
                      ) : row.is_overdue ? (
                        <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem' }}>
                          Overdue — pay fine at library
                        </p>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            startPage={startPage}
            endPage={endPage}
            pageNumbers={pageNumbers}
            onPageChange={onPageChange}
            className="transactions-pagination"
          />
        </>
      )}
    </>
  );
}
