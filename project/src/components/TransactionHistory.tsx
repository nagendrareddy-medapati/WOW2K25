import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getCurrencies, Currency } from '../lib/supabase';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Globe,
  Zap,
  DollarSign,
  Eye,
  ExternalLink,
  Bitcoin,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Award,
  Target
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  recipient?: string;
  sender?: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  date: string;
  fee: number;
  cryptoRoute: string;
  purpose?: string;
  message?: string;
  transactionId: string;
  exchangeRate?: number;
  estimatedArrival?: string;
  savings?: number;
}

interface MonthlyStats {
  month: string;
  sent: number;
  received: number;
  savings: number;
  transactions: number;
}

export default function TransactionHistory() {
  const { user, profile, wallets } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, statusFilter, typeFilter, dateRange]);

  const loadData = async () => {
    try {
      const currenciesData = await getCurrencies();
      setCurrencies(currenciesData);
      
      // Enhanced mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'sent',
          amount: 500,
          currency: 'USD',
          convertedAmount: 41650,
          convertedCurrency: 'INR',
          recipient: 'Maria Santos',
          status: 'completed',
          date: '2024-12-28T10:30:00Z',
          fee: 2.99,
          cryptoRoute: 'USDC → INRC',
          purpose: 'family_support',
          message: 'Monthly support for family',
          transactionId: 'TXN-1703761800000',
          exchangeRate: 83.3,
          estimatedArrival: '30 seconds',
          savings: 42.50
        },
        {
          id: '2',
          type: 'received',
          amount: 1200,
          currency: 'EUR',
          sender: 'John Smith',
          status: 'completed',
          date: '2024-12-27T15:45:00Z',
          fee: 0,
          cryptoRoute: 'EUROC → USDC',
          transactionId: 'TXN-1703675100000',
          exchangeRate: 1.18,
          savings: 0
        },
        {
          id: '3',
          type: 'sent',
          amount: 750,
          currency: 'USD',
          convertedAmount: 2775,
          convertedCurrency: 'AED',
          recipient: 'Ahmed Hassan',
          status: 'processing',
          date: '2024-12-26T09:15:00Z',
          fee: 3.99,
          cryptoRoute: 'USDC → AEDC',
          purpose: 'business',
          transactionId: 'TXN-1703588100000',
          exchangeRate: 3.7,
          estimatedArrival: '2 minutes',
          savings: 63.75
        },
        {
          id: '4',
          type: 'sent',
          amount: 300,
          currency: 'USD',
          convertedAmount: 255,
          convertedCurrency: 'EUR',
          recipient: 'Sophie Dubois',
          status: 'completed',
          date: '2024-12-25T14:20:00Z',
          fee: 1.99,
          cryptoRoute: 'USDC → EUROC',
          purpose: 'education',
          transactionId: 'TXN-1703514000000',
          exchangeRate: 0.85,
          savings: 25.50
        },
        {
          id: '5',
          type: 'received',
          amount: 2000,
          currency: 'GBP',
          sender: 'David Wilson',
          status: 'completed',
          date: '2024-12-24T11:30:00Z',
          fee: 0,
          cryptoRoute: 'GBPC → USDC',
          transactionId: 'TXN-1703422200000',
          exchangeRate: 1.37,
          savings: 0
        },
        {
          id: '6',
          type: 'sent',
          amount: 150,
          currency: 'USD',
          convertedAmount: 22350,
          convertedCurrency: 'JPY',
          recipient: 'Yuki Tanaka',
          status: 'failed',
          date: '2024-12-23T16:45:00Z',
          fee: 1.49,
          cryptoRoute: 'USDC → JPYC',
          purpose: 'other',
          transactionId: 'TXN-1703354700000',
          exchangeRate: 149,
          savings: 12.75
        },
        {
          id: '7',
          type: 'sent',
          amount: 850,
          currency: 'USD',
          convertedAmount: 1147,
          convertedCurrency: 'SGD',
          recipient: 'Li Wei',
          status: 'completed',
          date: '2024-12-22T08:20:00Z',
          fee: 4.25,
          cryptoRoute: 'USDC → SGDC',
          purpose: 'business',
          transactionId: 'TXN-1703268000000',
          exchangeRate: 1.35,
          savings: 72.25
        },
        {
          id: '8',
          type: 'received',
          amount: 450,
          currency: 'CAD',
          sender: 'Emma Thompson',
          status: 'completed',
          date: '2024-12-21T19:10:00Z',
          fee: 0,
          cryptoRoute: 'CADC → USDC',
          transactionId: 'TXN-1703181000000',
          exchangeRate: 0.74,
          savings: 0
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.currency.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.date) >= filterDate);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const totalSent = transactions.filter(tx => tx.type === 'sent' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
  const totalReceived = transactions.filter(tx => tx.type === 'received' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
  const totalFees = transactions.filter(tx => tx.type === 'sent' && tx.status === 'completed').reduce((sum, tx) => sum + tx.fee, 0);
  const totalSavings = transactions.filter(tx => tx.type === 'sent' && tx.status === 'completed').reduce((sum, tx) => sum + (tx.savings || 0), 0);

  const monthlyStats: MonthlyStats[] = [
    { month: 'Dec', sent: 2550, received: 3650, savings: 216.75, transactions: 8 },
    { month: 'Nov', sent: 2300, received: 1800, savings: 184, transactions: 12 },
    { month: 'Oct', sent: 1900, received: 2100, savings: 152, transactions: 9 },
    { month: 'Sep', sent: 2800, received: 1500, savings: 224, transactions: 15 },
    { month: 'Aug', sent: 2100, received: 2700, savings: 168, transactions: 11 },
    { month: 'Jul', sent: 1600, received: 1900, savings: 128, transactions: 7 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Transaction History</h1>
          <p className="text-gray-400 text-lg">Track all your crypto-powered transfers</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
            <motion.button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <History className="w-4 h-4" />
              <span>Transactions</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode('analytics')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                viewMode === 'analytics' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </motion.button>
          </div>
          
          <motion.button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Sent',
            value: `$${totalSent.toLocaleString()}`,
            change: '+12%',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10'
          },
          {
            title: 'Total Received',
            value: `$${totalReceived.toLocaleString()}`,
            change: '+8%',
            icon: <TrendingDown className="w-5 h-5" />,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10'
          },
          {
            title: 'Total Fees',
            value: `$${totalFees.toFixed(2)}`,
            change: '-85%',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
          },
          {
            title: 'Crypto Savings',
            value: `$${totalSavings.toFixed(0)}`,
            change: 'vs banks',
            icon: <Zap className="w-5 h-5" />,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10'
          }
        ].map((stat, index) => (
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
              <div className={`text-sm font-medium ${stat.change.includes('-') ? 'text-green-400' : 'text-blue-400'}`}>
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="all" className="bg-gray-800">All Status</option>
                  <option value="completed" className="bg-gray-800">Completed</option>
                  <option value="processing" className="bg-gray-800">Processing</option>
                  <option value="failed" className="bg-gray-800">Failed</option>
                  <option value="pending" className="bg-gray-800">Pending</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="all" className="bg-gray-800">All Types</option>
                  <option value="sent" className="bg-gray-800">Sent</option>
                  <option value="received" className="bg-gray-800">Received</option>
                </select>

                {/* Date Range */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all"
                >
                  <option value="all" className="bg-gray-800">All Time</option>
                  <option value="7d" className="bg-gray-800">Last 7 days</option>
                  <option value="30d" className="bg-gray-800">Last 30 days</option>
                  <option value="90d" className="bg-gray-800">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Recent Transactions ({filteredTransactions.length})
                  </h2>
                  <div className="flex items-center space-x-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Live updates</span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {filteredTransactions.map((transaction, index) => {
                  const currency = currencies.find(c => c.code === transaction.currency);
                  const convertedCurrency = currencies.find(c => c.code === transaction.convertedCurrency);
                  
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-white/5 transition-all cursor-pointer group"
                      onClick={() => setSelectedTransaction(transaction)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                            transaction.type === 'sent' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {transaction.type === 'sent' ? 
                              <ArrowUpRight className="w-7 h-7" /> : 
                              <ArrowDownLeft className="w-7 h-7" />
                            }
                          </div>
                          
                          <div>
                            <div className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                              {transaction.type === 'sent' 
                                ? `To ${transaction.recipient}` 
                                : `From ${transaction.sender}`
                              }
                            </div>
                            <div className="text-gray-400 text-sm flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                              </div>
                              <span className="text-blue-400">• {transaction.cryptoRoute}</span>
                              {transaction.savings && transaction.savings > 0 && (
                                <span className="text-green-400">• Saved ${transaction.savings.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-white font-bold text-lg">
                            {transaction.type === 'sent' ? '-' : '+'}
                            {currency?.symbol}
                            {transaction.amount.toLocaleString()}
                          </div>
                          {transaction.convertedAmount && (
                            <div className="text-gray-400 text-sm">
                              ≈ {convertedCurrency?.symbol}
                              {transaction.convertedAmount.toLocaleString()} {transaction.convertedCurrency}
                            </div>
                          )}
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs border mt-2 ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize font-medium">{transaction.status}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Monthly Activity Chart */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white">Monthly Activity</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Sent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Received</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Savings</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {monthlyStats.map((stat, index) => (
                  <motion.div 
                    key={stat.month} 
                    className="flex items-center space-x-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 text-gray-400 text-sm font-medium">{stat.month}</div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 text-sm font-medium">Sent</span>
                        <span className="text-white font-semibold">${stat.sent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.sent / 3000) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm font-medium">Received</span>
                        <span className="text-white font-semibold">${stat.received.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.received / 3000) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.7, duration: 1 }}
                        />
                      </div>
                    </div>
                    
                    <div className="w-24 text-right">
                      <div className="text-yellow-400 text-sm font-medium">Saved</div>
                      <div className="text-white font-semibold">${stat.savings}</div>
                      <div className="text-gray-500 text-xs">{stat.transactions} txns</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Currency Breakdown */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  <span>Top Currencies</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { currency: 'USD', amount: 2650, percentage: 45, color: 'bg-blue-500', icon: '$' },
                    { currency: 'EUR', amount: 1800, percentage: 30, color: 'bg-purple-500', icon: '€' },
                    { currency: 'INR', amount: 900, percentage: 15, color: 'bg-green-500', icon: '₹' },
                    { currency: 'GBP', amount: 600, percentage: 10, color: 'bg-yellow-500', icon: '£' }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.currency} 
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{item.currency}</span>
                          <span className="text-gray-400">${item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className={`${item.color} h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                          />
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm font-medium">{item.percentage}%</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Crypto Routes Performance */}
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span>Crypto Routes</span>
                </h3>
                
                <div className="space-y-4">
                  {[
                    { route: 'USDC → INRC', count: 12, savings: '$45.60', speed: '28s', rating: 5 },
                    { route: 'EUROC → USDC', count: 8, savings: '$32.40', speed: '31s', rating: 5 },
                    { route: 'USDC → AEDC', count: 6, savings: '$28.80', speed: '25s', rating: 4 },
                    { route: 'GBPC → USDC', count: 4, savings: '$18.20', speed: '35s', rating: 4 }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.route} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <div className="text-white font-medium flex items-center space-x-2">
                          <span>{item.route}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(item.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm flex items-center space-x-3">
                          <span>{item.count} transfers</span>
                          <span>• Avg {item.speed}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{item.savings}</div>
                        <div className="text-gray-400 text-sm">saved</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Average Transfer Time',
                  value: '29.5s',
                  change: '-12%',
                  icon: <Clock className="w-6 h-6" />,
                  color: 'text-blue-400'
                },
                {
                  title: 'Success Rate',
                  value: '99.2%',
                  change: '+0.3%',
                  icon: <Target className="w-6 h-6" />,
                  color: 'text-green-400'
                },
                {
                  title: 'Customer Rating',
                  value: '4.9/5',
                  change: '+0.1',
                  icon: <Award className="w-6 h-6" />,
                  color: 'text-yellow-400'
                }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className={`${metric.color} mb-4 flex justify-center`}>
                    {metric.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-gray-400 text-sm mb-1">{metric.title}</div>
                  <div className="text-green-400 text-xs font-medium">{metric.change} this month</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-white/10 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-blue-400 font-mono text-sm">{selectedTransaction.transactionId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white capitalize font-medium">{selectedTransaction.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-bold text-lg">
                    {currencies.find(c => c.code === selectedTransaction.currency)?.symbol}
                    {selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                  </span>
                </div>

                {selectedTransaction.convertedAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Converted Amount</span>
                    <span className="text-white font-bold text-lg">
                      {currencies.find(c => c.code === selectedTransaction.convertedCurrency)?.symbol}
                      {selectedTransaction.convertedAmount.toLocaleString()} {selectedTransaction.convertedCurrency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedTransaction.status)}`}>
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize font-medium">{selectedTransaction.status}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Date & Time</span>
                  <span className="text-white">{new Date(selectedTransaction.date).toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Crypto Route</span>
                  <span className="text-blue-400 font-medium">{selectedTransaction.cryptoRoute}</span>
                </div>

                {selectedTransaction.fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee</span>
                    <span className="text-white">${selectedTransaction.fee.toFixed(2)}</span>
                  </div>
                )}

                {selectedTransaction.savings && selectedTransaction.savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">You Saved</span>
                    <span className="text-green-400 font-bold">${selectedTransaction.savings.toFixed(2)}</span>
                  </div>
                )}

                {selectedTransaction.purpose && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purpose</span>
                    <span className="text-white capitalize">{selectedTransaction.purpose.replace('_', ' ')}</span>
                  </div>
                )}

                {selectedTransaction.message && (
                  <div>
                    <div className="text-gray-400 mb-2">Message</div>
                    <div className="text-white bg-white/5 p-4 rounded-xl border border-white/10">{selectedTransaction.message}</div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex space-x-4">
                <motion.button 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Blockchain</span>
                </motion.button>
                <motion.button 
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}