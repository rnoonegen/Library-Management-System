export function groupBorrowsByBook(borrows) {
  const groups = new Map();

  borrows.forEach((borrow) => {
    const key = borrow.book_id;
    if (!groups.has(key)) {
      groups.set(key, {
        book_id: borrow.book_id,
        book_title: borrow.book_title,
        count: 0,
        loans: [],
      });
    }

    const group = groups.get(key);
    group.count += 1;
    group.loans.push({
      id: borrow.id,
      borrow_date: borrow.borrow_date,
      return_date: borrow.return_date,
      due_date: borrow.due_date,
      status: borrow.status,
    });
  });

  return Array.from(groups.values());
}
