import mongoose from 'mongoose';

const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 3
  },
  toCurrency: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 3
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  cryptoRate: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index for currency pairs
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;