const { getPool } = require("../config/connection");

const PUBLIC_FIELDS = `
  id, username, role, user_code, name, email, phone, address,
  grade_level, department, joined_date, status, must_change_password, created_at
`;

async function findAll({ role } = {}) {
  const params = [];
  let where = "";
  if (role) {
    where = "WHERE role = $1";
    params.push(role);
  }
  const { rows } = await getPool().query(
    `SELECT ${PUBLIC_FIELDS} FROM users ${where} ORDER BY name, username`,
    params,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const { rows } = await getPool().query(
    "SELECT * FROM users WHERE username = $1",
    [username],
  );
  return rows[0] || null;
}

async function findAuthById(id) {
  const { rows } = await getPool().query(
    "SELECT * FROM users WHERE id = $1",
    [id],
  );
  return rows[0] || null;
}

async function getNextUserCode(prefix) {
  const { rows } = await getPool().query(
    `SELECT user_code FROM users
     WHERE user_code LIKE $1
     ORDER BY user_code DESC LIMIT 1`,
    [`${prefix}%`],
  );
  const last = rows[0]?.user_code;
  const num = last ? parseInt(last.slice(1), 10) + 1 : 1;
  return `${prefix}${String(num).padStart(4, "0")}`;
}

async function create(data) {
  const { rows } = await getPool().query(
    `INSERT INTO users (
      username, password_hash, role, user_code, name, email, phone,
      address, grade_level, department, joined_date, status, must_change_password
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING id`,
    [
      data.username,
      data.password_hash,
      data.role,
      data.user_code,
      data.name,
      data.email,
      data.phone,
      data.address,
      data.grade_level,
      data.department,
      data.joined_date,
      data.status,
      data.must_change_password,
    ],
  );
  return rows[0].id;
}

async function update(id, data) {
  await getPool().query(
    `UPDATE users SET
      name = $1, email = $2, phone = $3, address = $4,
      grade_level = $5, department = $6, joined_date = $7,
      status = $8, updated_at = NOW()
    WHERE id = $9`,
    [
      data.name,
      data.email,
      data.phone,
      data.address,
      data.grade_level,
      data.department,
      data.joined_date,
      data.status,
      id,
    ],
  );
}

async function updatePassword(id, passwordHash, mustChange = false) {
  await getPool().query(
    `UPDATE users SET password_hash = $1, must_change_password = $2, updated_at = NOW()
     WHERE id = $3`,
    [passwordHash, mustChange, id],
  );
}

async function remove(id) {
  const { rowCount } = await getPool().query(
    "DELETE FROM users WHERE id = $1 AND role != 'admin'",
    [id],
  );
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  findAuthById,
  getNextUserCode,
  create,
  update,
  updatePassword,
  remove,
};
