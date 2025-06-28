import express from 'express';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules for creating transaction
const createTransactionValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('recipientEmail')
    .isEmail()
    .withMessage('Valid recipient email is required'),
  body('purpose')
    .isIn(['family_support', 'business', 'education', 'medical', 'other'])
    .withMessage('Invalid purpose')
];

// @route   GET /api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  
  const query = {
    $or: [
      { senderId: req.user.userId },
      { recipientId: req.user.userId }
    ]
  };

  if (status) query.status = status;
  if (type) query.type = type;

  const transactions = await Transaction.find(query)
    .populate('senderId', 'email profile.fullName')
    .populate('recipientId', 'email profile.fullName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Transaction.countDocuments(query);

  res.json({
    success: true,
    transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, createTransactionValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    amount,
    currency,
    recipientEmail,
    convertedAmount,
    convertedCurrency,
    exchangeRate,
    cryptoRoute,
    purpose,
    message
  } = req.body;

  // Find recipient
  const recipient = await User.findByEmail(recipientEmail);
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient not found'
    });
  }

  // Check sender's wallet balance
  const senderWallet = await Wallet.findOne({
    userId: req.user.userId,
    currency: currency.toUpperCase()
  });

  if (!senderWallet) {
    return res.status(400).json({
      success: false,
      message: 'Wallet not found for this currency'
    });
  }

  const fee = amount * 0.005; // 0.5% fee
  const totalDebit = amount + fee;

  if (senderWallet.balance < totalDebit) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance'
    });
  }

  // Create transaction
  const transaction = new Transaction({
    senderId: req.user.userId,
    recipientId: recipient._id,
    recipientEmail,
    type: 'send',
    amount,
    currency: currency.toUpperCase(),
    convertedAmount,
    convertedCurrency: convertedCurrency?.toUpperCase(),
    exchangeRate,
    cryptoRoute,
    fee,
    savings: amount * 0.08, // 8% savings vs traditional banks
    purpose,
    message,
    status: 'processing',
    estimatedArrival: '30 seconds'
  });

  await transaction.save();

  // Update sender's wallet balance
  senderWallet.balance -= totalDebit;
  await senderWallet.save();

  // Simulate processing delay and completion
  setTimeout(async () => {
    try {
      // Update transaction status to completed
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: 'completed',
        completedAt: new Date()
      });

      // Update or create recipient's wallet
      if (convertedCurrency) {
        let recipientWallet = await Wallet.findOne({
          userId: recipient._id,
          currency: convertedCurrency.toUpperCase()
        });

        if (!recipientWallet) {
          recipientWallet = new Wallet({
            userId: recipient._id,
            currency: convertedCurrency.toUpperCase(),
            balance: convertedAmount || 0
          });
        } else {
          recipientWallet.balance += convertedAmount || 0;
        }

        await recipientWallet.save();
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
    }
  }, 2000); // 2 second delay to simulate processing

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    transaction
  });
}));

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    $or: [
      { senderId: req.user.userId },
      { recipientId: req.user.userId }
    ]
  })
  .populate('senderId', 'email profile.fullName')
  .populate('recipientId', 'email profile.fullName');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    transaction
  });
}));

export default router;