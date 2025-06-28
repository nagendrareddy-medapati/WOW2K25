import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client for development
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock client for development.');
  // Create a mock client that won't break the app
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) })
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  country: string;
  preferred_currency: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  crypto_equivalent: string;
  is_active: boolean;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  crypto_rate: number;
  updated_at: string;
}

// Mock data for development
const mockCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', crypto_equivalent: 'USDC', is_active: true, created_at: new Date().toISOString() },
  { code: 'EUR', name: 'Euro', symbol: '€', crypto_equivalent: 'EUROC', is_active: true, created_at: new Date().toISOString() },
  { code: 'GBP', name: 'British Pound', symbol: '£', crypto_equivalent: 'GBPC', is_active: true, created_at: new Date().toISOString() },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', crypto_equivalent: 'INRC', is_active: true, created_at: new Date().toISOString() },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', crypto_equivalent: 'JPYC', is_active: true, created_at: new Date().toISOString() },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', crypto_equivalent: 'AEDC', is_active: true, created_at: new Date().toISOString() }
];

const mockExchangeRates: ExchangeRate[] = [
  { id: '1', from_currency: 'USD', to_currency: 'EUR', rate: 0.85, crypto_rate: 0.84, updated_at: new Date().toISOString() },
  { id: '2', from_currency: 'USD', to_currency: 'INR', rate: 83.24, crypto_rate: 82.95, updated_at: new Date().toISOString() },
  { id: '3', from_currency: 'USD', to_currency: 'GBP', rate: 0.73, crypto_rate: 0.72, updated_at: new Date().toISOString() },
  { id: '4', from_currency: 'USD', to_currency: 'JPY', rate: 149.50, crypto_rate: 149.20, updated_at: new Date().toISOString() },
  { id: '5', from_currency: 'USD', to_currency: 'AED', rate: 3.67, crypto_rate: 3.66, updated_at: new Date().toISOString() }
];

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Mock successful signup for development
    return {
      data: {
        user: {
          id: 'mock-user-' + Date.now(),
          email,
          user_metadata: { full_name: fullName }
        }
      },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      });

    if (profileError) throw profileError;

    // Create default USD wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .insert({
        user_id: data.user.id,
        currency: 'USD',
        balance: 1000.00, // Starting bonus
      });

    if (walletError) throw walletError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Mock successful signin for development
    return {
      data: {
        user: {
          id: 'mock-user-' + Date.now(),
          email,
          user_metadata: { full_name: 'Demo User' }
        }
      },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Data fetchers
export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return mock profile for development
    return {
      id: userId,
      email: 'demo@cryptostream.com',
      full_name: 'Demo User',
      country: 'US',
      preferred_currency: 'USD',
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const getWallets = async (userId: string): Promise<Wallet[]> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return mock wallets for development
    return [
      {
        id: 'wallet-1',
        user_id: userId,
        currency: 'USD',
        balance: 1000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'wallet-2',
        user_id: userId,
        currency: 'EUR',
        balance: 850.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'wallet-3',
        user_id: userId,
        currency: 'INR',
        balance: 75000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) throw error;
  return data || [];
};

export const getCurrencies = async (): Promise<Currency[]> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockCurrencies;
  }

  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .eq('is_active', true)
    .order('code');

  if (error) throw error;
  return data || [];
};

export const getExchangeRate = async (from: string, to: string): Promise<ExchangeRate | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return mockExchangeRates.find(rate => rate.from_currency === from && rate.to_currency === to) || null;
  }

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('from_currency', from)
    .eq('to_currency', to)
    .single();

  if (error) throw error;
  return data;
};

export const getAllUsers = async (): Promise<Profile[]> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return mock users for development
    return [
      {
        id: 'user-1',
        email: 'maria.santos@email.com',
        full_name: 'Maria Santos',
        country: 'BR',
        preferred_currency: 'BRL',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'john.smith@email.com',
        full_name: 'John Smith',
        country: 'GB',
        preferred_currency: 'GBP',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-3',
        email: 'ahmed.hassan@email.com',
        full_name: 'Ahmed Hassan',
        country: 'AE',
        preferred_currency: 'AED',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};