const bookService = require('../services/bookService');
const { AppError } = require('../middleware');

async function listBooks(req, res) {
  const result = await bookService.listBooks(req.query);
  res.json(result);
}

async function createBook(req, res) {
  const book = await bookService.createBook(req.body);
  res.status(201).json(book);
}

async function updateBook(req, res) {
  const book = await bookService.updateBook(req.params.id, req.body);
  if (!book) throw new AppError('Book not found', 404);
  res.json(book);
}

async function deleteBook(req, res) {
  const deleted = await bookService.deleteBook(req.params.id);
  if (!deleted) throw new AppError('Book not found', 404);
  res.json({ message: 'Book deleted successfully' });
}

async function listAvailableBooks(req, res) {
  const books = await bookService.listAvailableBooks();
  res.json(books);
}

async function listBookFilters(req, res) {
  const filters = await bookService.listBookFilters();
  res.json(filters);
}

async function listBookTypeCounts(req, res) {
  const counts = await bookService.listBookTypeCounts(req.query);
  res.json(counts);
}

module.exports = {
  listBooks,
  listAvailableBooks,
  listBookFilters,
  listBookTypeCounts,
  createBook,
  updateBook,
  deleteBook,
};
