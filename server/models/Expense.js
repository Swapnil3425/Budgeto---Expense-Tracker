const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Travel', 'Investment', 'Other'],
    default: 'Other',
  },
  description: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'], default: 'Cash' },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
