import { authAPI, AuthUser, AuthSession } from './api';

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

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

// MongoDB-based authentication functions
export const signUpUser = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
  try {
    const result = await authAPI.signup(email, password, fullName);
    
    if (!result.success) {
      return { success: false, error: result.message || 'Signup failed' };
    }

    if (result.session?.token) {
      setStoredSession(result.session.token);
    }

    return {
      success: true,
      user: result.user,
      session: result.session
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const result = await authAPI.login(email, password);
    
    if (!result.success) {
      return { success: false, error: result.message || 'Login failed' };
    }

    if (result.session?.token) {
      setStoredSession(result.session.token);
    }

    return {
      success: true,
      user: result.user,
      session: result.session
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

  try {
    const result = await authAPI.validateSession();
    
    if (!result.success) {
      removeStoredSession();
      return { success: false, error: result.message || 'Session validation failed' };
    }

    return {
      success: true,
      user: result.user,
      session: result.session
    };
  } catch (error: any) {
    console.error('Session validation error:', error);
    removeStoredSession();
    return { success: false, error: error.message || 'Session validation failed' };
  }
};

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await authAPI.logout();
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