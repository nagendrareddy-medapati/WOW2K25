import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipientEmail: String,
  type: {
    type: String,
    enum: ['send', 'receive'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  convertedAmount: Number,
  convertedCurrency: String,
  exchangeRate: Number,
  cryptoRoute: String,
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  savings: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  purpose: {
    type: String,
    enum: ['family_support', 'business', 'education', 'medical', 'other'],
    default: 'other'
  },
  message: String,
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  estimatedArrival: String,
  completedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ senderId: 1 });
transactionSchema.index({ recipientId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Generate transaction ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;