import Modal from 'components/common/Modal';
import StatusBadge from 'components/common/StatusBadge';
import { formatDateOnly } from 'utils/formatDate';

function groupBorrowsByBook(borrows) {
  const groups = new Map();

  borrows.forEach((row) => {
    const key = row.book_id;
    if (!groups.has(key)) {
      groups.set(key, {
        book_id: row.book_id,
        book_title: row.book_title,
        count: 0,
        loans: [],
      });
    }

    const group = groups.get(key);
    group.count += 1;
    group.loans.push({
      id: row.id,
      borrow_date: row.borrow_date,
      return_date: row.return_date,
      due_date: row.due_date,
      status: row.status,
    });
  });

  return Array.from(groups.values());
}

export default function UserBorrowHistoryModal({
  isOpen,
  user,
  borrows,
  loading,
  onClose,
}) {
  if (!isOpen) return null;

  const grouped = groupBorrowsByBook(borrows);
  const totalLoans = borrows.length;
  const uniqueBooks = grouped.length;

  const subtitle = !loading
    ? `${uniqueBooks} unique book${uniqueBooks === 1 ? '' : 's'} · ${totalLoans} total loan${totalLoans === 1 ? '' : 's'}`
    : null;

  return (
    <Modal
      title={user ? `Borrow history — ${user.name}` : 'Borrow history'}
      subtitle={subtitle}
      onClose={onClose}
    >
      {loading ? (
        <div className="loading">Loading borrow history...</div>
      ) : grouped.length === 0 ? (
        <p className="text-muted">This user has not borrowed any books yet.</p>
      ) : (
        <div className="user-borrow-groups">
          {grouped.map((group) => (
            <section key={group.book_id} className="user-borrow-group">
              <div className="user-borrow-group-header">
                <h3 className="user-borrow-group-title">{group.book_title}</h3>
                <span className="badge badge-info user-borrow-count">
                  {group.count}× borrowed
                </span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Borrowed on</th>
                      <th>Returned on</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.loans.map((loan, index) => (
                      <tr key={loan.id}>
                        <td>{index + 1}</td>
                        <td>{formatDateOnly(loan.borrow_date)}</td>
                        <td>
                          {loan.return_date
                            ? formatDateOnly(loan.return_date)
                            : '—'}
                        </td>
                        <td>
                          <StatusBadge status={loan.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
