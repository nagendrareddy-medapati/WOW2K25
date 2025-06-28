import express from 'express';
import Wallet from '../models/Wallet.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// @route   GET /api/wallets
// @desc    Get user's wallets
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const wallets = await Wallet.find({
    userId: req.user.userId,
    isActive: true
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    wallets
  });
}));

// @route   POST /api/wallets
// @desc    Create a new wallet
// @access  Private
router.post('/', auth, asyncHandler(async (req, res) => {
  const { currency } = req.body;

  if (!currency) {
    return res.status(400).json({
      success: false,
      message: 'Currency is required'
    });
  }

  // Check if wallet already exists for this currency
  const existingWallet = await Wallet.findOne({
    userId: req.user.userId,
    currency: currency.toUpperCase()
  });

  if (existingWallet) {
    return res.status(400).json({
      success: false,
      message: 'Wallet for this currency already exists'
    });
  }

  const wallet = new Wallet({
    userId: req.user.userId,
    currency: currency.toUpperCase(),
    balance: 0
  });

  await wallet.save();

  res.status(201).json({
    success: true,
    message: 'Wallet created successfully',
    wallet
  });
}));

// @route   PUT /api/wallets/:id/balance
// @desc    Update wallet balance (for demo purposes)
// @access  Private
router.put('/:id/balance', auth, asyncHandler(async (req, res) => {
  const { amount } = req.body;
  
  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount'
    });
  }

  const wallet = await Wallet.findOne({
    _id: req.params.id,
    userId: req.user.userId
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  wallet.balance = amount;
  await wallet.save();

  res.json({
    success: true,
    message: 'Wallet balance updated',
    wallet
  });
}));

export default router;