const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

// Send crypto transaction
router.post('/send', cryptoController.sendCrypto);

// Get transaction status
router.get('/transaction/:txHash', cryptoController.getTransactionStatus);

// Get wallet balance
router.get('/balance/:address', cryptoController.getWalletBalance);

// Simulate withdrawal to bank
router.post('/withdraw', cryptoController.simulateWithdrawal);

module.exports = router; 