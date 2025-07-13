import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  phone?: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string; passwordConfirm: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Clear ALL stored data on app start for clean cache
        console.log('🧹 Clearing ALL stored data on app start...');
        
        // Get all keys and remove them
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('📋 Found keys to clear:', allKeys);
        
        if (allKeys.length > 0) {
          await AsyncStorage.multiRemove(allKeys);
          console.log('✅ All stored data cleared successfully');
        }
        
        // Set user and token to null to ensure no automatic login
        setUser(null);
        setToken(null);
        setIsInitialized(true);
        
        console.log('✅ App started with clean cache. User will need to login manually.');
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
        setIsInitialized(true);
      }
    };
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      
      if (!res.success) {
        throw new Error(res.error || 'Login failed');
      }
      
      // Extract token and user from the response
      const { token: newToken, user: userData } = res.data as { token: string; user: User };
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      setToken(newToken);
      setUser(userData);
      await AsyncStorage.setItem('token', newToken);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; phone: string; password: string; passwordConfirm: string }) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      if (!res.success) {
        throw new Error(res.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await api.logout();
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    } catch (error) {
      // Even if backend call fails, clear local state
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      if (!res.success) {
        throw new Error(res.error || 'Failed to send reset email');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
    setLoading(true);
    try {
      const res = await api.resetPassword(token, password, passwordConfirm);
      if (!res.success) {
        throw new Error(res.error || 'Failed to reset password');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const res = await api.verifyEmail(token);
      if (!res.success) {
        throw new Error(res.error || 'Failed to verify email');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const res = await api.updateProfile(userData);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update profile');
      }
      
      if (res.data) {
        setUser(res.data as User);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        setUser(res.data as User);
      } else {
        // Token might be invalid, clear it
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
      }
    } catch (error) {
      // Clear invalid token
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isInitialized,
      login, 
      register, 
      logout, 
      forgotPassword, 
      resetPassword, 
      verifyEmail,
      updateProfile,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 