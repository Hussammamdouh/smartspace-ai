import { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, setCartReloadRef } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const hasLoadedBackendCart = useRef(false);

  // Convert backend cart items to frontend format
  const convertBackendCartToFrontend = (backendCart) => {
    if (!backendCart || !backendCart.items) return [];
    return backendCart.items.map(item => {
      const product = item.productId;
      return {
        _id: product._id || product.id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.image || product.filePath,
        stock: product.stock,
        category: product.category,
        style: product.style,
        color: product.color,
        cartItemId: item._id // Store cart item ID for backend operations
      };
    });
  };

  // Load cart from backend if user is authenticated
  const loadBackendCart = async () => {
    if (!isAuthenticated || hasLoadedBackendCart.current) return;
    
    setSyncing(true);
    try {
      const response = await axiosInstance.get('/cart');
      if (response.data.status === 'success' && response.data.data) {
        const backendCart = convertBackendCartToFrontend(response.data.data);
        setCart(backendCart);
        // Also save to localStorage as backup
        localStorage.setItem('cart', JSON.stringify(backendCart));
        hasLoadedBackendCart.current = true;
      }
    } catch (error) {
      console.error('Failed to load backend cart:', error);
      // Fallback to localStorage if backend fails
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing saved cart:', e);
        }
      }
    } finally {
      setSyncing(false);
    }
  };

  // Merge localStorage cart with backend cart
  const mergeCarts = async (localCart, backendCart) => {
    if (!localCart || localCart.length === 0) return backendCart;
    if (!backendCart || backendCart.length === 0) return localCart;

    const merged = [...backendCart];
    const backendProductIds = new Set(backendCart.map(item => item._id));

    // Add items from localStorage that aren't in backend cart
    for (const localItem of localCart) {
      if (!backendProductIds.has(localItem._id)) {
        // Add to backend cart
        try {
          await axiosInstance.post('/cart', {
            productId: localItem._id,
            quantity: localItem.quantity
          });
          merged.push(localItem);
        } catch (error) {
          console.error('Failed to merge cart item:', error);
        }
      }
    }

    return merged;
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      // User is logged in - load from backend and merge with localStorage
      const savedCart = localStorage.getItem('cart');
      let localCart = [];
      if (savedCart) {
        try {
          localCart = JSON.parse(savedCart);
        } catch (e) {
          console.error('Error parsing saved cart:', e);
        }
      }
      
      loadBackendCart().then(async () => {
        if (localCart.length > 0) {
          // Get current backend cart state
          const currentBackendCart = cart.length > 0 ? cart : [];
          const backendProductIds = new Set(currentBackendCart.map(item => item._id));
          
          // Merge carts - add localStorage items to backend
          for (const localItem of localCart) {
            if (!backendProductIds.has(localItem._id)) {
              try {
                await axiosInstance.post('/cart', {
                  productId: localItem._id,
                  quantity: localItem.quantity
                });
              } catch (error) {
                console.error('Failed to merge cart item:', error);
              }
            }
          }
          // Reload cart after merging
          hasLoadedBackendCart.current = false;
          await loadBackendCart();
        }
      });
    } else {
      // User is not logged in - use localStorage only
      hasLoadedBackendCart.current = false;
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing saved cart:', error);
          localStorage.removeItem('cart');
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes (as backup)
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

      if (isAuthenticated) {
        // Sync with backend
        try {
          const response = await axiosInstance.post('/cart', {
            productId: product._id,
            quantity: 1
          });
          
          if (response.data.status === 'success') {
            const backendCart = convertBackendCartToFrontend(response.data.data);
            setCart(backendCart);
            toast.success('Added to cart successfully!');
          }
        } catch (error) {
          console.error('Backend add to cart error:', error);
          // Fallback to local storage
          setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
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
        }
      } else {
        // Guest user - use localStorage only
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item._id === product._id);
          if (existingItem) {
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
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      // Find cart item ID
      const cartItem = cart.find(item => item._id === productId);
      if (cartItem && cartItem.cartItemId) {
        try {
          await axiosInstance.delete(`/cart/${cartItem.cartItemId}`);
          // Reload cart from backend
          await loadBackendCart();
          toast.success('Item removed from cart');
          return;
        } catch (error) {
          console.error('Backend remove from cart error:', error);
        }
      }
    }
    
    // Fallback to local storage
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

      if (isAuthenticated) {
        // Find cart item ID
        const cartItem = cart.find(item => item._id === productId);
        if (cartItem && cartItem.cartItemId) {
          try {
            await axiosInstance.put(`/cart/${cartItem.cartItemId}`, {
              quantity: newQuantity
            });
            // Reload cart from backend
            await loadBackendCart();
            return;
          } catch (error) {
            console.error('Backend update quantity error:', error);
            // Fallback to local storage
          }
        }
      }
      
      // Fallback to local storage
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

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await axiosInstance.delete('/cart/clear');
        setCart([]);
        localStorage.removeItem('cart');
        toast.success('Cart cleared successfully');
        return;
      } catch (error) {
        console.error('Backend clear cart error:', error);
      }
    }
    
    // Fallback to local storage
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

  // Expose function to reload cart (useful after login)
  const reloadCart = async () => {
    hasLoadedBackendCart.current = false;
    if (isAuthenticated) {
      await loadBackendCart();
    }
  };

  // Register reload function with AuthContext
  useEffect(() => {
    if (setCartReloadRef) {
      setCartReloadRef(reloadCart);
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        syncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        validateCartItems,
        reloadCart
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
