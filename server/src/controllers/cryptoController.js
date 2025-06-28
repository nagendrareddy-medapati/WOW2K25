const { ethers } = require('ethers');

// Sepolia testnet configuration
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'; // Public Infura endpoint
const USDT_CONTRACT_ADDRESS = '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'; // Sepolia USDT contract

// USDT ABI (simplified for transfer function)
const USDT_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

/**
 * Send crypto transaction
 */
const sendCrypto = async (req, res) => {
  try {
    const { toAddress, amount, fromAddress, privateKey } = req.body;

    if (!toAddress || !amount || !fromAddress) {
      return res.status(400).json({
        error: 'Missing required parameters: toAddress, amount, fromAddress'
      });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(toAddress) || !ethers.isAddress(fromAddress)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address'
      });
    }

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // If private key is provided, we can send real transactions
    if (privateKey) {
      try {
        const wallet = new ethers.Wallet(privateKey, provider);
        const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, wallet);
        
        // Convert amount to USDT decimals (6 decimals for USDT)
        const amountInWei = ethers.parseUnits(amount.toString(), 6);
        
        // Send real USDT transaction
        const tx = await usdtContract.transfer(toAddress, amountInWei);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        
        const transactionStatus = {
          hash: tx.hash,
          status: 'confirmed',
          from: fromAddress,
          to: toAddress,
          amount: amount,
          currency: 'USDT',
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: tx.gasPrice.toString(),
          timestamp: new Date().toISOString(),
          confirmations: receipt.confirmations,
          blockNumber: receipt.blockNumber
        };

        // Store transaction in memory
        global.transactions = global.transactions || {};
        global.transactions[tx.hash] = transactionStatus;

        res.json({
          success: true,
          transaction: transactionStatus,
          message: 'Real USDT transaction sent successfully!'
        });
        
      } catch (error) {
        console.error('Error sending real transaction:', error);
        res.status(500).json({
          error: 'Failed to send real transaction',
          message: error.message
        });
      }
    } else {
      // Fallback to mock transaction for demo purposes
      const mockTransaction = {
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        from: fromAddress,
        to: toAddress,
        value: ethers.parseEther(amount.toString()),
        gasLimit: 21000,
        gasPrice: ethers.parseUnits('20', 'gwei'),
        nonce: Math.floor(Math.random() * 1000),
        data: '0x',
        chainId: 11155111 // Sepolia chain ID
      };

      const transactionStatus = {
        hash: mockTransaction.hash,
        status: 'pending',
        from: fromAddress,
        to: toAddress,
        amount: amount,
        currency: 'USDT',
        gasUsed: '21000',
        gasPrice: '20000000000',
        timestamp: new Date().toISOString(),
        confirmations: 0,
        blockNumber: null
      };

      global.transactions = global.transactions || {};
      global.transactions[mockTransaction.hash] = transactionStatus;

      res.json({
        success: true,
        transaction: transactionStatus,
        message: 'Mock transaction created (no private key provided)',
        note: 'To send real transactions, provide a private key with USDT balance'
      });
    }

  } catch (error) {
    console.error('Error sending crypto:', error);
    res.status(500).json({
      error: 'Failed to send crypto transaction',
      message: error.message
    });
  }
};

/**
 * Get transaction status
 */
const getTransactionStatus = async (req, res) => {
  try {
    const { txHash } = req.params;

    if (!txHash) {
      return res.status(400).json({
        error: 'Transaction hash is required'
      });
    }

    // Check if transaction exists in our storage
    if (global.transactions && global.transactions[txHash]) {
      const transaction = global.transactions[txHash];
      
      // Simulate confirmation progress
      if (transaction.status === 'pending') {
        transaction.confirmations = Math.min(transaction.confirmations + 1, 12);
        if (transaction.confirmations >= 12) {
          transaction.status = 'confirmed';
          transaction.blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
        }
      }

      res.json({
        success: true,
        transaction: transaction
      });
    } else {
      res.status(404).json({
        error: 'Transaction not found'
      });
    }

  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({
      error: 'Failed to get transaction status',
      message: error.message
    });
  }
};

/**
 * Get wallet balance
 */
const getWalletBalance = async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address'
      });
    }

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(address);
    
    // Get USDT balance (simulated)
    const usdtBalance = ethers.parseUnits('1000', 6); // Mock 1000 USDT

    res.json({
      address: address,
      balances: {
        ETH: ethers.formatEther(ethBalance),
        USDT: ethers.formatUnits(usdtBalance, 6)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({
      error: 'Failed to get wallet balance',
      message: error.message
    });
  }
};

/**
 * Simulate withdrawal to bank
 */
const simulateWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    if (!amount || !bankDetails) {
      return res.status(400).json({
        error: 'Amount and bank details are required'
      });
    }

    // Simulate withdrawal process
    const withdrawal = {
      id: 'WD' + Date.now(),
      amount: amount,
      currency: 'INR',
      bankDetails: bankDetails,
      status: 'processing',
      estimatedTime: '2-3 business days',
      fee: (amount * 0.005).toFixed(2), // 0.5% withdrawal fee
      timestamp: new Date().toISOString()
    };

    // Simulate processing delay
    setTimeout(() => {
      withdrawal.status = 'completed';
    }, 5000);

    res.json({
      success: true,
      withdrawal: withdrawal,
      message: 'Withdrawal request submitted successfully'
    });

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      error: 'Failed to process withdrawal',
      message: error.message
    });
  }
};

module.exports = {
  sendCrypto,
  getTransactionStatus,
  getWalletBalance,
  simulateWithdrawal
}; 