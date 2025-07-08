import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface CartItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCart();
      if (response.success && response.data) {
        const cartData = response.data as any;
        const cartItems = cartData.items || cartData || [];
        setItems(cartItems);
      } else {
        setError(response.error || 'Failed to load cart');
      }
    } catch (error) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.addToCart(productId, quantity);
      if (response.success) {
        // Update cart items directly instead of reloading
        const responseData = response.data as any;
        if (responseData && responseData.items) {
          setItems(responseData.items);
        } else {
          // Fallback to reloading if response structure is unexpected
          await loadCart();
        }
      } else {
        setError(response.error || 'Failed to add to cart');
        throw new Error(response.error || 'Failed to add to cart');
      }
    } catch (error) {
      setError('Failed to add to cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.removeFromCart(itemId);
      if (response.success) {
        setItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        setError(response.error || 'Failed to remove from cart');
        throw new Error(response.error || 'Failed to remove from cart');
      }
    } catch (error) {
      setError('Failed to remove from cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.updateCartItem(itemId, quantity);
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item._id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        setError(response.error || 'Failed to update quantity');
        throw new Error(response.error || 'Failed to update quantity');
      }
    } catch (error) {
      setError('Failed to update quantity');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.clearCart();
      if (response.success) {
        setItems([]);
      } else {
        setError(response.error || 'Failed to clear cart');
        throw new Error(response.error || 'Failed to clear cart');
      }
    } catch (error) {
      setError('Failed to clear cart');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart only once on initialization
  useEffect(() => {
    if (!isInitialized) {
      loadCart().catch(() => {
        // Silently fail if user is not authenticated
        // Cart will be loaded when user logs in
      }).finally(() => {
        setIsInitialized(true);
      });
    }
  }, [isInitialized, loadCart]);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 