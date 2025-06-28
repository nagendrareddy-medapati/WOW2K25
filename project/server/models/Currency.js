import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 3
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  symbol: {
    type: String,
    required: true,
    maxlength: 5
  },
  cryptoEquivalent: {
    type: String,
    required: true,
    maxlength: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Currency = mongoose.model('Currency', currencySchema);

export default Currency;