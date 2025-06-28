const axios = require('axios');
const https = require('https');

// CoinGecko API configuration
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Create axios instance with proper configuration to handle SSL issues
const api = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'SwiftChain/1.0'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

/**
 * Convert INR to USDT or ETH using CoinGecko API
 */
const convertINRToCrypto = async (req, res) => {
  try {
    const { amount, currency = 'USDT' } = req.body;

    if (!amount || amount < 0.01) {
      return res.status(400).json({
        error: 'Invalid amount. Amount must be at least ₹0.01.'
      });
    }

    if (!['USDT', 'ETH'].includes(currency)) {
      return res.status(400).json({
        error: 'Invalid currency. Must be USDT or ETH.'
      });
    }

    // Get crypto price in INR from CoinGecko
    const cryptoId = currency === 'USDT' ? 'tether' : 'ethereum';
    const response = await api.get(
      `${COINGECKO_API_URL}/simple/price?ids=${cryptoId}&vs_currencies=inr`
    );

    const cryptoPriceInINR = response.data[cryptoId].inr;
    const cryptoAmount = amount / cryptoPriceInINR;

    // Calculate fees (simplified)
    const swiftChainFee = amount * 0.01; // 1% fee
    const networkFee = currency === 'USDT' ? 0.5 : 0.001; // Fixed network fee
    const totalFee = swiftChainFee + (networkFee * cryptoPriceInINR);

    const responseData = {
      originalAmount: amount,
      originalCurrency: 'INR',
      convertedAmount: cryptoAmount.toFixed(6),
      convertedCurrency: currency,
      exchangeRate: cryptoPriceInINR,
      fees: {
        swiftChainFee: swiftChainFee.toFixed(2),
        networkFee: networkFee.toFixed(6),
        totalFee: totalFee.toFixed(2)
      },
      netAmount: (amount - totalFee).toFixed(2),
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  } catch (error) {
    console.error(`Error converting INR to ${req.body.currency || 'USDT'}:`, error);
    
    // If CoinGecko API fails, use fallback rates
    if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
        error.message.includes('certificate') || 
        error.message.includes('SSL') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.response?.status === 403 ||
        error.response?.status === 429 ||
        error.response?.status >= 500) {
      console.log('Using fallback exchange rate due to API connectivity issues');
      
      // Use fallback exchange rates
      const fallbackRates = {
        USDT: 83, // 1 USDT = 83 INR
        ETH: 150000 // 1 ETH = 150,000 INR
      };
      
      const currency = req.body.currency || 'USDT';
      const fallbackRate = fallbackRates[currency];
      const cryptoAmount = amount / fallbackRate;
      const swiftChainFee = amount * 0.01;
      const networkFee = currency === 'USDT' ? 0.5 : 0.001;
      const totalFee = swiftChainFee + (networkFee * fallbackRate);

      const responseData = {
        originalAmount: amount,
        originalCurrency: 'INR',
        convertedAmount: cryptoAmount.toFixed(6),
        convertedCurrency: currency,
        exchangeRate: fallbackRate,
        fees: {
          swiftChainFee: swiftChainFee.toFixed(2),
          networkFee: networkFee.toFixed(6),
          totalFee: totalFee.toFixed(2)
        },
        netAmount: (amount - totalFee).toFixed(2),
        timestamp: new Date().toISOString(),
        note: 'Using fallback exchange rate due to API connectivity issues'
      };

      return res.json(responseData);
    }

    res.status(500).json({
      error: 'Failed to convert currency',
      message: error.message
    });
  }
};

/**
 * Get current exchange rates
 */
const getExchangeRates = async (req, res) => {
  try {
    const response = await api.get(
      `${COINGECKO_API_URL}/simple/price?ids=tether,bitcoin,ethereum&vs_currencies=inr,usd`
    );

    res.json({
      rates: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    const fallbackRates = {
      tether: { inr: 83, usd: 1 },
      bitcoin: { inr: 2500000, usd: 30000 },
      ethereum: { inr: 150000, usd: 1800 }
    };

    res.json({
      rates: fallbackRates,
      timestamp: new Date().toISOString(),
      note: 'Using fallback rates due to API connectivity issues'
    });
  }
};

/**
 * Get fee comparison between traditional banks and SwiftChain
 */
const getFeeComparison = async (req, res) => {
  try {
    const { amount } = req.query;
    const transferAmount = parseFloat(amount) || 10000; // Default 10,000 INR

    // Traditional bank fees (simplified)
    const bankFees = {
      swift: transferAmount * 0.05, // 5% for international transfers
      processing: 500, // Fixed processing fee
      currencyConversion: transferAmount * 0.03, // 3% currency conversion
      total: (transferAmount * 0.08) + 500
    };

    // SwiftChain fees
    const swiftChainFees = {
      platform: transferAmount * 0.01, // 1% platform fee
      network: 0.5 * 83, // Network fee in INR (assuming 1 USDT = 83 INR)
      total: (transferAmount * 0.01) + 41.5
    };

    const savings = bankFees.total - swiftChainFees.total;

    res.json({
      transferAmount,
      traditionalBank: {
        fees: bankFees,
        totalCost: bankFees.total.toFixed(2)
      },
      swiftChain: {
        fees: swiftChainFees,
        totalCost: swiftChainFees.total.toFixed(2)
      },
      savings: savings.toFixed(2),
      savingsPercentage: ((savings / bankFees.total) * 100).toFixed(1),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating fee comparison:', error);
    res.status(500).json({
      error: 'Failed to calculate fee comparison',
      message: error.message
    });
  }
};

module.exports = {
  convertINRToCrypto,
  getExchangeRates,
  getFeeComparison
}; 