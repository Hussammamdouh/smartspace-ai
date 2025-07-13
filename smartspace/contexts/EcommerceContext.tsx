import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  style?: string;
  color?: string;
  imageUrl?: string;
  inStock: boolean;
  stock: number;
  available: boolean;
}

interface CartItem {
  _id: string;
  productId: string;
  product?: Product; // Optional for backend responses that don't nest product data
  quantity: number;
  price: number;
  // Additional fields that might come directly from backend
  name?: string;
  description?: string;
  category?: string;
  style?: string;
  color?: string;
  imageUrl?: string;
  image?: string;
  inStock?: boolean;
  available?: boolean;
  stock?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  products: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'cash-on-delivery';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
}

interface EcommerceState {
  // Products
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
  
  // Cart
  cartItems: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  
  // Orders
  orders: Order[];
  
  // Loading states
  loading: {
    products: boolean;
    cart: boolean;
    orders: boolean;
    checkout: boolean;
  };
  
  // Error states
  errors: {
    products: string | null;
    cart: string | null;
    orders: string | null;
    checkout: string | null;
  };
}

interface EcommerceContextType extends EcommerceState {
  // Product actions
  loadProducts: (filters?: any) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadFeaturedProducts: () => Promise<void>;
  
  // Cart actions
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Order actions
  loadOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<Order | null>;
  
  // Utility actions
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
}

const EcommerceContext = createContext<EcommerceContextType | undefined>(undefined);

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
};

interface EcommerceProviderProps {
  children: ReactNode;
}

export const EcommerceProvider: React.FC<EcommerceProviderProps> = ({ children }) => {
  const [state, setState] = useState<EcommerceState>({
    products: [],
    categories: [],
    featuredProducts: [],
    cartItems: [],
    cartTotal: 0,
    cartItemCount: 0,
    orders: [],
    loading: {
      products: false,
      cart: false,
      orders: false,
      checkout: false,
    },
    errors: {
      products: null,
      cart: null,
      orders: null,
      checkout: null,
    },
  });

  // Helper functions
  const setLoading = useCallback((key: keyof EcommerceState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }));
  }, []);

  const setError = useCallback((key: keyof EcommerceState['errors'], error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
  }, []);

  // Helper function to normalize cart items from backend
  const normalizeCartItem = useCallback((item: any): CartItem => {
    console.log('Normalizing cart item:', item);
    
    // If item already has proper structure, return as is
    if (item.product && item.product.price) {
      return item as CartItem;
    }
    
    // Handle flat structure from backend
    if (item.price && !item.product) {
      return {
        _id: item._id,
        productId: item.productId || item._id,
        product: {
          _id: item.productId || item._id,
          name: item.name || 'Unknown Product',
          description: item.description || '',
          price: Number(item.price) || 0,
          category: item.category || '',
          style: item.style,
          color: item.color,
          imageUrl: item.imageUrl || item.image,
          inStock: item.inStock || item.available || false,
          stock: item.stock || 0,
          available: item.available || false,
        },
        quantity: item.quantity || 1,
        price: Number(item.price) || 0,
      };
    }
    
    // Fallback for malformed items
    console.warn('Malformed cart item:', item);
    return {
      _id: item._id || 'unknown',
      productId: item.productId || item._id || 'unknown',
      product: {
        _id: item.productId || item._id || 'unknown',
        name: item.name || 'Unknown Product',
        description: item.description || '',
        price: 0,
        category: item.category || '',
        style: item.style,
        color: item.color,
        imageUrl: item.imageUrl || item.image,
        inStock: false,
        stock: 0,
        available: false,
      },
      quantity: item.quantity || 1,
      price: 0,
    };
  }, []);

  const updateCartCalculations = useCallback((items: CartItem[]) => {
    console.log('updateCartCalculations called with items:', items);
    
    // Transform items to ensure they have the correct structure
    const transformedItems = items.map(normalizeCartItem);
    
    console.log('Transformed cart items:', transformedItems);
    
    const total = transformedItems.reduce((sum, item) => {
      const itemTotal = (item.product?.price || item.price || 0) * (item.quantity || 1);
      console.log(`Item ${item.product?.name || 'unknown'}: price=${item.product?.price || item.price}, quantity=${item.quantity}, total=${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    
    const itemCount = transformedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    console.log('Cart calculations - Total:', total, 'Item count:', itemCount);
    
    setState(prev => ({
      ...prev,
      cartItems: transformedItems,
      cartTotal: total,
      cartItemCount: itemCount,
    }));
  }, [normalizeCartItem]);

  // Product actions
  const loadProducts = useCallback(async (filters?: any) => {
    try {
      setLoading('products', true);
      setError('products', null);
      
      console.log('Loading products with filters:', filters);
      const response = await api.getProducts(filters);
      console.log('Products response:', response);
      
      if (response.success && response.data) {
        let products: Product[] = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          products = response.data.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          products = response.data.products;
        }
        
        console.log('Setting products:', products.length);
        setState(prev => ({ ...prev, products }));
      } else {
        setError('products', response.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Load products error:', error);
      setError('products', 'Failed to load products');
    } finally {
      setLoading('products', false);
    }
  }, [setLoading, setError]);

  const loadCategories = useCallback(async () => {
    try {
      console.log('Loading categories...');
      const response = await api.getCategories();
      console.log('Categories response:', response);
      
      if (response.success && response.data) {
        let categories: Category[] = [];
        
        if (Array.isArray(response.data)) {
          categories = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          categories = response.data.data;
        }
        
        console.log('Setting categories:', categories.length);
        setState(prev => ({ ...prev, categories }));
      }
    } catch (error) {
      console.error('Load categories error:', error);
    }
  }, []);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      console.log('Loading featured products...');
      const response = await api.getProducts({ limit: 6, available: true });
      
      if (response.success && response.data) {
        let products: Product[] = [];
        
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          products = response.data.data;
        } else if (response.data.products && Array.isArray(response.data.products)) {
          products = response.data.products;
        }
        
        console.log('Setting featured products:', products.length);
        setState(prev => ({ ...prev, featuredProducts: products }));
      }
    } catch (error) {
      console.error('Load featured products error:', error);
    }
  }, []);

  // Cart actions
  const loadCart = useCallback(async () => {
    try {
      setLoading('cart', true);
      setError('cart', null);
      
      console.log('Loading cart...');
      const response = await api.getCart();
      console.log('Cart response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure from backend
        let cartData = response.data;
        let items: any[] = [];
        
        // The backend returns: { data: { data: { items: [], total: number } } }
        if (cartData.data && cartData.data.items) {
          items = cartData.data.items;
        } else if (cartData.items) {
          items = cartData.items;
        } else if (Array.isArray(cartData)) {
          items = cartData;
        }
        
        console.log('Setting cart items:', items.length);
        console.log('Cart items structure:', items);
        updateCartCalculations(items);
      } else {
        setError('cart', response.error || 'Failed to load cart');
        updateCartCalculations([]);
      }
    } catch (error) {
      console.error('Load cart error:', error);
      setError('cart', 'Failed to load cart');
      updateCartCalculations([]);
    } finally {
      setLoading('cart', false);
    }
  }, [setLoading, setError, updateCartCalculations]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      setLoading('cart', true);
      setError('cart', null);
      
      console.log('Adding to cart:', productId, quantity);
      const response = await api.addToCart(productId, quantity);
      console.log('Add to cart response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure from backend
        let cartData = response.data;
        let items: any[] = [];
        
        // The backend returns: { data: { data: { items: [], total: number } } }
        if (cartData.data && cartData.data.items) {
          items = cartData.data.items;
        } else if (cartData.items) {
          items = cartData.items;
        } else if (Array.isArray(cartData)) {
          items = cartData;
        }
        
        console.log('Updated cart items:', items.length);
        console.log('Cart items structure:', items);
        updateCartCalculations(items);
      } else {
        setError('cart', response.error || 'Failed to add to cart');
        throw new Error(response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      setError('cart', 'Failed to add to cart');
      throw error;
    } finally {
      setLoading('cart', false);
    }
  }, [setLoading, setError, updateCartCalculations]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setLoading('cart', true);
      setError('cart', null);
      
      console.log('Removing from cart:', itemId);
      const response = await api.removeFromCart(itemId);
      console.log('Remove from cart response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure from backend
        let cartData = response.data;
        let items: any[] = [];
        
        // The backend returns: { data: { data: { items: [], total: number } } }
        if (cartData.data && cartData.data.items) {
          items = cartData.data.items;
        } else if (cartData.items) {
          items = cartData.items;
        } else if (Array.isArray(cartData)) {
          items = cartData;
        }
        
        console.log('Updated cart items after removal:', items.length);
        updateCartCalculations(items);
      } else {
        setError('cart', response.error || 'Failed to remove from cart');
        throw new Error(response.error || 'Failed to remove from cart');
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      setError('cart', 'Failed to remove from cart');
      throw error;
    } finally {
      setLoading('cart', false);
    }
  }, [setLoading, setError, updateCartCalculations]);

  const updateCartItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      setLoading('cart', true);
      setError('cart', null);
      
      console.log('Updating cart item quantity:', itemId, quantity);
      const response = await api.updateCartItem(itemId, quantity);
      console.log('Update cart item response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure from backend
        let cartData = response.data;
        let items: any[] = [];
        
        // The backend returns: { data: { data: { items: [], total: number } } }
        if (cartData.data && cartData.data.items) {
          items = cartData.data.items;
        } else if (cartData.items) {
          items = cartData.items;
        } else if (Array.isArray(cartData)) {
          items = cartData;
        }
        
        console.log('Updated cart items after quantity change:', items.length);
        updateCartCalculations(items);
      } else {
        setError('cart', response.error || 'Failed to update quantity');
        throw new Error(response.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Update cart item error:', error);
      setError('cart', 'Failed to update quantity');
      throw error;
    } finally {
      setLoading('cart', false);
    }
  }, [setLoading, setError, updateCartCalculations]);

  const clearCart = useCallback(async () => {
    try {
      setLoading('cart', true);
      setError('cart', null);
      
      console.log('Clearing cart...');
      const response = await api.clearCart();
      console.log('Clear cart response:', response);
      
      if (response.success) {
        console.log('Cart cleared successfully');
        updateCartCalculations([]);
      } else {
        setError('cart', response.error || 'Failed to clear cart');
        throw new Error(response.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      setError('cart', 'Failed to clear cart');
      throw error;
    } finally {
      setLoading('cart', false);
    }
  }, [setLoading, setError, updateCartCalculations]);

  // Order actions
  const loadOrders = useCallback(async () => {
    try {
      setLoading('orders', true);
      setError('orders', null);
      
      console.log('Loading orders...');
      const response = await api.getOrders();
      console.log('Orders response:', response);
      
      if (response.success && response.data) {
        let orders: Order[] = [];
        
        if (Array.isArray(response.data)) {
          orders = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          orders = response.data.data;
        }
        
        console.log('Setting orders:', orders.length);
        setState(prev => ({ ...prev, orders }));
      } else {
        setError('orders', response.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Load orders error:', error);
      setError('orders', 'Failed to load orders');
    } finally {
      setLoading('orders', false);
    }
  }, [setLoading, setError]);

  const createOrder = useCallback(async (orderData: any): Promise<Order | null> => {
    try {
      setLoading('checkout', true);
      setError('checkout', null);
      
      console.log('Creating order:', orderData);
      const response = await api.createOrder(orderData);
      console.log('Create order response:', response);
      
      if (response.success && response.data) {
        console.log('Order created successfully');
        // Clear cart after successful order
        await clearCart();
        // Reload orders
        await loadOrders();
        return response.data as Order;
      } else {
        setError('checkout', response.error || 'Failed to create order');
        return null;
      }
    } catch (error) {
      console.error('Create order error:', error);
      setError('checkout', 'Failed to create order');
      return null;
    } finally {
      setLoading('checkout', false);
    }
  }, [setLoading, setError, clearCart, loadOrders]);

  // Utility actions
  const refreshAll = useCallback(async () => {
    console.log('Refreshing all ecommerce data...');
    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadFeaturedProducts(),
      loadCart(),
      loadOrders(),
    ]);
  }, [loadProducts, loadCategories, loadFeaturedProducts, loadCart, loadOrders]);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {
        products: null,
        cart: null,
        orders: null,
        checkout: null,
      }
    }));
  }, []);

  // Initial load
  useEffect(() => {
    console.log('EcommerceProvider initialized, loading initial data...');
    refreshAll();
  }, [refreshAll]);

  const value: EcommerceContextType = {
    ...state,
    loadProducts,
    loadCategories,
    loadFeaturedProducts,
    loadCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadOrders,
    createOrder,
    refreshAll,
    clearErrors,
  };

  return (
    <EcommerceContext.Provider value={value}>
      {children}
    </EcommerceContext.Provider>
  );
}; 