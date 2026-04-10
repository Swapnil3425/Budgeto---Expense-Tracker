const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  icon: { type: String, default: '🎯' },
  color: { type: String, default: '#FF7733' },
}, { timestamps: true });

goalSchema.index({ userId: 1 });

module.exports = mongoose.model('Goal', goalSchema);
