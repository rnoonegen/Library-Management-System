const { getPool } = require("../config/connection");

const TRANSACTION_WITH_DETAILS = `
  SELECT t.*, b.title AS book_title, u.name AS user_name
  FROM transactions t
  JOIN books b ON t.book_id = b.id
  JOIN users u ON t.user_id = u.id
`;

async function findAllWithDetails() {
  const { rows } = await getPool().query(
    `${TRANSACTION_WITH_DETAILS} ORDER BY t.borrow_date DESC`,
  );
  return rows;
}

async function findByUserId(userId) {
  const { rows } = await getPool().query(
    `${TRANSACTION_WITH_DETAILS} WHERE t.user_id = $1 ORDER BY t.borrow_date DESC`,
    [userId],
  );
  return rows;
}

async function findByIdWithDetails(id, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `${TRANSACTION_WITH_DETAILS} WHERE t.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query("SELECT * FROM transactions WHERE id = $1", [
    id,
  ]);
  return rows[0] || null;
}

async function findActiveById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    "SELECT * FROM transactions WHERE id = $1 AND status != $2",
    [id, "returned"],
  );
  return rows[0] || null;
}

async function countActiveByUserId(userId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM transactions
     WHERE user_id = $1 AND status != 'returned'`,
    [userId],
  );
  return rows[0].count;
}

async function findActiveBorrowByUserAndBook(userId, bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT id FROM transactions
     WHERE user_id = $1 AND book_id = $2 AND status != 'returned'
     LIMIT 1`,
    [userId, bookId],
  );
  return rows[0] || null;
}

async function findActiveBookIdsByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT book_id FROM transactions
     WHERE user_id = $1 AND status != 'returned'`,
    [userId],
  );
  return rows.map((r) => r.book_id);
}

async function findActiveByBookId(bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `${TRANSACTION_WITH_DETAILS}
     WHERE t.book_id = $1 AND t.status != 'returned'
     ORDER BY t.borrow_date DESC LIMIT 1`,
    [bookId],
  );
  return rows[0] || null;
}

async function create(data, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO transactions (
      book_id, user_id, borrow_date, due_date, status, daily_fine_amount
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      data.book_id,
      data.user_id,
      data.borrow_date,
      data.due_date,
      data.status,
      data.daily_fine_amount,
    ],
  );
  return rows[0].id;
}

async function markReturned(id, returnDate, fineAmount, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE transactions
     SET return_date = $1, status = $2, fine_amount = $3
     WHERE id = $4`,
    [returnDate, "returned", fineAmount, id],
  );
}

async function markPaid(id, { paidAt, paidAmount }, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE transactions
     SET payment_status = $1, paid_at = $2, paid_amount = $3
     WHERE id = $4`,
    ["paid", paidAt, paidAmount, id],
  );
}

async function update(id, data, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE transactions
     SET borrow_date = $1, due_date = $2, daily_fine_amount = $3
     WHERE id = $4`,
    [data.borrow_date, data.due_date, data.daily_fine_amount, id],
  );
}

async function remove(id, client) {
  const db = client || getPool();
  await db.query("DELETE FROM transactions WHERE id = $1", [id]);
}

module.exports = {
  findAllWithDetails,
  findByUserId,
  findByIdWithDetails,
  findById,
  findActiveById,
  countActiveByUserId,
  findActiveBorrowByUserAndBook,
  findActiveBookIdsByUserId,
  findActiveByBookId,
  create,
  markReturned,
  markPaid,
  update,
  remove,
};
