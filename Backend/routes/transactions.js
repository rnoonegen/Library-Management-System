const express = require('express');
const libraryService = require('../services/libraryService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const transactions = await libraryService.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/borrow', async (req, res) => {
  try {
    const { book_id, member_id, borrow_date, due_date } = req.body;
    if (!book_id || !member_id || !borrow_date || !due_date) {
      return res.status(400).json({
        error: 'book_id, member_id, borrow_date, and due_date are required',
      });
    }
    const transaction = await libraryService.borrowBook(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/return', async (req, res) => {
  try {
    const transaction = await libraryService.returnBook(req.params.id);
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
