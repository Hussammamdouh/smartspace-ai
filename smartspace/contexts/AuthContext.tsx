import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://10.0.2.2:5000/api'; // For Android emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // For iOS simulator

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token with backend
        await verifyToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      if (data.success || data.status === 'success') {
        const userData = data.data || data;
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      await clearAuth();
    }
  };

  const clearAuth = async () => {
    setUser(null);
    setToken(null);
    await Promise.all([
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('user'),
    ]);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      if (data.success || data.status === 'success') {
        const userData = data.data?.user || data.user || data.data;
        const tokenData = data.data?.token || data.token;
        
        setUser(userData);
        setToken(tokenData);
        
        await Promise.all([
          AsyncStorage.setItem('authToken', tokenData),
          AsyncStorage.setItem('user', JSON.stringify(userData)),
        ]);

        router.replace('/(tabs)');
      } else {
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      if (data.success || data.status === 'success') {
        const userData = data.data?.user || data.user || data.data;
        const tokenData = data.data?.token || data.token;
        
        setUser(userData);
        setToken(tokenData);
        
        await Promise.all([
          AsyncStorage.setItem('authToken', tokenData),
          AsyncStorage.setItem('user', JSON.stringify(userData)),
        ]);

        router.replace('/(tabs)');
      } else {
        throw new Error(data.message || data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearAuth();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 