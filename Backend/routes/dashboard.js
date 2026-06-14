const express = require('express');
const libraryService = require('../services/libraryService');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const stats = await libraryService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
