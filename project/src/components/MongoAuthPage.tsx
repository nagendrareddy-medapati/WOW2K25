import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/MongoAuthContext';
import { validateEmail, validatePassword } from '../lib/mongoAuth';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Bitcoin,
  ArrowLeft,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader,
  Check,
  X,
  Database
} from 'lucide-react';

export default function MongoAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState<{isValid: boolean; errors: string[]}>({
    isValid: false,
    errors: []
  });
  
  const { login, signup, loading, isMongoConnected } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]; // Show first error
      }
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Name validation for signup
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!isLogin && formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({...formData, password});
    if (errors.password) setErrors({...errors, password: ''});
    
    // Update password strength for signup
    if (!isLogin) {
      setPasswordStrength(validatePassword(password));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name.trim());
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Authentication failed' });
    }
  };

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Transfers",
      description: "Send money in seconds, not days",
      highlight: "30s average"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Level Security",
      description: "Your money is protected by military-grade encryption",
      highlight: "100% secure"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Send to 180+ countries worldwide",
      highlight: "180+ countries"
    }
  ];

  const passwordRequirements = [
    { text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
    { text: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  return (
    <div className="min-h-screen flex">
      {/* MongoDB Status Banner */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 p-3 ${
          isMongoConnected 
            ? 'bg-green-500/20 border-b border-green-500/30' 
            : 'bg-yellow-500/20 border-b border-yellow-500/30'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className={`w-5 h-5 ${isMongoConnected ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={isMongoConnected ? 'text-green-200' : 'text-yellow-200'}>
              {isMongoConnected 
                ? 'Connected to MongoDB Atlas' 
                : 'Demo Mode: MongoDB Atlas not connected'
              }
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Backend: {isMongoConnected ? 'Live' : 'Mock'}
          </div>
        </div>
      </motion.div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 pt-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Back to home</span>
            </motion.button>
            
            <motion.div 
              className="flex items-center space-x-3 mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bitcoin className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">CryptoStream</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isLogin ? 'Welcome back' : 'Create your account'}
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isLogin 
                ? 'Sign in to your MongoDB-powered account' 
                : 'Join millions sending money at light speed'
              }
            </motion.p>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{errors.submit}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        if (errors.name) setErrors({...errors, name: ''});
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-white/10 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-white/10 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}

              {/* Password Requirements for Signup */}
              {!isLogin && formData.password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10"
                >
                  <div className="text-sm text-gray-300 mb-2">Password requirements:</div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = req.test(formData.password);
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          {isValid ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <X className="w-3 h-3 text-gray-500" />
                          )}
                          <span className={`text-xs ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </motion.form>

          {/* Toggle */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <motion.button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({ email: '', password: '', name: '' });
                setPasswordStrength({ isValid: false, errors: [] });
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </motion.button>
          </motion.div>

          {/* MongoDB Notice */}
          <motion.div 
            className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">MongoDB Atlas Backend</span>
            </div>
            <p className="text-xs text-gray-400">
              Your data is securely stored in MongoDB Atlas with enterprise-grade security and encryption.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border-l border-white/10 items-center justify-center p-12"
      >
        <div className="max-w-md">
          <motion.h2 
            className="text-3xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            The Future of Money Transfer
          </motion.h2>
          
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4 group"
                whileHover={{ x: 5 }}
              >
                <div className="text-blue-400 mt-1 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-1">{benefit.description}</p>
                  <span className="text-blue-400 text-xs font-medium">{benefit.highlight}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-12 p-6 bg-black/20 rounded-xl border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="text-2xl font-bold text-white">$2.4B+</div>
              </div>
              <div className="text-gray-400 text-sm">Transferred by our users</div>
              <div className="text-green-400 text-xs mt-1">Trusted worldwide</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}