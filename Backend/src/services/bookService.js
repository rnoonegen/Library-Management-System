const bookRepository = require('../repositories/bookRepository');
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
    abstract: data.abstract || null,
    date_of_publication: data.date_of_publication || null,
    grade_level: data.grade_level || null,
  };
}

async function listBooks(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const search = query.search || "";
  return getBooksPaginated(pageNum, limitNum, search);
}

async function listAvailableBooks() {
  return bookRepository.findAvailable();
}

async function getBooksPaginated(page = 1, limit = 10, search = '') {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const { books, total } = await bookRepository.findPaginated(safePage, safeLimit, search);

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

  const id = await bookRepository.create(normalizeBookInput(data));
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
    abstract: data.abstract !== undefined ? data.abstract || null : existing.abstract,
    date_of_publication:
      data.date_of_publication !== undefined
        ? data.date_of_publication || null
        : existing.date_of_publication,
    grade_level: data.grade_level !== undefined ? data.grade_level || null : existing.grade_level,
  };

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
  listAvailableBooks,
  createBook,
  updateBook,
  deleteBook,
};
