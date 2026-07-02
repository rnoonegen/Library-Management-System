import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';
import SearchBar from 'components/common/SearchBar';
import Pagination from 'components/common/Pagination';
import BorrowStatusTabs from 'components/users/BorrowStatusTabs';
import BookLinkedCard from 'components/common/BookLinkedCard';
import { useBookRecordView } from 'hooks/useBookRecordView';
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
  const { openBookView, BookViewModal } = useBookRecordView();
  const hasSearch = Boolean(search.trim());
  const emptyMessage = getBorrowEmptyMessage(statusFilter, hasSearch);

  const openBorrowView = (row) => {
    const status = row.is_overdue && row.status !== 'returned' ? 'overdue' : row.status;
    openBookView(row.book_id, {
      recordTitle: 'Borrow details',
      recordDetails: [
        { label: 'Status', value: status },
        { label: 'Borrowed', value: formatDateOnly(row.borrow_date) },
        { label: 'Due', value: formatDateOnly(row.due_date) },
        ...(row.status === 'returned'
          ? [{ label: 'Returned', value: formatDateOnly(row.return_date) }]
          : []),
      ],
    });
  };

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
          <div className="transactions-grid transactions-catalog-grid">
            {borrows.map((row) => {
              const status = row.is_overdue && row.status !== 'returned' ? 'overdue' : row.status;
              return (
                <BookLinkedCard
                  key={row.id}
                  bookId={row.book_id}
                  bookTitle={row.book_title}
                  badge={<StatusBadge status={status} />}
                  onView={() => openBorrowView(row)}
                  actions={
                    row.status !== 'returned' && row.can_extend ? (
                      <Button variant="secondary" onClick={() => onOpenExtension(row)}>
                        Renew due date (+14 days)
                      </Button>
                    ) : null
                  }
                  secondaryActions={
                    row.status !== 'returned' && !row.can_extend ? (
                      row.extend_reason ? (
                        <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem', width: '100%' }}>
                          {row.extend_reason}
                        </p>
                      ) : row.is_overdue ? (
                        <p className="book-status-limit" style={{ margin: 0, fontSize: '0.875rem', width: '100%' }}>
                          Overdue — pay fine at library
                        </p>
                      ) : null
                    ) : null
                  }
                >
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
                </BookLinkedCard>
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

      {BookViewModal}
    </>
  );
}
