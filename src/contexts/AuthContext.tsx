import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AuthUser, 
  AuthSession, 
  signUpUser, 
  loginUser, 
  logoutUser, 
  validateSession,
  getStoredSession 
} from '../lib/auth';
import { getProfile, getWallets, Profile, Wallet } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  wallets: Wallet[];
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      const [profileData, walletsData] = await Promise.all([
        getProfile(user.id),
        getWallets(user.id)
      ]);

      setProfile(profileData);
      setWallets(walletsData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Set mock data if Supabase fails
      if (!isSupabaseConfigured) {
        setProfile({
          id: user.id,
          email: user.email,
          full_name: user.profile.full_name,
          country: user.profile.country,
          preferred_currency: user.profile.preferred_currency,
          is_verified: user.profile.is_verified,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setWallets([
          {
            id: 'wallet-1',
            user_id: user.id,
            currency: 'USD',
            balance: 1000.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'wallet-2',
            user_id: user.id,
            currency: 'EUR',
            balance: 850.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'wallet-3',
            user_id: user.id,
            currency: 'INR',
            balance: 75000.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
    }
  };

  useEffect(() => {
    // Check for existing session on app load
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const sessionToken = getStoredSession();
        if (sessionToken) {
          const result = await validateSession(sessionToken);
          if (result.success && result.user && result.session) {
            setUser(result.user);
            setSession(result.session);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user?.id) {
      refreshUserData();
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      if (result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await signUpUser(email, password, name);
      
      if (!result.success) {
        throw new Error(result.error || 'Signup failed');
      }

      if (result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
      setWallets([]);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if server logout fails
      setUser(null);
      setProfile(null);
      setWallets([]);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    wallets,
    session,
    login,
    signup,
    logout,
    loading,
    refreshUserData,
    isSupabaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}