import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('cart');
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Validate stock before adding to cart
  const validateStock = async (productId, requestedQuantity) => {
    try {
      const response = await axiosInstance.get(`/inventory/${productId}`);
      const currentStock = response.data.data?.stock || response.data.stock || 0;
      return currentStock >= requestedQuantity;
    } catch (error) {
      console.error('Stock validation error:', error);
      return false;
    }
  };

  const addToCart = async (product) => {
    if (!product || !product._id) {
      toast.error('Invalid product data');
      return;
    }

    setLoading(true);
    try {
      // Check current stock
      const hasStock = await validateStock(product._id, 1);
      if (!hasStock) {
        toast.error('This item is currently out of stock');
        return;
      }

      setCart(prevCart => {
        const existingItem = prevCart.find(item => item._id === product._id);
        
        if (existingItem) {
          // Check if adding one more would exceed stock
          if (existingItem.quantity >= (product.stock || 1)) {
            toast.error('Cannot add more items. Stock limit reached.');
            return prevCart;
          }
          
          return prevCart.map(item =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        
        return [...prevCart, { ...product, quantity: 1 }];
      });

      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setLoading(true);
    try {
      // Validate stock for new quantity
      const hasStock = await validateStock(productId, newQuantity);
      if (!hasStock) {
        toast.error('Requested quantity exceeds available stock');
        return;
      }

      setCart(prevCart => {
        const product = prevCart.find(item => item._id === productId);
        if (!product) return prevCart;

        return prevCart.map(item =>
          item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      });
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.success('Cart cleared successfully');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const validateCartItems = async () => {
    const validationPromises = cart.map(async (item) => {
      try {
        const response = await axiosInstance.get(`/inventory/${item._id}`);
        const currentStock = response.data.data?.stock || response.data.stock || 0;
        const currentPrice = response.data.data?.price || response.data.price || item.price;
        
        return {
          item,
          isValid: currentStock >= item.quantity,
          currentStock,
          currentPrice,
          priceChanged: currentPrice !== item.price
        };
      } catch (error) {
        return {
          item,
          isValid: false,
          error: 'Product not found'
        };
      }
    });

    const results = await Promise.all(validationPromises);
    return results;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        validateCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
