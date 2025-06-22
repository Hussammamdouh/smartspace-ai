import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same API base URL as AuthContext
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // For Android emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // For iOS simulator

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      // Use the same key as AuthContext
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(userData: {
    name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.makeRequest('/auth/profile', {
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
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.makeRequest(`/inventory/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.makeRequest(`/inventory/products/${id}`);
  }

  async getCategories() {
    return this.makeRequest('/inventory/categories');
  }

  // Cart endpoints
  async getCart() {
    return this.makeRequest('/orders/cart');
  }

  async addToCart(productId: string, quantity: number = 1) {
    return this.makeRequest('/orders/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.makeRequest(`/orders/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.makeRequest(`/orders/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist endpoints
  async getWishlist() {
    return this.makeRequest('/user/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.makeRequest('/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.makeRequest(`/user/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getOrder(id: string) {
    return this.makeRequest(`/orders/${id}`);
  }

  // AI Design endpoints
  async generateDesign(designData: {
    roomType: string;
    style: string;
    description: string;
    preferences?: string[];
  }) {
    return this.makeRequest('/design/generate', {
      method: 'POST',
      body: JSON.stringify(designData),
    });
  }

  async getDesigns() {
    return this.makeRequest('/design/user-designs');
  }

  async getDesign(id: string) {
    return this.makeRequest(`/design/${id}`);
  }

  async editDesign(designId: string, editData: {
    description: string;
    style?: string;
  }) {
    return this.makeRequest(`/design/${designId}/edit`, {
      method: 'PUT',
      body: JSON.stringify(editData),
    });
  }

  // Chat endpoints
  async sendMessage(message: string) {
    return this.makeRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getChatHistory() {
    return this.makeRequest('/chat/history');
  }

  // File upload
  async uploadImage(imageUri: string, uploadType: 'profile' | 'design' = 'profile') {
    try {
      const token = await this.getAuthToken();
      const formData = new FormData();
      
      // Create file object from URI
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const response = await fetch(`${API_BASE_URL}/upload/${uploadType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message,
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: 'Upload failed',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService; 