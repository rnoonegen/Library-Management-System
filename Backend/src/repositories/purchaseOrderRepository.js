const { getPool } = require("../config/connection");

const SELECT_FIELDS = `
  po.*,
  u.name AS user_name,
  u.username AS user_username,
  b.title AS book_title,
  b.qty AS book_qty,
  b.price AS book_price
`;

const ACTIVE_STATUSES = ["pending", "ready"];

async function findByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM purchase_orders po
     JOIN users u ON u.id = po.user_id
     JOIN books b ON b.id = po.book_id
     WHERE po.user_id = $1
     ORDER BY po.created_at DESC`,
    [userId],
  );
  return rows;
}

async function findPaginated(page, limit, { status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";
  if (status === "active") {
    where = "WHERE po.status IN ('pending', 'ready')";
  } else if (status) {
    where = "WHERE po.status = $1";
    params.push(status);
  }

  const { rows: countRows } = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM purchase_orders po ${where}`,
    params,
  );
  const total = countRows[0].total;

  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS}
     FROM purchase_orders po
     JOIN users u ON u.id = po.user_id
     JOIN books b ON b.id = po.book_id
     ${where}
     ORDER BY po.created_at ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return { orders: rows, total };
}

async function findById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM purchase_orders po
     JOIN users u ON u.id = po.user_id
     JOIN books b ON b.id = po.book_id
     WHERE po.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findActiveByUserAndBook(userId, bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT id, status FROM purchase_orders
     WHERE user_id = $1 AND book_id = $2 AND status = ANY($3::varchar[])`,
    [userId, bookId, ACTIVE_STATUSES],
  );
  return rows[0] || null;
}

async function create({ userId, bookId, amount }, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO purchase_orders (user_id, book_id, amount, status)
     VALUES ($1, $2, $3, 'pending') RETURNING id`,
    [userId, bookId, amount],
  );
  return rows[0].id;
}

async function updateStatus(id, status, { adminNote, reviewedBy } = {}, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE purchase_orders
     SET status = $1,
         admin_note = COALESCE($2, admin_note),
         reviewed_by = COALESCE($3, reviewed_by),
         reviewed_at = CASE WHEN $3 IS NOT NULL THEN NOW() ELSE reviewed_at END
     WHERE id = $4`,
    [status, adminNote || null, reviewedBy || null, id],
  );
}

module.exports = {
  ACTIVE_STATUSES,
  findByUserId,
  findPaginated,
  findById,
  findActiveByUserAndBook,
  create,
  updateStatus,
};
