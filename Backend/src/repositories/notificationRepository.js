const { getPool } = require("../config/connection");

async function findByUserId(userId, { limit = 50 } = {}) {
  const { rows } = await getPool().query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

async function countUnread(userId) {
  const { rows } = await getPool().query(
    `SELECT COUNT(*)::int AS count FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
  return rows[0].count;
}

async function create({ userId, type, title, message, relatedId }, client) {
  const db = client || getPool();
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, title, message, related_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, type, title, message, relatedId || null],
  );
  return rows[0];
}

async function markRead(id, userId) {
  const { rowCount } = await getPool().query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rowCount > 0;
}

async function markAllRead(userId) {
  await getPool().query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
}

module.exports = {
  findByUserId,
  countUnread,
  create,
  markRead,
  markAllRead,
};
