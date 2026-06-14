const books = [
  {
    id: 1,
    isbn: '9789354716805',
    title: 'BOB BOOKS #5: LONG VOWELS',
    publisher: 'Scholatic',
    author: 'Bobby Lynn Maslen',
    qty: 1,
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
];

const transactions = [];

let nextBookId = 2;
let nextMemberId = 2;
let nextTransactionId = 1;

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
