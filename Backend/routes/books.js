const express = require('express');
const libraryService = require('../services/libraryService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const books = await libraryService.getAllBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await libraryService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }
    const book = await libraryService.createBook(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const book = await libraryService.updateBook(req.params.id, req.body);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await libraryService.deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
