import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dynamic API base URL based on platform and environment
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'android') {
      // For Android emulator:
      // return 'http://10.0.2.2:5000/api';
      // For physical device, use your computer's LAN IP:
      return 'http://192.168.1.13:5000/api'; // <-- replace with your actual IP
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:5000/api'; // iOS simulator
    } else {
      return 'http://localhost:5000/api'; // Web
    }
  } else {
    // Production environment - replace with your actual production URL
    return 'https://your-production-api.com/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private abortController: AbortController | null = null;

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Cancel previous request if it exists
    if (this.abortController) {
      this.abortController.abort();
    }

    // Always create a new AbortController for each request
    const abortController = new AbortController();
    this.abortController = abortController;

    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers,
        signal: abortController.signal,
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return {
          success: false,
          error: `Invalid response format: ${response.status} - ${text}`,
        };
      }
      
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your internet connection.',
        };
      }
      
      if (error instanceof Error) {
        // Check if request was aborted
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request was cancelled',
          };
        }
        return {
          success: false,
          error: error.message || 'Network error occurred',
        };
      }
      
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      // Clear the abort controller after request completes
      this.abortController = null;
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }
    return this.makeRequest<T>(endpoint, options);
  }

  private handleError(error: any): ApiResponse<any> {
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }

  // Helper method to normalize backend response
  private normalizeResponse(response: any): ApiResponse<any> {
    console.log('Normalizing response:', response);
    
    // If response is already normalized (has success property), return as is
    if (response.hasOwnProperty('success')) {
      return response;
    }
    
    // Backend returns { status: 'success', data, message } 
    // We need to convert to { success: true, data, message }
    if (response.status === 'success') {
      return {
        success: true,
        data: response.data || response,
        message: response.message,
      };
    } else if (response.status === 'error' || response.status === 'fail') {
      return {
        success: false,
        error: response.message || 'Request failed',
        data: response.data,
      };
    } else {
      // If no status field, assume success if we have data
      return {
        success: true,
        data: response.data || response,
        message: response.message,
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.makeRequest('/health');
      
      // For health check, we want to return success if we get a 200 response
      if (response.success) {
        return response;
      } else {
        // If the response has status: 'success' but our normalization failed
        if (response.data && (response.data as any).status === 'success') {
          return {
            success: true,
            data: response.data,
            message: 'Health check successful'
          };
        }
        return response;
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // The backend returns { status: 'success', token, refreshToken, data: { user } }
    // We need to extract token and user properly
    if (response.success && response.data) {
      const backendData = response.data as any;
      
      return {
        success: true,
        data: {
          token: backendData.token,
          user: backendData.data?.user
        },
        message: response.message
      };
    }
    
    return response;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirm: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.authenticatedRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string, passwordConfirm: string) {
    return this.makeRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, passwordConfirm }),
    });
  }

  async verifyEmail(token: string) {
    return this.makeRequest(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  }

  async resendVerification(email: string) {
    return this.makeRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile() {
    return this.authenticatedRequest('/auth/profile');
  }

  async updateProfile(userData: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.authenticatedRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Products endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    style?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    sortBy?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.style) queryParams.append('style', params.style);
      if (params?.color) queryParams.append('color', params.color);
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params?.available) queryParams.append('available', params.available.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

      const query = queryParams.toString();
      const response = await this.makeRequest(`/inventory${query ? `?${query}` : ''}`);
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProduct(id: string) {
    try {
      console.log(`Fetching product with ID: ${id}`);
      const response = await this.makeRequest(`/inventory/${id}`);
      console.log('Raw API response:', response);
      const normalized = this.normalizeResponse(response);
      console.log('Normalized response:', normalized);
      return normalized;
    } catch (error) {
      console.error('Error in getProduct:', error);
      return this.handleError(error);
    }
  }

  async getCategories() {
    try {
      const response = await this.makeRequest('/inventory/categories');
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Cart endpoints
  async getCart() {
    try {
      const response = await this.authenticatedRequest('/cart');
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addToCart(productId: string, quantity: number = 1) {
    try {
      const response = await this.authenticatedRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateCartItem(itemId: string, quantity: number) {
    try {
      const response = await this.authenticatedRequest(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeFromCart(itemId: string) {
    try {
      const response = await this.authenticatedRequest(`/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async clearCart() {
    try {
      const response = await this.authenticatedRequest('/cart/clear', {
        method: 'DELETE',
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Wishlist endpoints
  async getWishlist() {
    try {
      const response = await this.authenticatedRequest('/wishlist');
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addToWishlist(productId: string) {
    try {
      const response = await this.authenticatedRequest('/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async removeFromWishlist(productId: string) {
    try {
      const response = await this.authenticatedRequest(`/wishlist/remove/${productId}`, {
        method: 'DELETE',
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async clearWishlist() {
    try {
      const response = await this.authenticatedRequest('/wishlist/clear', {
        method: 'DELETE',
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Orders endpoints
  async createOrder(orderData: {
    products: Array<{ 
      productId: string; 
      name: string;
      quantity: number; 
      price: number;
    }>;
    total: number;
    paymentMethod: 'card' | 'cash-on-delivery';
    shippingAddress: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone: string;
    };
  }) {
    try {
      const response = await this.authenticatedRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrders(page: number = 1, limit: number = 10) {
    try {
      const response = await this.authenticatedRequest(`/orders?page=${page}&limit=${limit}`);
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getOrder(orderId: string) {
    try {
      const response = await this.authenticatedRequest(`/orders/${orderId}`);
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const response = await this.authenticatedRequest(`/orders/${orderId}/cancel`, {
        method: 'PUT',
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Design endpoints
  async generateDesign(designData: {
    roomType: string;
    style: string;
    description: string;
    preferences?: string[];
  }) {
    try {
      const response = await this.authenticatedRequest('/designs/generate-simple', {
        method: 'POST',
        body: JSON.stringify(designData),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDesigns() {
    try {
      const response = await this.authenticatedRequest('/designs/user');
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getDesign(id: string) {
    try {
      const response = await this.authenticatedRequest(`/designs/${id}`);
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async editDesign(designId: string, editData: {
    description: string;
    style?: string;
  }) {
    try {
      const response = await this.authenticatedRequest(`/designs/${designId}/edit`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Chat endpoints
  async sendMessage(message: string) {
    try {
      const response = await this.authenticatedRequest('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getChatHistory() {
    try {
      const response = await this.authenticatedRequest('/chat/history');
      return this.normalizeResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // File upload
  async uploadImage(imageUri: string, type: 'profile' | 'design' = 'profile') {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      formData.append('type', type);

      const response = await this.authenticatedRequest('/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService; 