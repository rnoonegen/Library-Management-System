const { getPool } = require('../config/connection');
const {
  BOOK_LANGUAGES,
  BOOK_SUBJECTS,
  mergeCatalogOptions,
} = require('../constants/bookCatalog');

const BOOK_COLUMNS = `isbn, title, publisher, author, qty, price, subject, language, abstract, date_of_publication, grade_level`;

function parseFilterList(value) {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      items
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function buildListFilters({ search = '', subject = '', language = '' } = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  const term = search.trim();
  if (term.length > 0) {
    conditions.push(`title ILIKE $${paramIndex}`);
    params.push(`%${term}%`);
    paramIndex += 1;
  }

  const subjectFilters = parseFilterList(subject);
  if (subjectFilters.length > 0) {
    const placeholders = subjectFilters.map((_, index) => `LOWER($${paramIndex + index})`);
    conditions.push(`LOWER(subject) IN (${placeholders.join(', ')})`);
    params.push(...subjectFilters.map((item) => item.toLowerCase()));
    paramIndex += subjectFilters.length;
  }

  const languageFilters = parseFilterList(language);
  if (languageFilters.length > 0) {
    const placeholders = languageFilters.map((_, index) => `LOWER($${paramIndex + index})`);
    conditions.push(`LOWER(language) IN (${placeholders.join(', ')})`);
    params.push(...languageFilters.map((item) => item.toLowerCase()));
    paramIndex += languageFilters.length;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params, paramIndex };
}

async function findAll() {
  const { rows } = await getPool().query('SELECT * FROM books ORDER BY title');
  return rows;
}

async function findPaginated(page, limit, filters = {}) {
  const offset = (page - 1) * limit;
  const { whereClause, params, paramIndex } = buildListFilters(filters);

  const { rows: countRows } = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM books ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  const { rows } = await getPool().query(
    `SELECT * FROM books ${whereClause} ORDER BY title LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
  );

  return { books: rows, total };
}

async function findFilterOptions() {
  const pool = getPool();
  const [subjectsResult, languagesResult] = await Promise.all([
    pool.query(`
      SELECT DISTINCT subject
      FROM books
      WHERE subject IS NOT NULL AND TRIM(subject) <> ''
      ORDER BY subject
    `),
    pool.query(`
      SELECT DISTINCT language
      FROM books
      WHERE language IS NOT NULL AND TRIM(language) <> ''
      ORDER BY language
    `),
  ]);

  return {
    subjects: mergeCatalogOptions(
      BOOK_SUBJECTS,
      subjectsResult.rows.map((row) => row.subject),
    ),
    languages: mergeCatalogOptions(
      BOOK_LANGUAGES,
      languagesResult.rows.map((row) => row.language),
    ),
  };
}

async function findById(id, client) {
  const db = client || getPool();
  const { rows } = await db.query('SELECT * FROM books WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const { rows } = await getPool().query(
    `INSERT INTO books (${BOOK_COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
    [
      data.isbn,
      data.title,
      data.publisher,
      data.author,
      data.qty,
      data.price,
      data.subject,
      data.language,
      data.abstract,
      data.date_of_publication,
      data.grade_level,
    ],
  );
  return rows[0].id;
}

async function update(id, data) {
  await getPool().query(
    `UPDATE books SET isbn=$1, title=$2, publisher=$3, author=$4, qty=$5, price=$6,
     subject=$7, language=$8, abstract=$9, date_of_publication=$10, grade_level=$11 WHERE id=$12`,
    [
      data.isbn,
      data.title,
      data.publisher,
      data.author,
      data.qty,
      data.price,
      data.subject,
      data.language,
      data.abstract,
      data.date_of_publication,
      data.grade_level,
      id,
    ],
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
  findFilterOptions,
  findAvailable,
  findById,
  create,
  update,
  remove,
  decrementQty,
  incrementQty,
  getInventoryStats,
};
