/*
  # Enhanced Authentication System

  1. New Tables
    - `user_credentials`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text) - hashed password
      - `salt` (text) - password salt
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
      - `is_active` (boolean, default true)
    
    - Enhanced `profiles` table
      - Links to user_credentials
      - Stores user profile information
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_credentials)
      - `session_token` (text, unique)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `ip_address` (text, optional)
      - `user_agent` (text, optional)

  2. Security
    - Enable RLS on all tables
    - Password hashing with bcrypt
    - Session management
    - Secure authentication flow
*/

-- Create user_credentials table for storing authentication data
CREATE TABLE IF NOT EXISTS user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  salt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamptz
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_credentials(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true
);

-- Update profiles table to reference user_credentials
DO $$
BEGIN
  -- Add user_credentials_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_credentials_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_credentials_id uuid REFERENCES user_credentials(id) ON DELETE CASCADE;
  END IF;
  
  -- Make email not required to be unique in profiles since it's in user_credentials
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User credentials policies (very restrictive)
CREATE POLICY "Users can read own credentials"
  ON user_credentials
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own credentials"
  ON user_credentials
  FOR UPDATE
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Session policies
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

-- Function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create user with hashed password
CREATE OR REPLACE FUNCTION create_user_with_credentials(
  p_email text,
  p_password text,
  p_full_name text,
  p_country text DEFAULT 'US',
  p_preferred_currency text DEFAULT 'USD'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salt text;
  v_password_hash text;
  v_user_id uuid;
  v_profile_id uuid;
  v_result json;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM user_credentials WHERE email = p_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email already exists');
  END IF;
  
  -- Generate salt and hash password
  v_salt := gen_salt('bf', 12);
  v_password_hash := crypt(p_password, v_salt);
  
  -- Insert user credentials
  INSERT INTO user_credentials (email, password_hash, salt)
  VALUES (p_email, v_password_hash, v_salt)
  RETURNING id INTO v_user_id;
  
  -- Create profile
  INSERT INTO profiles (id, user_credentials_id, email, full_name, country, preferred_currency)
  VALUES (gen_random_uuid(), v_user_id, p_email, p_full_name, p_country, p_preferred_currency)
  RETURNING id INTO v_profile_id;
  
  -- Create default USD wallet
  INSERT INTO wallets (user_id, currency, balance)
  VALUES (v_profile_id, p_preferred_currency, 1000.00);
  
  -- Return success with user info
  v_result := json_build_object(
    'success', true,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'email', p_email,
    'full_name', p_full_name
  );
  
  RETURN v_result;
END;
$$;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email text,
  p_password text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record record;
  v_profile_record record;
  v_session_token text;
  v_session_id uuid;
  v_expires_at timestamptz;
  v_result json;
BEGIN
  -- Get user credentials
  SELECT * INTO v_user_record
  FROM user_credentials
  WHERE email = p_email AND is_active = true;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid email or password');
  END IF;
  
  -- Check if account is locked
  IF v_user_record.locked_until IS NOT NULL AND v_user_record.locked_until > now() THEN
    RETURN json_build_object('success', false, 'error', 'Account temporarily locked due to failed login attempts');
  END IF;
  
  -- Verify password
  IF v_user_record.password_hash != crypt(p_password, v_user_record.salt) THEN
    -- Increment failed login attempts
    UPDATE user_credentials 
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= 5 THEN now() + interval '15 minutes'
        ELSE NULL
      END
    WHERE id = v_user_record.id;
    
    RETURN json_build_object('success', false, 'error', 'Invalid email or password');
  END IF;
  
  -- Get user profile
  SELECT * INTO v_profile_record
  FROM profiles
  WHERE user_credentials_id = v_user_record.id;
  
  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := now() + interval '7 days';
  
  -- Create session
  INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (v_user_record.id, v_session_token, v_expires_at, p_ip_address, p_user_agent)
  RETURNING id INTO v_session_id;
  
  -- Update last login and reset failed attempts
  UPDATE user_credentials 
  SET 
    last_login = now(),
    failed_login_attempts = 0,
    locked_until = NULL
  WHERE id = v_user_record.id;
  
  -- Return success with user info and session
  v_result := json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user_record.id,
      'email', v_user_record.email,
      'profile', json_build_object(
        'id', v_profile_record.id,
        'full_name', v_profile_record.full_name,
        'country', v_profile_record.country,
        'preferred_currency', v_profile_record.preferred_currency,
        'is_verified', v_profile_record.is_verified
      )
    ),
    'session', json_build_object(
      'token', v_session_token,
      'expires_at', v_expires_at
    )
  );
  
  RETURN v_result;
END;
$$;

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(p_session_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_record record;
  v_user_record record;
  v_profile_record record;
  v_result json;
BEGIN
  -- Get session
  SELECT s.*, uc.email, uc.is_active as user_active
  INTO v_session_record
  FROM user_sessions s
  JOIN user_credentials uc ON s.user_id = uc.id
  WHERE s.session_token = p_session_token 
    AND s.is_active = true 
    AND s.expires_at > now();
  
  -- Check if session exists and is valid
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired session');
  END IF;
  
  -- Check if user is still active
  IF NOT v_session_record.user_active THEN
    RETURN json_build_object('success', false, 'error', 'User account is deactivated');
  END IF;
  
  -- Get user profile
  SELECT * INTO v_profile_record
  FROM profiles
  WHERE user_credentials_id = v_session_record.user_id;
  
  -- Return user info
  v_result := json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_session_record.user_id,
      'email', v_session_record.email,
      'profile', json_build_object(
        'id', v_profile_record.id,
        'full_name', v_profile_record.full_name,
        'country', v_profile_record.country,
        'preferred_currency', v_profile_record.preferred_currency,
        'is_verified', v_profile_record.is_verified
      )
    ),
    'session', json_build_object(
      'token', p_session_token,
      'expires_at', v_session_record.expires_at
    )
  );
  
  RETURN v_result;
END;
$$;

-- Function to logout (invalidate session)
CREATE OR REPLACE FUNCTION logout_user(p_session_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate session
  UPDATE user_sessions 
  SET is_active = false 
  WHERE session_token = p_session_token;
  
  RETURN json_build_object('success', true, 'message', 'Logged out successfully');
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_email ON user_credentials(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_credentials_id ON profiles(user_credentials_id);

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now() - interval '1 day';
END;
$$;