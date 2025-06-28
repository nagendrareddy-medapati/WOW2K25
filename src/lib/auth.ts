import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  profile: {
    id: string;
    full_name: string;
    country: string;
    preferred_currency: string;
    is_verified: boolean;
  };
}

export interface AuthSession {
  token: string;
  expires_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

// Store session in localStorage
const SESSION_KEY = 'cryptostream_session';

export const getStoredSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export const setStoredSession = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, token);
};

export const removeStoredSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
};

// Check if Supabase is configured
const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Mock authentication for development when Supabase is not configured
const mockAuth = {
  signup: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists in localStorage
    const existingUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (existingUsers.find((u: any) => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }
    
    // Create mock user
    const mockUser: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email,
      profile: {
        id: 'mock-profile-' + Date.now(),
        full_name: fullName,
        country: 'US',
        preferred_currency: 'USD',
        is_verified: false
      }
    };
    
    const mockSession: AuthSession = {
      token: 'mock-session-' + Date.now(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Store user and session
    existingUsers.push({ ...mockUser, password });
    localStorage.setItem('mock_users', JSON.stringify(existingUsers));
    setStoredSession(mockSession.token);
    
    return { success: true, user: mockUser, session: mockSession };
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials
    const existingUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = existingUsers.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    const mockSession: AuthSession = {
      token: 'mock-session-' + Date.now(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    setStoredSession(mockSession.token);
    
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      }, 
      session: mockSession 
    };
  },
  
  validateSession: async (token: string): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!token || !token.startsWith('mock-session-')) {
      return { success: false, error: 'Invalid session' };
    }
    
    // For mock, just return a valid user
    const existingUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const user = existingUsers[0]; // Return first user for simplicity
    
    if (!user) {
      return { success: false, error: 'No user found' };
    }
    
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile
      },
      session: {
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  },
  
  logout: async (): Promise<{ success: boolean }> => {
    removeStoredSession();
    return { success: true };
  }
};

// Real authentication functions using Supabase
export const signUpUser = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
  if (!isSupabaseConfigured) {
    return mockAuth.signup(email, password, fullName);
  }

  try {
    const { data, error } = await supabase.rpc('create_user_with_credentials', {
      p_email: email,
      p_password: password,
      p_full_name: fullName
    });

    if (error) throw error;

    if (!data.success) {
      return { success: false, error: data.error };
    }

    // Now authenticate the user to get a session
    return loginUser(email, password);
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  if (!isSupabaseConfigured) {
    return mockAuth.login(email, password);
  }

  try {
    // Get client IP and user agent for security
    const userAgent = navigator.userAgent;
    
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_email: email,
      p_password: password,
      p_user_agent: userAgent
    });

    if (error) throw error;

    if (!data.success) {
      return { success: false, error: data.error };
    }

    // Store session token
    setStoredSession(data.session.token);

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

export const validateSession = async (token?: string): Promise<AuthResponse> => {
  const sessionToken = token || getStoredSession();
  
  if (!sessionToken) {
    return { success: false, error: 'No session found' };
  }

  if (!isSupabaseConfigured) {
    return mockAuth.validateSession(sessionToken);
  }

  try {
    const { data, error } = await supabase.rpc('validate_session', {
      p_session_token: sessionToken
    });

    if (error) throw error;

    if (!data.success) {
      removeStoredSession();
      return { success: false, error: data.error };
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error: any) {
    console.error('Session validation error:', error);
    removeStoredSession();
    return { success: false, error: error.message || 'Session validation failed' };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  const sessionToken = getStoredSession();
  
  if (!isSupabaseConfigured) {
    return mockAuth.logout();
  }

  try {
    if (sessionToken) {
      const { data, error } = await supabase.rpc('logout_user', {
        p_session_token: sessionToken
      });

      if (error) throw error;
    }

    removeStoredSession();
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    removeStoredSession(); // Remove session even if server logout fails
    return { success: false, error: error.message || 'Logout failed' };
  }
};

// Password validation helper
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};