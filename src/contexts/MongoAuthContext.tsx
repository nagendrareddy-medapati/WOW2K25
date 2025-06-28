import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  AuthUser, 
  AuthSession, 
  signUpUser, 
  loginUser, 
  logoutUser, 
  validateSession,
  getStoredSession 
} from '../lib/mongoAuth';
import { userAPI, walletAPI, Wallet } from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  wallets: Wallet[];
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  isMongoConnected: boolean;
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

export function MongoAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMongoConnected, setIsMongoConnected] = useState(false);

  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      // Get user profile
      const profileResult = await userAPI.getProfile();
      if (profileResult.success && profileResult.user) {
        setUser(profileResult.user);
      }

      // Get user wallets
      const walletsResult = await walletAPI.getWallets();
      if (walletsResult.success && walletsResult.wallets) {
        setWallets(walletsResult.wallets);
      }

      setIsMongoConnected(true);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setIsMongoConnected(false);
      
      // Set mock data if MongoDB is not available
      setWallets([
        {
          _id: 'wallet-1',
          userId: user.id,
          currency: 'USD',
          balance: 1000.00,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'wallet-2',
          userId: user.id,
          currency: 'EUR',
          balance: 850.00,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'wallet-3',
          userId: user.id,
          currency: 'INR',
          balance: 75000.00,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
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
            setIsMongoConnected(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsMongoConnected(false);
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
        setIsMongoConnected(true);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsMongoConnected(false);
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
        setIsMongoConnected(true);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setIsMongoConnected(false);
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
      setWallets([]);
      setSession(null);
      setIsMongoConnected(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if server logout fails
      setUser(null);
      setWallets([]);
      setSession(null);
      setIsMongoConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    wallets,
    session,
    login,
    signup,
    logout,
    loading,
    refreshUserData,
    isMongoConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}