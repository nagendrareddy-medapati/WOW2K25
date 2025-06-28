import Currency from '../models/Currency.js';
import ExchangeRate from '../models/ExchangeRate.js';

export const seedDatabase = async () => {
  try {
    // Check if currencies already exist
    const currencyCount = await Currency.countDocuments();
    if (currencyCount > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    console.log('🌱 Seeding database...');

    // Seed currencies
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', cryptoEquivalent: 'USDC' },
      { code: 'EUR', name: 'Euro', symbol: '€', cryptoEquivalent: 'EUROC' },
      { code: 'GBP', name: 'British Pound', symbol: '£', cryptoEquivalent: 'GBPC' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', cryptoEquivalent: 'INRC' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', cryptoEquivalent: 'JPYC' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', cryptoEquivalent: 'CADC' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', cryptoEquivalent: 'AUDC' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', cryptoEquivalent: 'CHFC' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', cryptoEquivalent: 'CNYC' },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', cryptoEquivalent: 'AEDC' },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', cryptoEquivalent: 'SGDC' },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', cryptoEquivalent: 'HKDC' },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', cryptoEquivalent: 'KRWC' },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', cryptoEquivalent: 'MXNC' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', cryptoEquivalent: 'BRLC' }
    ];

    await Currency.insertMany(currencies);
    console.log('✅ Currencies seeded');

    // Seed exchange rates
    const exchangeRates = [
      { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.85, cryptoRate: 0.84 },
      { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.73, cryptoRate: 0.72 },
      { fromCurrency: 'USD', toCurrency: 'INR', rate: 83.24, cryptoRate: 82.95 },
      { fromCurrency: 'USD', toCurrency: 'JPY', rate: 149.50, cryptoRate: 149.20 },
      { fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.35, cryptoRate: 1.34 },
      { fromCurrency: 'USD', toCurrency: 'AUD', rate: 1.52, cryptoRate: 1.51 },
      { fromCurrency: 'USD', toCurrency: 'CHF', rate: 0.88, cryptoRate: 0.87 },
      { fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.25, cryptoRate: 7.23 },
      { fromCurrency: 'USD', toCurrency: 'AED', rate: 3.67, cryptoRate: 3.66 },
      { fromCurrency: 'USD', toCurrency: 'SGD', rate: 1.34, cryptoRate: 1.33 },
      { fromCurrency: 'USD', toCurrency: 'HKD', rate: 7.80, cryptoRate: 7.79 },
      { fromCurrency: 'USD', toCurrency: 'KRW', rate: 1320.50, cryptoRate: 1318.75 },
      { fromCurrency: 'USD', toCurrency: 'MXN', rate: 17.85, cryptoRate: 17.80 },
      { fromCurrency: 'USD', toCurrency: 'BRL', rate: 5.15, cryptoRate: 5.12 },
      // Reverse rates
      { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.18, cryptoRate: 1.19 },
      { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.37, cryptoRate: 1.39 },
      { fromCurrency: 'INR', toCurrency: 'USD', rate: 0.012, cryptoRate: 0.0121 },
      { fromCurrency: 'JPY', toCurrency: 'USD', rate: 0.0067, cryptoRate: 0.0067 },
      { fromCurrency: 'CAD', toCurrency: 'USD', rate: 0.74, cryptoRate: 0.75 },
      { fromCurrency: 'AUD', toCurrency: 'USD', rate: 0.66, cryptoRate: 0.66 },
      { fromCurrency: 'CHF', toCurrency: 'USD', rate: 1.14, cryptoRate: 1.15 },
      { fromCurrency: 'CNY', toCurrency: 'USD', rate: 0.138, cryptoRate: 0.138 },
      { fromCurrency: 'AED', toCurrency: 'USD', rate: 0.272, cryptoRate: 0.273 },
      { fromCurrency: 'SGD', toCurrency: 'USD', rate: 0.75, cryptoRate: 0.75 },
      { fromCurrency: 'HKD', toCurrency: 'USD', rate: 0.128, cryptoRate: 0.128 },
      { fromCurrency: 'KRW', toCurrency: 'USD', rate: 0.00076, cryptoRate: 0.00076 },
      { fromCurrency: 'MXN', toCurrency: 'USD', rate: 0.056, cryptoRate: 0.056 },
      { fromCurrency: 'BRL', toCurrency: 'USD', rate: 0.194, cryptoRate: 0.195 }
    ];

    await ExchangeRate.insertMany(exchangeRates);
    console.log('✅ Exchange rates seeded');

    console.log('🎉 Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};