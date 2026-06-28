export const BORROW_STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'borrowed', label: 'Borrowed' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'returned', label: 'Returned' },
];

export const EMPTY_BORROW_STATUS_COUNTS = {
  all: 0,
  borrowed: 0,
  overdue: 0,
  returned: 0,
};

export function getBorrowDisplayStatus(borrow) {
  if (borrow.status === 'returned') return 'returned';
  if (borrow.is_overdue || borrow.status === 'overdue') return 'overdue';
  return 'borrowed';
}

export function filterBorrowsByStatus(borrows, status) {
  if (!status || status === 'all') return borrows;
  return borrows.filter((borrow) => getBorrowDisplayStatus(borrow) === status);
}

export function countBorrowsByStatus(borrows) {
  const counts = { ...EMPTY_BORROW_STATUS_COUNTS, all: borrows.length };
  borrows.forEach((borrow) => {
    const status = getBorrowDisplayStatus(borrow);
    counts[status] += 1;
  });
  return counts;
}

export function getBorrowEmptyMessage(statusFilter, hasSearch) {
  if (hasSearch) {
    return {
      title: 'No loans found',
      hint: 'Try a different book title or clear the search.',
    };
  }

  if (statusFilter === 'all') {
    return {
      title: 'No borrows yet',
      hint: 'Books you borrow from the library will appear here.',
    };
  }

  const tab = BORROW_STATUS_TABS.find((item) => item.id === statusFilter);
  const label = tab?.label?.toLowerCase() || statusFilter;
  return {
    title: `No ${label} loans`,
    hint: `You don't have any ${label} loans right now.`,
  };
}
