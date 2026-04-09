const express = require('express');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { userId: req.user._id };
    if (month) filter.month = month;
    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    let budget = await Budget.findOne({ userId: req.user._id, category, month });
    if (budget) {
      budget.limit = limit;
      await budget.save();
    } else {
      budget = await Budget.create({ userId: req.user._id, category, limit, month });
    }
    res.status(201).json(budget);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
