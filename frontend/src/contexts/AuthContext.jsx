import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for user verification

  // Verify token and get user data on mount
  const verifyToken = async () => {
    const token = localStorage.getItem('authToken');
    console.log('Checking for token:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.log('No token found, skipping verification');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to verify token...');
      const response = await axiosInstance.get('/auth/me');
      console.log('Token verification successful:', response.data);
      
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        config: error.config
      });
      
      // Check if it's a network error (backend not running)
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.log('Backend server appears to be offline');
        // Don't clear tokens if it's just a network issue
        // User can still use the app with cached data
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
      } else {
        // Clear invalid tokens for other errors
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (userData, token, refreshToken) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    // Show a loading spinner or placeholder while verifying the user
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818] text-[#E5CBBE]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5CBBE] mx-auto mb-4"></div>
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      updateUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
