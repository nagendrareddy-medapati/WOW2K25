import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profile: {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    country: {
      type: String,
      default: 'US',
      maxlength: 2
    },
    preferredCurrency: {
      type: String,
      default: 'USD',
      maxlength: 3
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    avatarUrl: String,
    phone: String
  },
  security: {
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    passwordChangedAt: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ 'security.lockUntil': 1 });

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.security.passwordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.failedLoginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.failedLoginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 15 minutes
  if (this.security.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 15 * 60 * 1000 }; // 15 minutes
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'security.lockUntil': 1 },
    $set: { 
      'security.failedLoginAttempts': 0,
      'security.lastLogin': Date.now()
    }
  });
};

// Static method to find user by email (excluding locked accounts)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(),
    isActive: true
  });
};

const User = mongoose.model('User', userSchema);

export default User;