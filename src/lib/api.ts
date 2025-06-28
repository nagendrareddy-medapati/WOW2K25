import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cryptostream_session');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('cryptostream_session');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  email: string;
  profile: {
    fullName: string;
    country: string;
    preferredCurrency: string;
    isVerified: boolean;
    avatarUrl?: string;
    phone?: string;
  };
}

export interface AuthSession {
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  message?: string;
  errors?: any[];
}

export interface Wallet {
  _id: string;
  userId: string;
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  cryptoEquivalent: string;
  isActive: boolean;
}

export interface ExchangeRate {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  cryptoRate: number;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  senderId: string;
  recipientId?: string;
  recipientEmail: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
  cryptoRoute?: string;
  fee: number;
  savings?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  purpose: string;
  message?: string;
  transactionId: string;
  estimatedArrival?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API functions
export const authAPI = {
  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        fullName
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
        errors: error.response?.data?.errors
      };
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  validateSession: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Session validation failed'
      };
    }
  }
};

// User API functions
export const userAPI = {
  getProfile: async (): Promise<{ success: boolean; user?: AuthUser; message?: string }> => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      };
    }
  },

  getAllUsers: async (): Promise<{ success: boolean; users?: any[]; message?: string }> => {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get users'
      };
    }
  },

  updateProfile: async (profileData: any): Promise<{ success: boolean; user?: AuthUser; message?: string }> => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }
};

// Wallet API functions
export const walletAPI = {
  getWallets: async (): Promise<{ success: boolean; wallets?: Wallet[]; message?: string }> => {
    try {
      const response = await api.get('/wallets');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get wallets'
      };
    }
  },

  createWallet: async (currency: string): Promise<{ success: boolean; wallet?: Wallet; message?: string }> => {
    try {
      const response = await api.post('/wallets', { currency });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create wallet'
      };
    }
  }
};

// Currency API functions
export const currencyAPI = {
  getCurrencies: async (): Promise<{ success: boolean; currencies?: Currency[]; message?: string }> => {
    try {
      const response = await api.get('/currencies');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get currencies'
      };
    }
  },

  getExchangeRates: async (): Promise<{ success: boolean; exchangeRates?: ExchangeRate[]; message?: string }> => {
    try {
      const response = await api.get('/currencies/exchange-rates');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get exchange rates'
      };
    }
  },

  getExchangeRate: async (from: string, to: string): Promise<{ success: boolean; exchangeRate?: ExchangeRate; message?: string }> => {
    try {
      const response = await api.get(`/currencies/exchange-rate/${from}/${to}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get exchange rate'
      };
    }
  }
};

// Transaction API functions
export const transactionAPI = {
  getTransactions: async (params?: any): Promise<{ success: boolean; transactions?: Transaction[]; pagination?: any; message?: string }> => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get transactions'
      };
    }
  },

  createTransaction: async (transactionData: any): Promise<{ success: boolean; transaction?: Transaction; message?: string }> => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create transaction'
      };
    }
  },

  getTransaction: async (id: string): Promise<{ success: boolean; transaction?: Transaction; message?: string }> => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get transaction'
      };
    }
  }
};

export default api;