const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: String, required: true }, // "YYYY-MM"
}, { timestamps: true });

budgetSchema.index({ userId: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
