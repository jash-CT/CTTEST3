const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['add','transfer_sent','transfer_received'], required: true },
  amount: { type: Number, required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
