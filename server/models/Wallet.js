import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 3
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
    get: v => Math.round(v * 100) / 100, // Round to 2 decimal places
    set: v => Math.round(v * 100) / 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
});

// Compound index to ensure one wallet per user per currency
walletSchema.index({ userId: 1, currency: 1 }, { unique: true });

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;