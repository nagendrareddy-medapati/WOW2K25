/*
  # Create users and currencies tables

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `phone` (text, optional)
      - `country` (text)
      - `preferred_currency` (text, default 'USD')
      - `is_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `currency` (text)
      - `balance` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `currencies`
      - `code` (text, primary key) - USD, EUR, INR, etc.
      - `name` (text) - US Dollar, Euro, etc.
      - `symbol` (text) - $, €, ₹, etc.
      - `crypto_equivalent` (text) - USDC, EUROC, etc.
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    
    - `exchange_rates`
      - `id` (uuid, primary key)
      - `from_currency` (text, references currencies)
      - `to_currency` (text, references currencies)
      - `rate` (decimal)
      - `crypto_rate` (decimal) - conversion rate via crypto
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for currencies and exchange rates
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  country text DEFAULT 'US',
  preferred_currency text DEFAULT 'USD',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  crypto_equivalent text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  currency text REFERENCES currencies(code),
  balance decimal(15,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Create exchange rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text REFERENCES currencies(code),
  to_currency text REFERENCES currencies(code),
  rate decimal(10,6) NOT NULL,
  crypto_rate decimal(10,6) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can read own wallets"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallets"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wallets"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Currencies policies (public read)
CREATE POLICY "Anyone can read currencies"
  ON currencies
  FOR SELECT
  TO authenticated
  USING (true);

-- Exchange rates policies (public read)
CREATE POLICY "Anyone can read exchange rates"
  ON exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample currencies
INSERT INTO currencies (code, name, symbol, crypto_equivalent) VALUES
  ('USD', 'US Dollar', '$', 'USDC'),
  ('EUR', 'Euro', '€', 'EUROC'),
  ('GBP', 'British Pound', '£', 'GBPC'),
  ('INR', 'Indian Rupee', '₹', 'INRC'),
  ('JPY', 'Japanese Yen', '¥', 'JPYC'),
  ('CAD', 'Canadian Dollar', 'C$', 'CADC'),
  ('AUD', 'Australian Dollar', 'A$', 'AUDC'),
  ('CHF', 'Swiss Franc', 'CHF', 'CHFC'),
  ('CNY', 'Chinese Yuan', '¥', 'CNYC'),
  ('AED', 'UAE Dirham', 'د.إ', 'AEDC'),
  ('SGD', 'Singapore Dollar', 'S$', 'SGDC'),
  ('HKD', 'Hong Kong Dollar', 'HK$', 'HKDC'),
  ('KRW', 'South Korean Won', '₩', 'KRWC'),
  ('MXN', 'Mexican Peso', '$', 'MXNC'),
  ('BRL', 'Brazilian Real', 'R$', 'BRLC')
ON CONFLICT (code) DO NOTHING;

-- Insert sample exchange rates (mock real-time rates)
INSERT INTO exchange_rates (from_currency, to_currency, rate, crypto_rate) VALUES
  ('USD', 'EUR', 0.85, 0.84),
  ('USD', 'GBP', 0.73, 0.72),
  ('USD', 'INR', 83.24, 82.95),
  ('USD', 'JPY', 149.50, 149.20),
  ('USD', 'CAD', 1.35, 1.34),
  ('USD', 'AUD', 1.52, 1.51),
  ('USD', 'CHF', 0.88, 0.87),
  ('USD', 'CNY', 7.25, 7.23),
  ('USD', 'AED', 3.67, 3.66),
  ('USD', 'SGD', 1.34, 1.33),
  ('USD', 'HKD', 7.80, 7.79),
  ('USD', 'KRW', 1320.50, 1318.75),
  ('USD', 'MXN', 17.85, 17.80),
  ('USD', 'BRL', 5.15, 5.12),
  -- Reverse rates
  ('EUR', 'USD', 1.18, 1.19),
  ('GBP', 'USD', 1.37, 1.39),
  ('INR', 'USD', 0.012, 0.0121),
  ('JPY', 'USD', 0.0067, 0.0067),
  ('CAD', 'USD', 0.74, 0.75),
  ('AUD', 'USD', 0.66, 0.66),
  ('CHF', 'USD', 1.14, 1.15),
  ('CNY', 'USD', 0.138, 0.138),
  ('AED', 'USD', 0.272, 0.273),
  ('SGD', 'USD', 0.75, 0.75),
  ('HKD', 'USD', 0.128, 0.128),
  ('KRW', 'USD', 0.00076, 0.00076),
  ('MXN', 'USD', 0.056, 0.056),
  ('BRL', 'USD', 0.194, 0.195)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();