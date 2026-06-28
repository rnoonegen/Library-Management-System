const { getPool } = require('../config/connection');

const BOOK_COLUMNS = `isbn, title, publisher, author, qty, price, subject, language, abstract, date_of_publication, grade_level, book_type`;

function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFieldFilter(column, values, params, paramIndex) {
  const list = normalizeStringArray(values);
  if (list.length === 0) {
    return { condition: null, paramIndex };
  }

  const includesOther = list.includes('Other');
  const regular = list.filter((item) => item !== 'Other');
  const parts = [];

  if (regular.length > 0) {
    parts.push(`${column} = ANY($${paramIndex}::text[])`);
    params.push(regular);
    paramIndex += 1;
  }

  if (includesOther) {
    parts.push(`(${column} IS NULL OR TRIM(${column}) = '')`);
  }

  return {
    condition: parts.length === 1 ? parts[0] : `(${parts.join(' OR ')})`,
    paramIndex,
  };
}

function buildListFilters({ search = '', book_type = '', subjects = [], languages = [] } = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  const term = search.trim();
  if (term.length > 0) {
    conditions.push(`title ILIKE $${paramIndex}`);
    params.push(`%${term}%`);
    paramIndex += 1;
  }

  const bookType = String(book_type || '').trim().toLowerCase();
  if (bookType === 'borrow' || bookType === 'reference' || bookType === 'sell') {
    conditions.push(`book_type = $${paramIndex}`);
    params.push(bookType);
    paramIndex += 1;
  }

  const subjectFilter = buildFieldFilter('subject', subjects, params, paramIndex);
  if (subjectFilter.condition) {
    conditions.push(subjectFilter.condition);
    paramIndex = subjectFilter.paramIndex;
  }

  const languageFilter = buildFieldFilter('language', languages, params, paramIndex);
  if (languageFilter.condition) {
    conditions.push(languageFilter.condition);
    paramIndex = languageFilter.paramIndex;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, params, paramIndex };
}

async function findAll() {
  const { rows } = await getPool().query('SELECT * FROM books ORDER BY title');
  return rows;
}

function buildOrderClause({ book_type = '', sort = '' } = {}) {
  const bookType = String(book_type || '').trim().toLowerCase();
  const sortKey = String(sort || '').trim().toLowerCase();

  if (bookType === 'sell' && sortKey === 'price_asc') {
    return 'ORDER BY price ASC NULLS LAST, title ASC';
  }
  if (bookType === 'sell' && sortKey === 'price_desc') {
    return 'ORDER BY price DESC NULLS LAST, title ASC';
  }

  return 'ORDER BY title ASC';
}

async function findPaginated(page, limit, filters = {}) {
  const offset = (page - 1) * limit;
  const { whereClause, params, paramIndex } = buildListFilters(filters);
  const orderClause = buildOrderClause(filters);

  const { rows: countRows } = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM books ${whereClause}`,
    params,
  );
  const total = countRows[0].total;

  const { rows } = await getPool().query(
    `SELECT * FROM books ${whereClause} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
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
    `INSERT INTO books (${BOOK_COLUMNS}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
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
      data.book_type,
    ],
  );
  return rows[0].id;
}

async function update(id, data) {
  await getPool().query(
    `UPDATE books SET isbn=$1, title=$2, publisher=$3, author=$4, qty=$5, price=$6,
     subject=$7, language=$8, abstract=$9, date_of_publication=$10, grade_level=$11, book_type=$12 WHERE id=$13`,
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
      data.book_type,
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
     FROM books WHERE qty > 0 AND book_type = 'borrow'
     ORDER BY title`,
  );
  return rows;
}

async function getTypeCounts(filters = {}) {
  const { whereClause, params } = buildListFilters({ ...filters, book_type: '' });
  const { rows } = await getPool().query(
    `SELECT book_type, COUNT(*)::int AS count
     FROM books ${whereClause}
     GROUP BY book_type`,
    params,
  );

  const counts = { borrow: 0, reference: 0, sell: 0 };
  rows.forEach((row) => {
    if (Object.prototype.hasOwnProperty.call(counts, row.book_type)) {
      counts[row.book_type] = row.count;
    }
  });

  return {
    all: counts.borrow + counts.reference + counts.sell,
    ...counts,
  };
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
  getTypeCounts,
  getInventoryStats,
};
