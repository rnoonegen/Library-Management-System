const { getPool } = require("../config/connection");

async function runMigrations() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      isbn VARCHAR(20),
      title VARCHAR(255) NOT NULL,
      publisher VARCHAR(255),
      author VARCHAR(255),
      qty INTEGER NOT NULL DEFAULT 0,
      price NUMERIC(10, 2),
      subject VARCHAR(255),
      abstract TEXT,
      date_of_publication DATE,
      grade_level VARCHAR(50)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      membership_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      book_id INTEGER NOT NULL REFERENCES books(id),
      member_id INTEGER NOT NULL REFERENCES members(id),
      borrow_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
      daily_fine_amount INTEGER NOT NULL DEFAULT 1,
      fine_amount INTEGER,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'none',
      paid_at DATE,
      paid_amount INTEGER
    )
  `);

  await pool.query(`
    ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS daily_fine_amount INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS fine_amount INTEGER,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS paid_at DATE,
      ADD COLUMN IF NOT EXISTS paid_amount INTEGER
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'fine_per_day'
      ) THEN
        UPDATE transactions
        SET daily_fine_amount = GREATEST(
          1,
          LEAST(10, COALESCE(NULLIF(daily_fine_amount, 1), ROUND(fine_per_day)::INTEGER))
        )
        WHERE fine_per_day IS NOT NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'fine_paid'
      ) THEN
        UPDATE transactions
        SET payment_status = 'paid'
        WHERE fine_paid = TRUE AND payment_status = 'none';
      END IF;
    END $$
  `);
}

module.exports = { runMigrations };
