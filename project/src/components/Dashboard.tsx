import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getCurrencies, getExchangeRate, Currency, ExchangeRate } from '../lib/supabase';
import SendMoney from './SendMoney';
import TransactionHistory from './TransactionHistory';
import { 
  Send, 
  History, 
  User, 
  Settings, 
  Bitcoin,
  TrendingUp,
  Clock,
  Shield,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Globe,
  Bell,
  LogOut,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  CreditCard,
  Wallet,
  Star,
  Award,
  Target,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, wallets, logout, refreshUserData, isSupabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    loadCurrencies();
    loadExchangeRates();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await getCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const loadExchangeRates = async () => {
    setLoadingRates(true);
    try {
      // Load some popular exchange rates
      const rates = await Promise.all([
        getExchangeRate('USD', 'EUR'),
        getExchangeRate('USD', 'INR'),
        getExchangeRate('USD', 'GBP'),
        getExchangeRate('USD', 'JPY'),
        getExchangeRate('USD', 'AED'),
      ]);
      setExchangeRates(rates.filter(Boolean) as ExchangeRate[]);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  const primaryWallet = wallets.find(w => w.currency === (profile?.preferred_currency || 'USD'));
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const recentTransfers = [
    {
      id: '1',
      type: 'sent',
      recipient: 'Maria Santos',
      amount: 500,
      currency: 'USD',
      receivedAmount: 41650,
      receivedCurrency: 'INR',
      status: 'completed',
      date: '2 hours ago',
      fee: 2.99,
      cryptoUsed: 'USDC → INRC',
      savings: 42.50
    },
    {
      id: '2',
      type: 'received',
      sender: 'John Smith',
      amount: 1200,
      currency: 'EUR',
      status: 'completed',
      date: '1 day ago',
      fee: 0,
      cryptoUsed: 'EUROC → USDC'
    },
    {
      id: '3',
      type: 'sent',
      recipient: 'Ahmed Hassan',
      amount: 750,
      currency: 'USD',
      receivedAmount: 2775,
      receivedCurrency: 'AED',
      status: 'processing',
      date: '2 days ago',
      fee: 3.99,
      cryptoUsed: 'USDC → AEDC',
      savings: 63.75
    }
  ];

  const stats = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toLocaleString()}`,
      change: '+12%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Active Wallets',
      value: wallets.length.toString(),
      change: '+2',
      icon: <Globe className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Crypto Saved',
      value: '$234',
      change: '+15%',
      icon: <Bitcoin className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Transfer Speed',
      value: '30s',
      change: 'avg',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const achievements = [
    {
      title: 'Speed Demon',
      description: 'Completed 10 transfers under 30 seconds',
      icon: <Zap className="w-5 h-5" />,
      earned: true
    },
    {
      title: 'Global Citizen',
      description: 'Sent money to 5+ countries',
      icon: <Globe className="w-5 h-5" />,
      earned: true
    },
    {
      title: 'Crypto Pioneer',
      description: 'Used 3+ different crypto routes',
      icon: <Bitcoin className="w-5 h-5" />,
      earned: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Supabase Status Banner */}
      {!isSupabaseConfigured && (
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-yellow-500/20 border-b border-yellow-500/30 p-3"
        >
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200">
                Demo Mode: Connect to Supabase for full functionality
              </span>
            </div>
            <button className="text-yellow-200 hover:text-white text-sm font-medium transition-colors">
              Connect Supabase
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/20 backdrop-blur-lg border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bitcoin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CryptoStream</h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isSupabaseConfigured ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-sm text-gray-400">
                  {isSupabaseConfigured ? 'Live' : 'Demo'}
                </span>
              </div>
              
              <motion.button 
                onClick={loadExchangeRates}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                disabled={loadingRates}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className={`w-5 h-5 ${loadingRates ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button 
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-white font-medium">
                    {primaryWallet?.currency} {primaryWallet?.balance?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-400">Primary Balance</div>
                </div>
                <motion.button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-5 h-5" /> },
                  { id: 'send', label: 'Send Money', icon: <Send className="w-5 h-5" /> },
                  { id: 'wallets', label: 'My Wallets', icon: <Wallet className="w-5 h-5" /> },
                  { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
                  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
                  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              {/* Quick Stats in Sidebar */}
              <div className="mt-8 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <h3 className="text-white font-semibold mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-green-400">+$2,340</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Saved</span>
                    <span className="text-yellow-400">$187</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transfers</span>
                    <span className="text-blue-400">23</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'send' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SendMoney />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TransactionHistory />
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    onClick={() => setActiveTab('send')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-bold mb-2">Send Money</h3>
                        <p className="text-blue-100">Via crypto rails • 30s delivery</p>
                      </div>
                      <Send className="w-10 h-10" />
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setActiveTab('wallets')}
                    className="flex-1 bg-black/20 backdrop-blur-lg border border-white/10 text-white p-6 rounded-2xl hover:bg-white/5 transition-all"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-bold mb-2">Manage Wallets</h3>
                        <p className="text-gray-400">Multi-currency support</p>
                      </div>
                      <Plus className="w-10 h-10" />
                    </div>
                  </motion.button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:bg-black/30 transition-all ${stat.bgColor}`}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={stat.color}>{stat.icon}</div>
                        <div className="text-green-400 text-sm font-medium">{stat.change}</div>
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-gray-400 text-sm">{stat.title}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Live Exchange Rates */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Live Crypto Exchange Rates</h2>
                    <div className="flex items-center space-x-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exchangeRates.map((rate, index) => {
                      const fromCurrency = currencies.find(c => c.code === rate.from_currency);
                      const toCurrency = currencies.find(c => c.code === rate.to_currency);
                      
                      return (
                        <motion.div 
                          key={rate.id} 
                          className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-white font-bold text-lg">
                              {fromCurrency?.symbol}1 {rate.from_currency}
                            </span>
                            <span className="text-blue-400 text-sm font-medium">
                              via {fromCurrency?.crypto_equivalent}
                            </span>
                          </div>
                          <div className="text-gray-300 text-xl font-semibold mb-2">
                            = {toCurrency?.symbol}{rate.crypto_rate.toFixed(4)} {rate.to_currency}
                          </div>
                          <div className="text-xs text-gray-500">
                            Traditional: {rate.rate.toFixed(4)} • Save 0.8%
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Transfers */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Recent Crypto Transfers</h2>
                    <motion.button 
                      onClick={() => setActiveTab('history')}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      View All →
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {recentTransfers.map((transfer, index) => (
                      <motion.div 
                        key={transfer.id} 
                        className="flex items-center justify-between p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                            transfer.type === 'sent' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {transfer.type === 'sent' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-lg">
                              {transfer.type === 'sent' ? `To ${transfer.recipient}` : `From ${transfer.sender}`}
                            </div>
                            <div className="text-gray-400 text-sm flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{transfer.date}</span>
                              </div>
                              <span className="text-blue-400">• {transfer.cryptoUsed}</span>
                              {transfer.savings && (
                                <span className="text-green-400">• Saved ${transfer.savings.toFixed(2)}</span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transfer.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {transfer.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">
                            {transfer.type === 'sent' ? '-' : '+'}${transfer.amount.toLocaleString()}
                          </div>
                          {transfer.receivedAmount && (
                            <div className="text-gray-400 text-sm">
                              ≈ {transfer.receivedAmount.toLocaleString()} {transfer.receivedCurrency}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <h2 className="text-2xl font-bold text-white mb-8">Your Achievements</h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-xl border transition-all ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                          achievement.earned ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-400'
                        }`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`font-semibold mb-2 ${achievement.earned ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {achievement.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{achievement.description}</p>
                        {achievement.earned && (
                          <div className="mt-3 flex items-center space-x-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-xs font-medium">Earned</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'wallets' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">My Crypto Wallets</h2>
                    <motion.button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Wallet</span>
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((wallet, index) => {
                      const currency = currencies.find(c => c.code === wallet.currency);
                      return (
                        <motion.div 
                          key={wallet.id} 
                          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">{currency?.symbol || wallet.currency.slice(0, 1)}</span>
                              </div>
                              <div>
                                <div className="text-white font-bold text-lg">{wallet.currency}</div>
                                <div className="text-gray-400 text-sm">{currency?.name || 'Currency'}</div>
                              </div>
                            </div>
                            <div className="text-blue-400 text-sm font-medium">
                              {currency?.crypto_equivalent || 'CRYPTO'}
                            </div>
                          </div>
                          
                          <div className="text-3xl font-bold text-white mb-2">
                            {currency?.symbol || '$'}{wallet.balance.toLocaleString()}
                          </div>
                          
                          <div className="text-gray-400 text-sm mb-4">
                            Available Balance
                          </div>

                          <div className="flex space-x-2">
                            <motion.button 
                              className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Send
                            </motion.button>
                            <motion.button 
                              className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Receive
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs placeholder */}
            {['profile', 'settings'].includes(activeTab) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-12"
              >
                <h2 className="text-3xl font-bold text-white mb-8 capitalize">{activeTab}</h2>
                <div className="text-center py-16">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-3xl">🚀</span>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">Coming Soon!</h3>
                  <p className="text-gray-400 text-lg mb-2">
                    This feature will be implemented in the next update
                  </p>
                  <p className="text-gray-500 text-sm">
                    Advanced {activeTab} management with enhanced security
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}