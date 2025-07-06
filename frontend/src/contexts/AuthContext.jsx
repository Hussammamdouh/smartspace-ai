import { createContext, useState, useEffect, useContext, useRef } from "react";
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
  const verifyingRef = useRef(false); // Prevent multiple simultaneous verifications

  // Verify token and get user data on mount
  const verifyToken = async () => {
    // Prevent multiple simultaneous verifications
    if (verifyingRef.current) {
      return;
    }
    
    verifyingRef.current = true;
    
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Checking for token:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      // Try to refresh if refresh token exists
      if (refreshToken) {
        try {
          const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          // Retry /auth/me with new token
          verifyingRef.current = false;
          return await verifyToken();
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          verifyingRef.current = false;
          return;
        }
      }
      console.log('No token found, skipping verification');
      setLoading(false);
      verifyingRef.current = false;
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
      
      // If token expired, try to refresh
      if (error.response?.data?.message?.toLowerCase().includes('expired') && refreshToken) {
        try {
          const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          // Retry /auth/me with new token
          verifyingRef.current = false;
          return await verifyToken();
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        // Don't clear tokens if it's just a network issue
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
      verifyingRef.current = false;
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (userData, token, refreshToken) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Failed to save login information');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await axiosInstance.get('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser) => {
    try {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user information');
    }
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
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
