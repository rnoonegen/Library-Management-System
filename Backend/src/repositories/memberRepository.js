const { getPool } = require("../config/connection");

async function findAll() {
  const { rows } = await getPool().query("SELECT * FROM members ORDER BY name");
  return rows;
}

async function findById(id) {
  const { rows } = await getPool().query(
    "SELECT * FROM members WHERE id = $1",
    [id],
  );
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await getPool().query(
    "INSERT INTO members (name, email, phone, address, membership_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [
      data.name,
      data.email,
      data.phone,
      data.address,
      data.membership_date,
      data.status,
    ],
  );
  return rows[0].id;
}

async function update(id, data) {
  await getPool().query(
    "UPDATE members SET name=$1, email=$2, phone=$3, address=$4, membership_date=$5, status=$6 WHERE id=$7",
    [
      data.name,
      data.email,
      data.phone,
      data.address,
      data.membership_date,
      data.status,
      id,
    ],
  );
}

async function remove(id) {
  const { rowCount } = await getPool().query(
    "DELETE FROM members WHERE id = $1",
    [id],
  );
  return rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
