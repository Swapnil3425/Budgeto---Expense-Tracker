const mongoose = require('mongoose');

const groupExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  splitAmong: [{ name: String, share: Number }],
  category: { type: String, default: 'Other' },
  date: { type: Date, default: Date.now },
  settled: { type: Boolean, default: false },
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  members: [{ name: String, email: String }],
  expenses: [groupExpenseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Group', groupSchema);
