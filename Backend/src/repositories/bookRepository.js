const { getPool } = require('../config/connection');

const BOOK_COLUMNS = `isbn, title, publisher, author, qty, price, subject, abstract, date_of_publication, grade_level`;

async function findAll() {
  const { rows } = await getPool().query('SELECT * FROM books ORDER BY title');
  return rows;
}

async function findPaginated(page, limit, search = '') {
  const offset = (page - 1) * limit;
  const term = search.trim();
  const hasSearch = term.length > 0;
  const pattern = `%${term}%`;

  if (hasSearch) {
    const { rows: countRows } = await getPool().query(
      'SELECT COUNT(*)::int AS total FROM books WHERE title ILIKE $1',
      [pattern]
    );
    const total = countRows[0].total;
    const { rows } = await getPool().query(
      'SELECT * FROM books WHERE title ILIKE $1 ORDER BY title LIMIT $2 OFFSET $3',
      [pattern, limit, offset]
    );
    return { books: rows, total };
  }

  const { rows: countRows } = await getPool().query('SELECT COUNT(*)::int AS total FROM books');
  const total = countRows[0].total;
  const { rows } = await getPool().query(
    'SELECT * FROM books ORDER BY title LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return { books: rows, total };
}

async function findById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query('SELECT * FROM books WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await getPool().query(
    `INSERT INTO books (${BOOK_COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [
      data.isbn,
      data.title,
      data.publisher,
      data.author,
      data.qty,
      data.price,
      data.subject,
      data.abstract,
      data.date_of_publication,
      data.grade_level,
    ]
  );
  return rows[0].id;
}

async function update(id, data) {
  await getPool().query(
    `UPDATE books SET isbn=$1, title=$2, publisher=$3, author=$4, qty=$5, price=$6,
     subject=$7, abstract=$8, date_of_publication=$9, grade_level=$10 WHERE id=$11`,
    [
      data.isbn,
      data.title,
      data.publisher,
      data.author,
      data.qty,
      data.price,
      data.subject,
      data.abstract,
      data.date_of_publication,
      data.grade_level,
      id,
    ]
  );
}

async function remove(id) {
  const { rowCount } = await getPool().query('DELETE FROM books WHERE id = $1', [id]);
  return rowCount > 0;
}

async function decrementQty(id, client) {
  const db = client || getPool();
  const { rowCount } = await db.query(
    'UPDATE books SET qty = qty - 1 WHERE id = $1 AND qty > 0',
    [id],
  );
  if (rowCount === 0) {
    const { AppError } = require('../middleware');
    throw new AppError('No copies available', 400);
  }
}

async function incrementQty(id, client) {
  const db = client || getPool();
  await db.query('UPDATE books SET qty = qty + 1 WHERE id = $1', [id]);
}

async function findAvailable() {
  const { rows } = await getPool().query(
    `SELECT id, isbn, title, author, qty
     FROM books WHERE qty > 0
     ORDER BY title`,
  );
  return rows;
}

async function getInventoryStats() {
  const { rows } = await getPool().query(`
    SELECT
      COUNT(*)::int AS total_books,
      COALESCE(SUM(qty), 0)::int AS available_copies
    FROM books
  `);
  return rows[0];
}

module.exports = {
  findAll,
  findPaginated,
  findAvailable,
  findById,
  create,
  update,
  remove,
  decrementQty,
  incrementQty,
  getInventoryStats,
};
