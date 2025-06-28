import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, getProfile, getWallets, Profile, Wallet } from '../lib/supabase';

interface AuthUser extends User {
  profile?: Profile;
  wallets?: Wallet[];
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  wallets: Wallet[];
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
          email: user.email || 'demo@cryptostream.com',
          full_name: user.user_metadata?.full_name || 'Demo User',
          country: 'US',
          preferred_currency: 'USD',
          is_verified: true,
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
    // Get initial session
    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes only if Supabase is configured
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setLoading(true);
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
            setProfile(null);
            setWallets([]);
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    if (user?.id) {
      refreshUserData();
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await signIn(email, password);
      if (data?.user) {
        setUser(data.user);
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
      const { data } = await signUp(email, password, name);
      if (data?.user) {
        setUser(data.user);
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
      await signOut();
      setUser(null);
      setProfile(null);
      setWallets([]);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    wallets,
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