import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

interface CartItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCart();
      if (response.success && response.data) {
        const cartData = response.data as any;
        setItems(cartData.items || cartData || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await apiService.addToCart(productId, quantity);
      if (response.success) {
        await loadCart(); // Reload cart to get updated data
      } else {
        throw new Error(response.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await apiService.removeFromCart(itemId);
      if (response.success) {
        setItems(prev => prev.filter(item => item._id !== itemId));
      } else {
        throw new Error(response.error || 'Failed to remove from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await apiService.updateCartItem(itemId, quantity);
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item._id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        throw new Error(response.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      setItems([]);
      // Note: Backend might not have a clear cart endpoint
      // This is a local clear, you might want to implement backend support
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 