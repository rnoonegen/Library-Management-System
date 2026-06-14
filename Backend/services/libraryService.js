const memoryStore = require('../db/memoryStore');
const { getPool } = require('../db/connection');
const { isMySQLEnabled, getDbMode } = require('../config/database');

function useMySQL() {
  return isMySQLEnabled() && getPool();
}

// Books
async function getAllBooks() {
  if (useMySQL()) {
    const [rows] = await getPool().query('SELECT * FROM books ORDER BY title');
    return rows;
  }
  return [...memoryStore.books];
}

async function getBookById(id) {
  if (useMySQL()) {
    const [rows] = await getPool().query('SELECT * FROM books WHERE id = ?', [id]);
    return rows[0] || null;
  }
  return memoryStore.getBookById(Number(id)) || null;
}

async function createBook(data) {
  const { title, author, isbn, category, total_copies, published_year } = data;
  const copies = parseInt(total_copies, 10) || 1;

  if (useMySQL()) {
    const [result] = await getPool().query(
      'INSERT INTO books (title, author, isbn, category, total_copies, available_copies, published_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn || null, category || null, copies, copies, published_year || null]
    );
    return getBookById(result.insertId);
  }

  const book = {
    id: memoryStore.nextBookId(),
    title,
    author,
    isbn: isbn || null,
    category: category || null,
    total_copies: copies,
    available_copies: copies,
    published_year: published_year || null,
  };
  memoryStore.books.push(book);
  return book;
}

async function updateBook(id, data) {
  const existing = await getBookById(id);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const author = data.author ?? existing.author;
  const isbn = data.isbn ?? existing.isbn;
  const category = data.category ?? existing.category;
  const published_year = data.published_year ?? existing.published_year;
  const total_copies = parseInt(data.total_copies ?? existing.total_copies, 10);
  const borrowed = existing.total_copies - existing.available_copies;
  const available_copies = Math.max(0, total_copies - borrowed);

  if (useMySQL()) {
    await getPool().query(
      'UPDATE books SET title=?, author=?, isbn=?, category=?, total_copies=?, available_copies=?, published_year=? WHERE id=?',
      [title, author, isbn, category, total_copies, available_copies, published_year, id]
    );
    return getBookById(id);
  }

  Object.assign(existing, { title, author, isbn, category, total_copies, available_copies, published_year });
  return existing;
}

async function deleteBook(id) {
  const existing = await getBookById(id);
  if (!existing) return false;

  if (useMySQL()) {
    await getPool().query('DELETE FROM books WHERE id = ?', [id]);
    return true;
  }

  const index = memoryStore.books.findIndex((b) => b.id === Number(id));
  if (index !== -1) memoryStore.books.splice(index, 1);
  return true;
}

// Members
async function getAllMembers() {
  if (useMySQL()) {
    const [rows] = await getPool().query('SELECT * FROM members ORDER BY name');
    return rows;
  }
  return [...memoryStore.members];
}

async function getMemberById(id) {
  if (useMySQL()) {
    const [rows] = await getPool().query('SELECT * FROM members WHERE id = ?', [id]);
    return rows[0] || null;
  }
  return memoryStore.getMemberById(Number(id)) || null;
}

async function createMember(data) {
  const { name, email, phone, address, membership_date, status } = data;

  if (useMySQL()) {
    const [result] = await getPool().query(
      'INSERT INTO members (name, email, phone, address, membership_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, address || null, membership_date, status || 'active']
    );
    return getMemberById(result.insertId);
  }

  const member = {
    id: memoryStore.nextMemberId(),
    name,
    email,
    phone: phone || null,
    address: address || null,
    membership_date,
    status: status || 'active',
  };
  memoryStore.members.push(member);
  return member;
}

async function updateMember(id, data) {
  const existing = await getMemberById(id);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const email = data.email ?? existing.email;
  const phone = data.phone ?? existing.phone;
  const address = data.address ?? existing.address;
  const membership_date = data.membership_date ?? existing.membership_date;
  const status = data.status ?? existing.status;

  if (useMySQL()) {
    await getPool().query(
      'UPDATE members SET name=?, email=?, phone=?, address=?, membership_date=?, status=? WHERE id=?',
      [name, email, phone, address, membership_date, status, id]
    );
    return getMemberById(id);
  }

  Object.assign(existing, { name, email, phone, address, membership_date, status });
  return existing;
}

async function deleteMember(id) {
  const existing = await getMemberById(id);
  if (!existing) return false;

  if (useMySQL()) {
    await getPool().query('DELETE FROM members WHERE id = ?', [id]);
    return true;
  }

  const index = memoryStore.members.findIndex((m) => m.id === Number(id));
  if (index !== -1) memoryStore.members.splice(index, 1);
  return true;
}

// Transactions
async function getAllTransactions() {
  if (useMySQL()) {
    const [rows] = await getPool().query(`
      SELECT t.*, b.title AS book_title, m.name AS member_name
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      JOIN members m ON t.member_id = m.id
      ORDER BY t.borrow_date DESC
    `);
    return rows;
  }
  return memoryStore.transactions.map(memoryStore.enrichTransaction);
}

async function borrowBook({ book_id, member_id, borrow_date, due_date }) {
  const book = await getBookById(book_id);
  const member = await getMemberById(member_id);

  if (!book) throw new Error('Book not found');
  if (!member) throw new Error('Member not found');
  if (member.status !== 'active') throw new Error('Member is not active');
  if (book.available_copies < 1) throw new Error('No copies available');

  if (useMySQL()) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        'INSERT INTO transactions (book_id, member_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
        [book_id, member_id, borrow_date, due_date, 'borrowed']
      );
      await connection.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
      await connection.commit();
      const [rows] = await connection.query(
        `SELECT t.*, b.title AS book_title, m.name AS member_name FROM transactions t
         JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id WHERE t.id = ?`,
        [result.insertId]
      );
      return rows[0];
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  const transaction = {
    id: memoryStore.nextTransactionId(),
    book_id: Number(book_id),
    member_id: Number(member_id),
    borrow_date,
    due_date,
    return_date: null,
    status: 'borrowed',
  };
  book.available_copies -= 1;
  memoryStore.transactions.push(transaction);
  return memoryStore.enrichTransaction(transaction);
}

async function returnBook(transactionId) {
  if (useMySQL()) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query('SELECT * FROM transactions WHERE id = ? AND status != ?', [
        transactionId,
        'returned',
      ]);
      if (!rows.length) throw new Error('Transaction not found or already returned');

      const transaction = rows[0];
      const returnDate = new Date().toISOString().split('T')[0];
      await connection.query(
        'UPDATE transactions SET return_date = ?, status = ? WHERE id = ?',
        [returnDate, 'returned', transactionId]
      );
      await connection.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [
        transaction.book_id,
      ]);
      await connection.commit();

      const [updated] = await connection.query(
        `SELECT t.*, b.title AS book_title, m.name AS member_name FROM transactions t
         JOIN books b ON t.book_id = b.id JOIN members m ON t.member_id = m.id WHERE t.id = ?`,
        [transactionId]
      );
      return updated[0];
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  const transaction = memoryStore.transactions.find((t) => t.id === Number(transactionId));
  if (!transaction || transaction.status === 'returned') {
    throw new Error('Transaction not found or already returned');
  }

  const book = memoryStore.getBookById(transaction.book_id);
  transaction.return_date = new Date().toISOString().split('T')[0];
  transaction.status = 'returned';
  if (book) book.available_copies += 1;
  return memoryStore.enrichTransaction(transaction);
}

async function getDashboardStats() {
  const allBooks = await getAllBooks();
  const allMembers = await getAllMembers();
  const allTransactions = await getAllTransactions();

  const activeBorrows = allTransactions.filter((t) => t.status === 'borrowed' || t.status === 'overdue');
  const overdue = allTransactions.filter((t) => t.status === 'overdue');

  return {
    totalBooks: allBooks.length,
    totalCopies: allBooks.reduce((sum, b) => sum + b.total_copies, 0),
    availableCopies: allBooks.reduce((sum, b) => sum + b.available_copies, 0),
    totalMembers: allMembers.length,
    activeMembers: allMembers.filter((m) => m.status === 'active').length,
    activeBorrows: activeBorrows.length,
    overdueLoans: overdue.length,
    dbMode: useMySQL() ? getDbMode() : 'memory',
  };
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getAllTransactions,
  borrowBook,
  returnBook,
  getDashboardStats,
};
