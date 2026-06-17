import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';

export default function UserBorrowsContent({ borrows, onOpenExtension }) {
  if (borrows.length === 0) {
    return <p className="text-muted">No active or past borrows.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Book</th>
            <th>Borrowed</th>
            <th>Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {borrows.map((row) => (
            <tr key={row.id}>
              <td>{row.book_title}</td>
              <td>{row.borrow_date?.split('T')[0]}</td>
              <td>{row.due_date?.split('T')[0]}</td>
              <td>
                <StatusBadge status={row.is_overdue && row.status !== 'returned' ? 'overdue' : row.status} />
              </td>
              <td>
                {row.status !== 'returned' && (
                  <Button variant="secondary" onClick={() => onOpenExtension(row)}>
                    Extend Due Date
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

