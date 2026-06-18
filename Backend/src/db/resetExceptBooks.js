const { getPool } = require("../config/connection");
const { runMigrations } = require("./migrate");

/**
 * Drops every table except `books` (book data is kept), then re-runs migrations
 * to recreate empty users, transactions, and request tables + default admin.
 * Restores books.qty for copies that were out on loan before the reset.
 */
async function resetExceptBooks() {
  const pool = getPool();

  const { rows: borrowedPerBook } = await pool.query(`
    SELECT book_id, COUNT(*)::int AS borrowed_count
    FROM transactions
    WHERE status != 'returned'
    GROUP BY book_id
  `);

  const { rows } = await pool.query(
    `SELECT tablename FROM pg_tables
     WHERE schemaname = 'public' AND tablename != 'books'`,
  );

  if (rows.length > 0) {
    const names = rows.map((r) => `"${r.tablename}"`).join(", ");
    await pool.query(`DROP TABLE IF EXISTS ${names} CASCADE`);
  }

  await runMigrations();

  for (const { book_id, borrowed_count } of borrowedPerBook) {
    await pool.query("UPDATE books SET qty = qty + $1 WHERE id = $2", [
      borrowed_count,
      book_id,
    ]);
  }

  const { rows: bookCount } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM books",
  );

  const tableCounts = {};
  const { rows: tables } = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'books' ORDER BY tablename",
  );
  for (const { tablename } of tables) {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM "${tablename}"`,
    );
    tableCounts[tablename] = countRows[0].count;
  }

  const { rows: qtyFix } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM books WHERE qty = 0",
  );

  return {
    booksKept: bookCount[0].count,
    tableCounts,
    booksRestored: borrowedPerBook.length,
    booksStillZeroQty: qtyFix[0].count,
  };
}

module.exports = { resetExceptBooks };
