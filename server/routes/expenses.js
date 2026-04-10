const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(protect);

// GET /api/expenses
router.get('/', asyncHandler(async (req, res) => {
  const { category, startDate, endDate, type, limit = 100 } = req.query;
  const filter = { userId: req.user._id };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  const expenses = await Expense.find(filter).sort({ date: -1 }).limit(Number(limit));
  res.json(expenses);
}));

// POST /api/expenses
router.post('/', asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, userId: req.user._id });
  res.status(201).json(expense);
}));

// PUT /api/expenses/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json(expense);
}));

// DELETE /api/expenses/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  res.json({ message: 'Deleted' });
}));

// GET /api/expenses/summary - monthly summary
router.get('/summary', asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const expenses = await Expense.find({
    userId: req.user._id,
    date: { $gte: start },
    type: 'expense',
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  res.json({ total, byCategory, count: expenses.length });
}));

module.exports = router;
