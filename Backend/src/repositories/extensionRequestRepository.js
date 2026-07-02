const { getPool } = require("../config/connection");

const SELECT_FIELDS = `
  er.*,
  u.name AS user_name,
  u.username AS user_username,
  b.title AS book_title,
  t.book_id AS book_id
`;

async function findAll({ status } = {}) {
  const params = [];
  let where = "";
  if (status) {
    where = "WHERE er.status = $1";
    params.push(status);
  }
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM extension_requests er
     JOIN users u ON u.id = er.user_id
     JOIN transactions t ON t.id = er.borrow_id
     JOIN books b ON b.id = t.book_id
     ${where}
     ORDER BY er.created_at DESC`,
    params,
  );
  return rows;
}

async function findPaginated(page, limit, { status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";
  if (status) {
    where = "WHERE er.status = $1";
    params.push(status);
  }

  const { rows: countRows } = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM extension_requests er ${where}`,
    params,
  );
  const total = countRows[0].total;

  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM extension_requests er
     JOIN users u ON u.id = er.user_id
     JOIN transactions t ON t.id = er.borrow_id
     JOIN books b ON b.id = t.book_id
     ${where}
     ORDER BY er.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return { requests: rows, total };
}

async function findByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM extension_requests er
     JOIN users u ON u.id = er.user_id
     JOIN transactions t ON t.id = er.borrow_id
     JOIN books b ON b.id = t.book_id
     WHERE er.user_id = $1
     ORDER BY er.created_at DESC`,
    [userId],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM extension_requests er
     JOIN users u ON u.id = er.user_id
     JOIN transactions t ON t.id = er.borrow_id
     JOIN books b ON b.id = t.book_id
     WHERE er.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findPendingByBorrowId(borrowId) {
  const { rows } = await getPool().query(
    `SELECT id FROM extension_requests WHERE borrow_id = $1 AND status = 'pending'`,
    [borrowId],
  );
  return rows[0] || null;
}

async function findPendingByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT id FROM extension_requests WHERE user_id = $1 AND status = 'pending' LIMIT 1`,
    [userId],
  );
  return rows[0] || null;
}

async function countApprovedInMonth(userId, year, month) {
  const { rows } = await getPool().query(
    `SELECT COUNT(*)::int AS count FROM extension_requests
     WHERE user_id = $1 AND status = 'approved'
       AND EXTRACT(YEAR FROM reviewed_at) = $2
       AND EXTRACT(MONTH FROM reviewed_at) = $3`,
    [userId, year, month],
  );
  return rows[0].count;
}

async function create(data, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO extension_requests (
      borrow_id, user_id, current_due_date, requested_due_date, reason
    ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      data.borrowId,
      data.userId,
      data.currentDueDate,
      data.requestedDueDate,
      data.reason || null,
    ],
  );
  return rows[0].id;
}

async function review(id, { status, adminNote, reviewedBy }, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE extension_requests
     SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = NOW()
     WHERE id = $4`,
    [status, adminNote || null, reviewedBy, id],
  );
}

module.exports = {
  findAll,
  findPaginated,
  findByUserId,
  findById,
  findPendingByBorrowId,
  findPendingByUserId,
  countApprovedInMonth,
  create,
  review,
};
