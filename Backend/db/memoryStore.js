const books = [
  {
    id: 1,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    category: 'Fiction',
    total_copies: 5,
    available_copies: 3,
    published_year: 1960,
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    category: 'Dystopian',
    total_copies: 4,
    available_copies: 4,
    published_year: 1949,
  },
  {
    id: 3,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Classic',
    total_copies: 3,
    available_copies: 2,
    published_year: 1925,
  },
];

const members = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0101',
    address: '123 Main St',
    membership_date: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '555-0102',
    address: '456 Oak Ave',
    membership_date: '2024-03-20',
    status: 'active',
  },
];

const transactions = [
  {
    id: 1,
    book_id: 1,
    member_id: 1,
    borrow_date: '2025-05-01',
    due_date: '2025-05-15',
    return_date: null,
    status: 'borrowed',
  },
  {
    id: 2,
    book_id: 3,
    member_id: 2,
    borrow_date: '2025-04-20',
    due_date: '2025-05-04',
    return_date: null,
    status: 'overdue',
  },
];

let nextBookId = 4;
let nextMemberId = 3;
let nextTransactionId = 3;

function getBookById(id) {
  return books.find((book) => book.id === id);
}

function getMemberById(id) {
  return members.find((member) => member.id === id);
}

function enrichTransaction(transaction) {
  const book = getBookById(transaction.book_id);
  const member = getMemberById(transaction.member_id);
  return {
    ...transaction,
    book_title: book?.title || 'Unknown',
    member_name: member?.name || 'Unknown',
  };
}

module.exports = {
  books,
  members,
  transactions,
  nextBookId: () => nextBookId++,
  nextMemberId: () => nextMemberId++,
  nextTransactionId: () => nextTransactionId++,
  getBookById,
  getMemberById,
  enrichTransaction,
};
