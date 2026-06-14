const express = require('express');
const libraryService = require('../services/libraryService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const members = await libraryService.getAllMembers();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await libraryService.getMemberById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, membership_date } = req.body;
    if (!name || !email || !membership_date) {
      return res.status(400).json({ error: 'Name, email, and membership date are required' });
    }
    const member = await libraryService.createMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const member = await libraryService.updateMember(req.params.id, req.body);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await libraryService.deleteMember(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
