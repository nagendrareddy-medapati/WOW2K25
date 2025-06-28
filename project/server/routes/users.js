import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}));

// @route   GET /api/users/all
// @desc    Get all users (for recipient selection)
// @access  Private
router.get('/all', auth, asyncHandler(async (req, res) => {
  const users = await User.find(
    { 
      isActive: true,
      _id: { $ne: req.user.userId } // Exclude current user
    },
    {
      email: 1,
      'profile.fullName': 1,
      'profile.country': 1,
      'profile.preferredCurrency': 1,
      'profile.isVerified': 1
    }
  ).limit(50); // Limit to 50 users for performance

  const formattedUsers = users.map(user => ({
    id: user._id,
    email: user.email,
    full_name: user.profile.fullName,
    country: user.profile.country,
    preferred_currency: user.profile.preferredCurrency,
    is_verified: user.profile.isVerified
  }));

  res.json({
    success: true,
    users: formattedUsers
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { fullName, country, preferredCurrency, phone } = req.body;
  
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update profile fields
  if (fullName) user.profile.fullName = fullName;
  if (country) user.profile.country = country;
  if (preferredCurrency) user.profile.preferredCurrency = preferredCurrency;
  if (phone) user.profile.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      email: user.email,
      profile: user.profile
    }
  });
}));

export default router;