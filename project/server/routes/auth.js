import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.js';
import Session from '../models/Session.js';
import Wallet from '../models/Wallet.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Validation rules
const signupValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, fullName, country = 'US', preferredCurrency = 'USD' } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    email,
    password,
    profile: {
      fullName,
      country,
      preferredCurrency
    }
  });

  await user.save();

  // Create default wallet
  const wallet = new Wallet({
    userId: user._id,
    currency: preferredCurrency,
    balance: 1000.00 // Starting bonus
  });
  await wallet.save();

  // Generate token and create session
  const token = generateToken(user._id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = new Session({
    userId: user._id,
    token,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  await session.save();

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile
    },
    session: {
      token,
      expiresAt
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Increment failed login attempts
    await user.incLoginAttempts();
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Reset failed login attempts and update last login
  await user.resetLoginAttempts();

  // Generate token and create session
  const token = generateToken(user._id);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = new Session({
    userId: user._id,
    token,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  await session.save();

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile
    },
    session: {
      token,
      expiresAt
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate session
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // Invalidate session
    await Session.updateOne(
      { token, isActive: true },
      { isActive: false }
    );
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   GET /api/auth/validate
// @desc    Validate session token
// @access  Private
router.get('/validate', asyncHandler(async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists and is active
    const session = await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check if user is still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      },
      session: {
        token,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}));

export default router;