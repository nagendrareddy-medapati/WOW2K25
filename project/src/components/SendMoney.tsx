import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getCurrencies, getExchangeRate, getAllUsers, Currency, ExchangeRate, Profile } from '../lib/supabase';
import { 
  Send, 
  ArrowRight, 
  Search, 
  User, 
  Globe, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Bitcoin,
  DollarSign,
  RefreshCw,
  ArrowUpDown,
  Wallet,
  CreditCard,
  Building,
  Phone,
  Mail,
  Star,
  TrendingUp
} from 'lucide-react';

interface TransferStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export default function SendMoney() {
  const { user, profile, wallets } = useAuth();
  const [step, setStep] = useState(1);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'INR',
    amount: '',
    recipient: null as Profile | null,
    purpose: 'family_support',
    message: ''
  });

  const transferSteps: TransferStep[] = [
    {
      id: 1,
      title: 'Amount & Currency',
      description: 'Enter amount and select currencies',
      status: step > 1 ? 'completed' : step === 1 ? 'active' : 'pending'
    },
    {
      id: 2,
      title: 'Select Recipient',
      description: 'Choose who receives the money',
      status: step > 2 ? 'completed' : step === 2 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: 'Review & Send',
      description: 'Confirm details and process transfer',
      status: step > 3 ? 'completed' : step === 3 ? 'active' : 'pending'
    },
    {
      id: 4,
      title: 'Transfer Complete',
      description: 'Money sent via crypto rails',
      status: step === 4 ? 'completed' : 'pending'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.fromCurrency && formData.toCurrency && formData.fromCurrency !== formData.toCurrency) {
      loadExchangeRate();
    }
  }, [formData.fromCurrency, formData.toCurrency]);

  const loadData = async () => {
    try {
      const [currenciesData, usersData] = await Promise.all([
        getCurrencies(),
        getAllUsers()
      ]);
      setCurrencies(currenciesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const rate = await getExchangeRate(formData.fromCurrency, formData.toCurrency);
      setExchangeRate(rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    } finally {
      setLoadingRate(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fromCurrency = currencies.find(c => c.code === formData.fromCurrency);
  const toCurrency = currencies.find(c => c.code === formData.toCurrency);
  const senderWallet = wallets.find(w => w.currency === formData.fromCurrency);
  
  const amount = parseFloat(formData.amount) || 0;
  const convertedAmount = amount * (exchangeRate?.crypto_rate || 1);
  const fee = amount * 0.005; // 0.5% fee
  const totalDebit = amount + fee;
  const savings = amount * 0.08; // 8% savings vs traditional banks

  const handleSwapCurrencies = () => {
    setFormData(prev => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency
    }));
  };

  const handleSendMoney = async () => {
    setIsProcessing(true);
    
    // Simulate crypto transfer process with realistic steps
    const steps = [
      'Converting to crypto...',
      'Broadcasting to blockchain...',
      'Confirming transaction...',
      'Converting to local currency...',
      'Transfer complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setStep(4);
    setIsProcessing(false);
  };

  const canProceedStep1 = amount > 0 && amount <= (senderWallet?.balance || 0) && exchangeRate;
  const canProceedStep2 = formData.recipient;
  const canProceedStep3 = formData.purpose;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-3">Send Money Globally</h1>
        <p className="text-gray-400 text-lg">Convert to crypto, transfer instantly, deliver as local currency</p>
        <div className="flex items-center justify-center space-x-2 mt-4 text-green-400">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Average transfer time: 30 seconds</span>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div 
        className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          {transferSteps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    stepItem.status === 'completed' 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                      : stepItem.status === 'active'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'border-gray-600 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={stepItem.status === 'active' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: stepItem.status === 'active' ? Infinity : 0, duration: 2 }}
                >
                  {stepItem.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-bold">{stepItem.id}</span>
                  )}
                </motion.div>
                <div className="mt-3 text-center">
                  <div className={`text-sm font-medium ${
                    stepItem.status === 'active' ? 'text-white' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24 mt-1">
                    {stepItem.description}
                  </div>
                </div>
              </div>
              {index < transferSteps.length - 1 && (
                <div className={`w-20 h-1 mx-6 rounded-full transition-all ${
                  transferSteps[index + 1].status !== 'pending' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Amount & Currency */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Form */}
            <div className="lg:col-span-2 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-8">How much do you want to send?</h2>
              
              <div className="space-y-8">
                {/* Send Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">You send</label>
                  <div className="relative">
                    <select
                      value={formData.fromCurrency}
                      onChange={(e) => setFormData({...formData, fromCurrency: e.target.value})}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent text-white font-bold text-lg border-none outline-none z-10"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code} className="bg-gray-800">
                          {currency.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full pl-24 pr-6 py-6 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Available: {fromCurrency?.symbol}{senderWallet?.balance?.toLocaleString() || '0'}
                    </div>
                    <div className="flex space-x-2">
                      {[100, 500, 1000].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setFormData({...formData, amount: preset.toString()})}
                          className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                        >
                          {fromCurrency?.symbol}{preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleSwapCurrencies}
                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowUpDown className="w-6 h-6 text-white" />
                  </motion.button>
                </div>

                {/* Receive Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Recipient gets</label>
                  <div className="relative">
                    <select
                      value={formData.toCurrency}
                      onChange={(e) => setFormData({...formData, toCurrency: e.target.value})}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent text-white font-bold text-lg border-none outline-none z-10"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code} className="bg-gray-800">
                          {currency.code}
                        </option>
                      ))}
                    </select>
                    <div className="w-full pl-24 pr-6 py-6 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-bold flex items-center">
                      {loadingRate ? (
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                          <span className="text-gray-400">Calculating...</span>
                        </div>
                      ) : (
                        `${toCurrency?.symbol}${convertedAmount.toLocaleString()}`
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-green-400 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>You save ${savings.toFixed(2)} vs traditional banks</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <motion.button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-3"
                  whileHover={canProceedStep1 ? { scale: 1.02 } : {}}
                  whileTap={canProceedStep1 ? { scale: 0.98 } : {}}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Transfer Details Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Transfer Details</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Exchange Rate</span>
                    <span className="text-white font-medium">
                      1 {formData.fromCurrency} = {exchangeRate?.crypto_rate.toFixed(4)} {formData.toCurrency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Transfer Fee</span>
                    <span className="text-white font-medium">
                      {fromCurrency?.symbol}{fee.toFixed(2)} (0.5%)
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Crypto Route</span>
                    <span className="text-blue-400 text-sm font-medium">
                      {fromCurrency?.crypto_equivalent} → {toCurrency?.crypto_equivalent}
                    </span>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Debit</span>
                      <span className="text-white font-bold text-xl">
                        {fromCurrency?.symbol}{totalDebit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-400 text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      <span>Arrives in ~30 seconds</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Why CryptoStream?</h3>
                <div className="space-y-3">
                  {[
                    { icon: <Zap className="w-4 h-4" />, text: "30x faster than banks" },
                    { icon: <Shield className="w-4 h-4" />, text: "Military-grade security" },
                    { icon: <DollarSign className="w-4 h-4" />, text: "90% lower fees" },
                    { icon: <Globe className="w-4 h-4" />, text: "180+ countries" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-300">
                      <div className="text-blue-400">{item.icon}</div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Recipient */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Who are you sending money to?</h2>
            
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Recipients Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredUsers.map((recipient) => (
                <motion.button
                  key={recipient.id}
                  onClick={() => setFormData({...formData, recipient})}
                  className={`p-6 rounded-xl border transition-all text-left ${
                    formData.recipient?.id === recipient.id
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg">{recipient.full_name}</div>
                      <div className="text-gray-400 text-sm">{recipient.email}</div>
                      <div className="text-blue-400 text-sm flex items-center space-x-1 mt-1">
                        <Globe className="w-3 h-3" />
                        <span>{recipient.country} • {recipient.preferred_currency}</span>
                      </div>
                    </div>
                    {formData.recipient?.id === recipient.id && (
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between">
              <motion.button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-white transition-colors px-6 py-3 rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
              >
                ← Back
              </motion.button>
              <motion.button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-3"
                whileHover={canProceedStep2 ? { scale: 1.02 } : {}}
                whileTap={canProceedStep2 ? { scale: 0.98 } : {}}
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Send */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Review Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-8">Review your transfer</h2>
                
                {/* Transfer Summary */}
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Transfer Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">You send</span>
                      <span className="text-white font-bold text-xl">
                        {fromCurrency?.symbol}{amount.toLocaleString()} {formData.fromCurrency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Recipient gets</span>
                      <span className="text-white font-bold text-xl">
                        {toCurrency?.symbol}{convertedAmount.toLocaleString()} {formData.toCurrency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transfer fee</span>
                      <span className="text-white">{fromCurrency?.symbol}{fee.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total debit</span>
                        <span className="text-white font-bold text-2xl">
                          {fromCurrency?.symbol}{totalDebit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recipient</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{formData.recipient?.full_name}</div>
                      <div className="text-gray-400">{formData.recipient?.email}</div>
                      <div className="text-blue-400 text-sm">{formData.recipient?.country}</div>
                    </div>
                  </div>
                </div>

                {/* Purpose and Message */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Purpose of transfer
                    </label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
                    >
                      <option value="family_support" className="bg-gray-800">Family Support</option>
                      <option value="business" className="bg-gray-800">Business Payment</option>
                      <option value="education" className="bg-gray-800">Education</option>
                      <option value="medical" className="bg-gray-800">Medical Expenses</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Message (optional)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Add a personal message..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <motion.button
                  onClick={() => setStep(2)}
                  className="text-gray-400 hover:text-white transition-colors px-6 py-3 rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.05 }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  onClick={handleSendMoney}
                  disabled={!canProceedStep3 || isProcessing}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-4 rounded-xl font-bold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-3"
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Processing Transfer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send Money Now</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Crypto Process Visualization */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20 h-fit">
              <h3 className="text-lg font-semibold text-white mb-6">How it works</h3>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <DollarSign className="w-5 h-5" />,
                    title: `Convert to ${fromCurrency?.crypto_equivalent}`,
                    description: `Your ${formData.fromCurrency} becomes crypto`,
                    color: 'bg-blue-500'
                  },
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: 'Lightning Transfer',
                    description: 'Instant blockchain transaction',
                    color: 'bg-purple-500'
                  },
                  {
                    icon: <Globe className="w-5 h-5" />,
                    title: `Convert to ${formData.toCurrency}`,
                    description: 'Delivered as local currency',
                    color: 'bg-green-500'
                  }
                ].map((step, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium">{step.title}</div>
                      <div className="text-gray-400 text-sm">{step.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-black/20 rounded-xl">
                <div className="flex items-center space-x-2 text-green-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Secure & Transparent</span>
                </div>
                <div className="text-gray-300 text-sm">
                  Every transaction is recorded on the blockchain for complete transparency and security.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Transfer Complete */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center"
          >
            <motion.div 
              className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: 3, duration: 0.5 }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-bold text-white mb-4">Transfer Successful!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Your money has been sent via crypto rails and will arrive in seconds.
            </p>

            <div className="bg-white/5 rounded-xl p-8 mb-8 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount sent</span>
                  <span className="text-white font-bold">
                    {fromCurrency?.symbol}{amount.toLocaleString()} {formData.fromCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient gets</span>
                  <span className="text-white font-bold">
                    {toCurrency?.symbol}{convertedAmount.toLocaleString()} {formData.toCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transfer ID</span>
                  <span className="text-blue-400 font-mono text-sm">TXN-{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You saved</span>
                  <span className="text-green-400 font-bold">${savings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => {
                  setStep(1);
                  setFormData({
                    fromCurrency: 'USD',
                    toCurrency: 'INR',
                    amount: '',
                    recipient: null,
                    purpose: 'family_support',
                    message: ''
                  });
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Another Transfer
              </motion.button>
              <motion.button 
                className="text-gray-400 hover:text-white transition-colors px-8 py-4 rounded-xl hover:bg-white/10"
                whileHover={{ scale: 1.02 }}
              >
                View Transaction Details
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}