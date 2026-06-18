require("dotenv").config();
const { connectPostgreSQL, getPool } = require("../src/config/connection");
const { getDbModeLabel } = require("../src/config/database");

connectPostgreSQL().then(async () => {
  console.log("Connected to:", getDbModeLabel());
  const pool = getPool();
  const { rows: tables } = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );
  for (const { tablename } of tables) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM "${tablename}"`,
    );
    console.log(`  ${tablename}: ${rows[0].count}`);
  }
  process.exit(0);
});
