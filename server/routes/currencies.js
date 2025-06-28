import express from 'express';
import Currency from '../models/Currency.js';
import ExchangeRate from '../models/ExchangeRate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// @route   GET /api/currencies
// @desc    Get all active currencies
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const currencies = await Currency.find({ isActive: true }).sort({ code: 1 });

  res.json({
    success: true,
    currencies
  });
}));

// @route   GET /api/currencies/exchange-rates
// @desc    Get all exchange rates
// @access  Public
router.get('/exchange-rates', asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  let query = {};
  if (from && to) {
    query = { fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase() };
  }

  const exchangeRates = await ExchangeRate.find(query).sort({ fromCurrency: 1, toCurrency: 1 });

  res.json({
    success: true,
    exchangeRates
  });
}));

// @route   GET /api/currencies/exchange-rate/:from/:to
// @desc    Get specific exchange rate
// @access  Public
router.get('/exchange-rate/:from/:to', asyncHandler(async (req, res) => {
  const { from, to } = req.params;

  const exchangeRate = await ExchangeRate.findOne({
    fromCurrency: from.toUpperCase(),
    toCurrency: to.toUpperCase()
  });

  if (!exchangeRate) {
    return res.status(404).json({
      success: false,
      message: 'Exchange rate not found'
    });
  }

  res.json({
    success: true,
    exchangeRate
  });
}));

export default router;