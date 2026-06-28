const bookRepository = require('../repositories/bookRepository');
const { DEFAULT_BOOK_TYPE } = require('../constants/bookCatalog');
const { AppError } = require('../middleware');

function parsePrice(price) {
  if (price == null || price === '') return null;
  return parseFloat(price);
}

function normalizeBookInput(data) {
  return {
    isbn: data.isbn,
    title: data.title,
    publisher: data.publisher || null,
    author: data.author,
    qty: parseInt(data.qty, 10) || 1,
    price: parsePrice(data.price),
    subject: data.subject || null,
    language: data.language || null,
    abstract: data.abstract || null,
    date_of_publication: data.date_of_publication || null,
    grade_level: data.grade_level || null,
    book_type: data.book_type || DEFAULT_BOOK_TYPE,
  };
}

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

function parseListFilters(query = {}) {
  return {
    search: query.search || '',
    book_type: query.book_type || '',
    subjects: normalizeStringArray(query.subjects),
    languages: normalizeStringArray(query.languages),
    sort: query.sort || '',
  };
}

function validateBookTypeRules(data) {
  const bookType = data.book_type || DEFAULT_BOOK_TYPE;
  if (bookType === 'sell') {
    if (data.price == null || data.price <= 0) {
      throw new AppError('Price is required for books marked for sale', 400);
    }
  }
}

async function listBooks(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const filters = parseListFilters(query);
  return getBooksPaginated(pageNum, limitNum, filters);
}

async function listBookTypeCounts(query = {}) {
  const filters = parseListFilters(query);
  return bookRepository.getTypeCounts(filters);
}

async function listAvailableBooks() {
  return bookRepository.findAvailable();
}

async function getBooksPaginated(page = 1, limit = 10, filters = {}) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const { books, total } = await bookRepository.findPaginated(safePage, safeLimit, filters);

  return {
    books,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

async function createBook(data) {
  if (!data.title || !data.author || !data.isbn) {
    throw new AppError('ISBN, title, and author are required', 400);
  }

  const normalized = normalizeBookInput(data);
  validateBookTypeRules(normalized);
  const id = await bookRepository.create(normalized);
  return bookRepository.findById(id);
}

async function updateBook(id, data) {
  const existing = await bookRepository.findById(id);
  if (!existing) return null;

  const merged = {
    isbn: data.isbn ?? existing.isbn,
    title: data.title ?? existing.title,
    publisher: data.publisher ?? existing.publisher,
    author: data.author ?? existing.author,
    qty: parseInt(data.qty ?? existing.qty, 10),
    price: data.price !== undefined ? parsePrice(data.price) : existing.price,
    subject: data.subject !== undefined ? data.subject || null : existing.subject,
    language: data.language !== undefined ? data.language || null : existing.language,
    abstract: data.abstract !== undefined ? data.abstract || null : existing.abstract,
    date_of_publication:
      data.date_of_publication !== undefined
        ? data.date_of_publication || null
        : existing.date_of_publication,
    grade_level: data.grade_level !== undefined ? data.grade_level || null : existing.grade_level,
    book_type: data.book_type !== undefined ? data.book_type || DEFAULT_BOOK_TYPE : existing.book_type,
  };

  validateBookTypeRules(merged);
  await bookRepository.update(id, merged);
  return bookRepository.findById(id);
}

async function deleteBook(id) {
  const existing = await bookRepository.findById(id);
  if (!existing) return false;
  return bookRepository.remove(id);
}

module.exports = {
  listBooks,
  listBookTypeCounts,
  listAvailableBooks,
  createBook,
  updateBook,
  deleteBook,
};
