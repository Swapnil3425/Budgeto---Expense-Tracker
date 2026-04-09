const express = require('express');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups
router.post('/', async (req, res) => {
  try {
    const group = await Group.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/groups/:id/expenses
router.post('/:id/expenses', async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.expenses.push(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/groups/:id/settle/:expenseId
router.put('/:id/settle/:expenseId', async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const expense = group.expenses.id(req.params.expenseId);
    if (expense) { expense.settled = true; }
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/groups/:id
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!group) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
