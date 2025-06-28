const express = require('express');
const router = express.Router();
const convertController = require('../controllers/convertController');

// Convert INR to USDT or ETH
router.post('/inr-to-crypto', convertController.convertINRToCrypto);

// Get exchange rates
router.get('/rates', convertController.getExchangeRates);

// Get fee comparison
router.get('/fee-comparison', convertController.getFeeComparison);

module.exports = router; 