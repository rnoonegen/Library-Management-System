const { getPool } = require("../config/connection");

const SELECT_FIELDS = `
  br.*,
  u.name AS user_name,
  u.username AS user_username,
  b.title AS book_title,
  b.qty AS book_qty
`;

const ACTIVE_HOLD_STATUSES = ["pending", "ready"];

async function findAll({ status } = {}) {
  const params = [];
  let where = "";
  if (status === "active") {
    where = "WHERE br.status IN ('pending', 'ready')";
  } else if (status) {
    where = "WHERE br.status = $1";
    params.push(status);
  }
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS},
      (
        SELECT COUNT(*)::int + 1
        FROM borrow_requests earlier
        WHERE earlier.book_id = br.book_id
          AND earlier.status = 'pending'
          AND earlier.created_at < br.created_at
      ) AS queue_position,
      (
        SELECT t.due_date
        FROM transactions t
        WHERE t.book_id = br.book_id AND t.status != 'returned'
        ORDER BY t.borrow_date DESC LIMIT 1
      ) AS current_borrower_due_date,
      (
        SELECT u2.name
        FROM transactions t
        JOIN users u2 ON u2.id = t.user_id
        WHERE t.book_id = br.book_id AND t.status != 'returned'
        ORDER BY t.borrow_date DESC LIMIT 1
      ) AS current_borrower_name
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     ${where}
     ORDER BY br.book_id, br.created_at ASC`,
    params,
  );
  return rows;
}

async function findPaginated(page, limit, { status } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";
  if (status === "active") {
    where = "WHERE br.status IN ('pending', 'ready')";
  } else if (status) {
    where = "WHERE br.status = $1";
    params.push(status);
  }

  const { rows: countRows } = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM borrow_requests br ${where}`,
    params,
  );
  const total = countRows[0].total;

  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS},
      (
        SELECT COUNT(*)::int + 1
        FROM borrow_requests earlier
        WHERE earlier.book_id = br.book_id
          AND earlier.status = 'pending'
          AND earlier.created_at < br.created_at
      ) AS queue_position,
      (
        SELECT t.due_date
        FROM transactions t
        WHERE t.book_id = br.book_id AND t.status != 'returned'
        ORDER BY t.borrow_date DESC LIMIT 1
      ) AS current_borrower_due_date,
      (
        SELECT u2.name
        FROM transactions t
        JOIN users u2 ON u2.id = t.user_id
        WHERE t.book_id = br.book_id AND t.status != 'returned'
        ORDER BY t.borrow_date DESC LIMIT 1
      ) AS current_borrower_name
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     ${where}
     ORDER BY br.book_id, br.created_at ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );

  return { requests: rows, total };
}

async function findQueueSummary() {
  const { rows } = await getPool().query(
    `SELECT
       b.id AS book_id,
       b.title AS book_title,
       b.qty AS available_qty,
       COUNT(*) FILTER (WHERE br.status = 'pending')::int AS pending_count,
       COUNT(*) FILTER (WHERE br.status = 'ready')::int AS ready_count,
       (
         SELECT u.name FROM transactions t
         JOIN users u ON u.id = t.user_id
         WHERE t.book_id = b.id AND t.status != 'returned'
         ORDER BY t.borrow_date DESC LIMIT 1
       ) AS current_borrower_name,
       (
         SELECT t.due_date FROM transactions t
         WHERE t.book_id = b.id AND t.status != 'returned'
         ORDER BY t.borrow_date DESC LIMIT 1
       ) AS current_borrower_due_date
     FROM books b
     LEFT JOIN borrow_requests br ON br.book_id = b.id AND br.status IN ('pending', 'ready')
     GROUP BY b.id, b.title, b.qty
     HAVING COUNT(br.id) FILTER (WHERE br.status IN ('pending', 'ready')) > 0
     ORDER BY pending_count DESC, b.title ASC`,
  );
  return rows;
}

async function findByUserId(userId) {
  const { rows } = await getPool().query(
    `SELECT ${SELECT_FIELDS},
      (
        SELECT COUNT(*)::int + 1
        FROM borrow_requests earlier
        WHERE earlier.book_id = br.book_id
          AND earlier.status = 'pending'
          AND earlier.created_at < br.created_at
      ) AS queue_position
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.user_id = $1
     ORDER BY br.created_at DESC`,
    [userId],
  );
  return rows;
}

async function findById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findActiveByUserAndBook(userId, bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT id, status FROM borrow_requests
     WHERE user_id = $1 AND book_id = $2 AND status = ANY($3::varchar[])`,
    [userId, bookId, ACTIVE_HOLD_STATUSES],
  );
  return rows[0] || null;
}

async function countPendingHoldsByBook(bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM borrow_requests
     WHERE book_id = $1 AND status = 'pending'`,
    [bookId],
  );
  return rows[0].count;
}

async function countActiveHoldsByBook(bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count FROM borrow_requests
     WHERE book_id = $1 AND status = ANY($2::varchar[])`,
    [bookId, ACTIVE_HOLD_STATUSES],
  );
  return rows[0].count;
}

async function getActiveHoldCountsByBookIds(bookIds, client) {
  if (!bookIds.length) return new Map();
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT book_id, COUNT(*)::int AS count
     FROM borrow_requests
     WHERE book_id = ANY($1::int[])
       AND status = ANY($2::varchar[])
     GROUP BY book_id`,
    [bookIds, ACTIVE_HOLD_STATUSES],
  );
  return new Map(rows.map((row) => [row.book_id, row.count]));
}

async function findOldestPendingByBook(bookId, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.book_id = $1 AND br.status = 'pending'
     ORDER BY br.created_at ASC LIMIT 1`,
    [bookId],
  );
  return rows[0] || null;
}

async function findReadyPastCollectBy(client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT ${SELECT_FIELDS}
     FROM borrow_requests br
     JOIN users u ON u.id = br.user_id
     JOIN books b ON b.id = br.book_id
     WHERE br.status = 'ready' AND br.collect_by < CURRENT_DATE`,
  );
  return rows;
}

async function findBooksNeedingPromotion(client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `SELECT DISTINCT b.id AS book_id
     FROM books b
     JOIN borrow_requests br ON br.book_id = b.id AND br.status = 'pending'
     WHERE b.qty > 0
       AND NOT EXISTS (
         SELECT 1 FROM borrow_requests r
         WHERE r.book_id = b.id AND r.status = 'ready'
       )`,
  );
  return rows;
}

async function create({ userId, bookId }, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO borrow_requests (user_id, book_id, status)
     VALUES ($1, $2, 'pending') RETURNING id`,
    [userId, bookId],
  );
  return rows[0].id;
}

async function markReady(id, { readyAt, collectBy }, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE borrow_requests SET status = 'ready', ready_at = $1, collect_by = $2 WHERE id = $3`,
    [readyAt, collectBy, id],
  );
}

async function updateStatus(id, status, { adminNote, reviewedBy, borrowId } = {}, client) {
  const db = client || getPool();
  await db.query(
    `UPDATE borrow_requests
     SET status = $1,
         admin_note = COALESCE($2, admin_note),
         reviewed_by = COALESCE($3, reviewed_by),
         reviewed_at = CASE WHEN $3 IS NOT NULL THEN NOW() ELSE reviewed_at END,
         borrow_id = COALESCE($4, borrow_id)
     WHERE id = $5`,
    [status, adminNote || null, reviewedBy || null, borrowId || null, id],
  );
}

module.exports = {
  ACTIVE_HOLD_STATUSES,
  findAll,
  findPaginated,
  findQueueSummary,
  findByUserId,
  findById,
  findActiveByUserAndBook,
  countPendingHoldsByBook,
  countActiveHoldsByBook,
  getActiveHoldCountsByBookIds,
  findOldestPendingByBook,
  findReadyPastCollectBy,
  findBooksNeedingPromotion,
  create,
  markReady,
  updateStatus,
};
