const { hashPassword } = require("../utils/password");
const { getPool } = require("../config/connection");

const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const MIGRATION_TEMP_PASSWORD = process.env.SEED_TEMP_PASSWORD || "Temp@123";

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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
      user_code VARCHAR(10) UNIQUE,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      grade_level VARCHAR(50),
      department VARCHAR(100),
      joined_date DATE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      must_change_password BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS role VARCHAR(20),
      ADD COLUMN IF NOT EXISTS user_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS joined_date DATE,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `);

  await pool.query(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
  `);
  await pool.query(`
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'teacher', 'student'))
  `);

  await migrateLegacyUserSchema(pool);
  await ensureTransactionsUserId(pool);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      book_id INTEGER NOT NULL REFERENCES books(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
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
    CREATE TABLE IF NOT EXISTS borrow_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      book_id INTEGER NOT NULL REFERENCES books(id),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TIMESTAMP,
      borrow_id INTEGER REFERENCES transactions(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS extension_requests (
      id SERIAL PRIMARY KEY,
      borrow_id INTEGER NOT NULL REFERENCES transactions(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      current_due_date DATE NOT NULL,
      requested_due_date DATE NOT NULL,
      reason TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      admin_note TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE borrow_requests
      ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS collect_by DATE
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      related_id INTEGER,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS borrow_requests_one_active_per_user_book
    ON borrow_requests (user_id, book_id)
    WHERE status IN ('pending', 'ready')
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON transactions (user_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_book_status
    ON transactions (book_id, status)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_status_due
    ON transactions (status, due_date)
    WHERE status != 'returned'
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_borrow_requests_book_status
    ON borrow_requests (book_id, status)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_borrow_requests_user_id
    ON borrow_requests (user_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON notifications (user_id, is_read)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_title_lower
    ON books (LOWER(title))
  `);
  await pool.query(`
    ALTER TABLE books
      ADD COLUMN IF NOT EXISTS language VARCHAR(50)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_subject_lower
    ON books (LOWER(subject))
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_language_lower
    ON books (LOWER(language))
  `);
  await pool.query(`
    ALTER TABLE books
      ADD COLUMN IF NOT EXISTS book_type VARCHAR(20) NOT NULL DEFAULT 'borrow'
  `);
  await pool.query(`
    ALTER TABLE books DROP CONSTRAINT IF EXISTS books_book_type_check
  `);
  await pool.query(`
    ALTER TABLE books ADD CONSTRAINT books_book_type_check
      CHECK (book_type IN ('borrow', 'reference'))
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_book_type
    ON books (book_type)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_role_status
    ON users (role, status)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON refresh_tokens (user_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
    ON refresh_tokens (expires_at)
  `);

  await seedAdmin(pool);
}

// Upgrades old databases: renames user columns and imports rows from the legacy `members` table.
// SQL below must keep legacy table/column names (`members`, `member_id`, etc.) to detect old schema.
async function migrateLegacyUserSchema(pool) {
  await pool.query(`
    ALTER TABLE users RENAME COLUMN member_code TO user_code
  `).catch(() => {});
  await pool.query(`
    ALTER TABLE users RENAME COLUMN membership_date TO joined_date
  `).catch(() => {});

  const { rows } = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'members'
    ) AS exists
  `);

  if (!rows[0].exists) return;

  const { rows: existingUsers } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role IN ('teacher', 'student')",
  );
  if (existingUsers[0].count > 0) {
    await pool.query("DROP TABLE IF EXISTS members CASCADE");
    return;
  }

  const { rows: legacyRows } = await pool.query(
    "SELECT * FROM members ORDER BY id",
  );
  if (legacyRows.length === 0) {
    return;
  }

  const tempHash = await hashPassword(MIGRATION_TEMP_PASSWORD);
  const idMap = new Map();

  for (let i = 0; i < legacyRows.length; i++) {
    const legacyRow = legacyRows[i];
    const code = `S${String(i + 1).padStart(4, "0")}`;
    const { rows: inserted } = await pool.query(
      `INSERT INTO users (
        username, password_hash, role, user_code, name, email, phone,
        address, joined_date, status, must_change_password
      ) VALUES ($1, $2, 'student', $3, $4, $5, $6, $7, $8, $9, true)
      ON CONFLICT (username) DO NOTHING
      RETURNING id`,
      [
        code,
        tempHash,
        code,
        legacyRow.name,
        legacyRow.email,
        legacyRow.phone,
        legacyRow.address,
        legacyRow.membership_date,
        legacyRow.status,
      ],
    );

    if (inserted[0]) {
      idMap.set(legacyRow.id, inserted[0].id);
    } else {
      const { rows: existing } = await pool.query(
        "SELECT id FROM users WHERE user_code = $1",
        [code],
      );
      if (existing[0]) idMap.set(legacyRow.id, existing[0].id);
    }
  }

  const { rows: txCols } = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'member_id'
  `);

  if (txCols.length > 0 && idMap.size > 0) {
    await pool.query(`
      ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_member_id_fkey
    `);
    for (const [oldId, newId] of idMap) {
      await pool.query(
        "UPDATE transactions SET member_id = $1 WHERE member_id = $2",
        [newId, oldId],
      );
    }
  }
}

async function ensureTransactionsUserId(pool) {
  const { rows: cols } = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'transactions'
      AND column_name IN ('member_id', 'user_id')
  `);
  const names = cols.map((c) => c.column_name);

  if (names.includes("member_id") && !names.includes("user_id")) {
    await pool.query(`
      ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_member_id_fkey
    `);
    await pool.query(`
      ALTER TABLE transactions RENAME COLUMN member_id TO user_id
    `);
  }

  if (!names.includes("user_id") && !names.includes("member_id")) {
    return;
  }

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_id_fkey'
      ) THEN
        ALTER TABLE transactions
          ADD CONSTRAINT transactions_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'members'
      ) THEN
        DROP TABLE members;
      END IF;
    EXCEPTION
      WHEN dependent_objects_still_exist THEN NULL;
    END $$
  `);
}

async function seedAdmin(pool) {
  if (!ADMIN_PASSWORD) {
    console.warn("SEED_ADMIN_PASSWORD not set — skipping admin user seed");
    return;
  }
  const hash = await hashPassword(ADMIN_PASSWORD);
  await pool.query(
    `INSERT INTO users (
      username, password_hash, role, name, status, must_change_password
    ) VALUES ('admin', $1, 'admin', 'Library Admin', 'active', false)
    ON CONFLICT (username) DO NOTHING`,
    [hash],
  );
}

module.exports = { runMigrations };
