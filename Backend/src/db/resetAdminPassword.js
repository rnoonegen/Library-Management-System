require("dotenv").config();

const { connectPostgreSQL, getPool } = require("../config/connection");
const { hashPassword } = require("../utils/password");

const password = process.argv[2] || process.env.SEED_ADMIN_PASSWORD;

async function resetAdminPassword() {
  if (!password) {
    console.error("Usage: node src/db/resetAdminPassword.js <new-password>");
    console.error("Or set SEED_ADMIN_PASSWORD in Backend/.env");
    process.exit(1);
  }

  await connectPostgreSQL();
  const hash = await hashPassword(password);
  const { rowCount } = await getPool().query(
    `UPDATE users
     SET password_hash = $1, must_change_password = false, status = 'active'
     WHERE username = 'admin'`,
    [hash],
  );

  if (rowCount === 0) {
    await getPool().query(
      `INSERT INTO users (
        username, password_hash, role, name, status, must_change_password
      ) VALUES ('admin', $1, 'admin', 'Library Admin', 'active', false)`,
      [hash],
    );
    console.log("Admin user created.");
  } else {
    console.log("Admin password updated.");
  }

  console.log("Username: admin");
  process.exit(0);
}

resetAdminPassword().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
