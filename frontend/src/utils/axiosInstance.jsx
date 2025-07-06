import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for image generation and long operations
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized) - but only for authenticated requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh token logic for auth endpoints (login, register, etc.)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (isAuthEndpoint) {
        // For auth endpoints, just return the error without trying to refresh
        return Promise.reject(error);
      }

      // Skip if this is a login/register request that failed
      const isLoginRequest = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register');
      if (isLoginRequest) {
        return Promise.reject(error);
      }

      // Skip if this is a logout request
      const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
      if (isLogoutRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Only redirect if we're not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );
        
        // Store new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network error:', error);
      // Don't redirect for network errors, just return the error
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
