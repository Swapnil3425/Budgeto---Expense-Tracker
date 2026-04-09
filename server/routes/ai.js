const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// POST /api/ai/insights
// Returns AI spending insights (mocked with smart logic)
router.post('/insights', async (req, res) => {
  try {
    const { expenses = [], totalSpent = 0, monthlyBudget = 50000, topCategory = 'Food' } = req.body;

    const budgetPercent = Math.round((totalSpent / monthlyBudget) * 100);
    const healthScore = Math.max(0, Math.min(100, 100 - budgetPercent + 30));

    const insights = [
      {
        type: 'warning',
        icon: '⚠️',
        title: 'Budget Alert',
        message: `You've used ${budgetPercent}% of your monthly budget. ${
          budgetPercent > 80
            ? 'You are at high risk of exceeding your budget this month.'
            : 'You are on track to meet your budget goal.'
        }`,
      },
      {
        type: 'info',
        icon: '🍔',
        title: 'Top Spending Category',
        message: `${topCategory} is your highest spending category this month. Consider setting a stricter limit to save more.`,
      },
      {
        type: 'tip',
        icon: '💡',
        title: 'Savings Opportunity',
        message: `Based on your spending pattern, reducing discretionary expenses by 15% could save you ₹${Math.round(totalSpent * 0.15).toLocaleString('en-IN')} this month.`,
      },
      {
        type: 'success',
        icon: '🎯',
        title: 'Smart Prediction',
        message: `At your current spending rate, you're projected to spend ₹${Math.round(totalSpent * 1.08).toLocaleString('en-IN')} this month.`,
      },
    ];

    res.json({
      insights,
      healthScore: Math.round(healthScore),
      healthLabel: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor',
      prediction: Math.round(totalSpent * 1.08),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
