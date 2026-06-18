const crypto = require("crypto");
const { getPool } = require("../config/connection");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(48).toString("hex");
}

async function create(userId, token, expiresAt, client) {
  const db = client || getPool();
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hashToken(token), expiresAt],
  );
}

async function findValid(token) {
  const { rows } = await getPool().query(
    `SELECT rt.user_id, u.username, u.role, u.must_change_password, u.status
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
    [hashToken(token)],
  );
  return rows[0] || null;
}

async function revoke(token, client) {
  const db = client || getPool();
  await db.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [
    hashToken(token),
  ]);
}

async function revokeAllForUser(userId, client) {
  const db = client || getPool();
  await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
}

module.exports = {
  generateToken,
  create,
  findValid,
  revoke,
  revokeAllForUser,
};
