const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
  nextBilling: { type: Date },
  category: { type: String, default: 'Entertainment' },
  icon: { type: String, default: '📺' },
  color: { type: String, default: '#A855F7' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
