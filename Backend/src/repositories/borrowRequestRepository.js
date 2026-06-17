const { getPool } = require("../config/connection");

const SELECT_FIELDS = `
  br.*,
  u.name AS user_name,
  u.username AS user_username,
  b.title AS book_title,
  b.qty AS book_qty
`;

async function findAll({ status } = {}) {
  const params = [];
  let where = "";
  if (status) {
    where = "WHERE br.status = $1";
    params.push(status);
  }
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     ${where}
     ORDER BY br.created_at DESC`,
    params,
  );
  return rows;
}

async function findByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.user_id = $1
     ORDER BY br.created_at DESC`,
    [userId],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findPendingByUserAndBook(userId, bookId) {
  const { rows } = await getPool().query(
    `SELECT id FROM borrow_requests
     WHERE user_id = $1 AND book_id = $2 AND status = 'pending'`,
    [userId, bookId],
  );
  return rows[0] || null;
}

async function create({ userId, bookId }, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO borrow_requests (user_id, book_id) VALUES ($1, $2) RETURNING id`,
    [userId, bookId],
  );
  return rows[0].id;
}

async function review(id, { status, adminNote, reviewedBy, borrowId }, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE borrow_requests
     SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = NOW(), borrow_id = $4
     WHERE id = $5`,
    [status, adminNote || null, reviewedBy, borrowId || null, id],
  );
}

module.exports = {
  findAll,
  findByUserId,
  findById,
  findPendingByUserAndBook,
  create,
  review,
};
