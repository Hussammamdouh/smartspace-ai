import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaShoppingCart,
  FaArrowLeft,
  FaHeart,
  FaStar,
  FaTruck,
  FaGift,
  FaShieldAlt,
  FaCreditCard,
  FaLock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const { isDarkMode } = useTheme();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [moreProducts, setMoreProducts] = useState([]);

  const [updatingItem, setUpdatingItem] = useState(null);

  const decreaseQuantity = (product) => {
    if (product.quantity === 1) {
      removeFromCart(product._id);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(product._id, product.quantity - 1);
    }
  };

  const increaseQuantity = async (product) => {
    setUpdatingItem(product._id);
    try {
      // Check stock availability
      const { data } = await axiosInstance.get(`/inventory/${product._id}`);
      const currentStock = data.data?.stock || data.stock || 0;
      
      if (product.quantity >= currentStock) {
        toast.error(`Only ${currentStock} items available in stock`);
        return;
      }
      
      updateQuantity(product._id, product.quantity + 1);
    } catch (error) {
      console.error('Stock check error:', error);
      toast.error('Failed to check stock availability');
    } finally {
      setUpdatingItem(null);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = subtotal > 500 ? subtotal * 0.1 : 0; // 10% discount for orders over $500
  const shipping = subtotal > 300 ? 0 : 30; // Free shipping over $300
  const total = subtotal - discount + shipping;

  useEffect(() => {
    const fetchMore = async () => {
      try {
        const { data } = await axiosInstance.get('/inventory', {
          params: { limit: 4 },
        });
        setMoreProducts(data.data || []);
      } catch (error) {
        console.error("Failed to load more products:", error);
        toast.error("Failed to load recommended products");
      }
    };
    fetchMore();
  }, []);

  const handleClearCart = () => {
    if (cart.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared successfully');
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`min-h-screen pt-24 pb-32 transition-colors duration-500 relative overflow-hidden ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
          }`}></div>
          <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
          }`} style={{ animationDelay: '1s' }}></div>
          
          {/* Grid Pattern */}
          <div className={`absolute inset-0 bg-[size:50px_50px] transition-opacity duration-500 ${
            isDarkMode 
              ? 'bg-[linear-gradient(rgba(165,128,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.03)_1px,transparent_1px)]' 
              : 'bg-[linear-gradient(rgba(139,107,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.05)_1px,transparent_1px)]'
          }`}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-16">
            <div className="text-8xl mb-6 transform hover:scale-110 transition-transform duration-300">🛒</div>
            <h1 className={`text-4xl lg:text-6xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
            }`}>
              Your Cart is
              <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                  : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
              }`}> Empty</span>
            </h1>
            <p className={`text-xl mb-8 max-w-md mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to discover amazing interior design pieces!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => navigate('/products')}
                className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
              >
                <FaShoppingCart className="inline mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className={`px-8 py-4 rounded-xl transition-all duration-300 font-semibold border transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-[#2C2C2C] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                    : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                }`}
              >
                <FaHeart className="inline mr-2 group-hover:scale-110 transition-transform duration-300" />
                View Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-32 transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
        }`} style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 bg-[size:50px_50px] transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-[linear-gradient(rgba(165,128,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.03)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(139,107,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.05)_1px,transparent_1px)]'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <nav className={`flex items-center space-x-2 text-sm mb-4 transition-colors duration-500 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            <span className="hover:underline cursor-pointer" onClick={() => navigate("/")}>Home</span>
            <span className="opacity-50">/</span>
            <span className="hover:underline cursor-pointer" onClick={() => navigate("/products")}>Products</span>
            <span className="opacity-50">/</span>
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Cart</span>
          </nav>
          
          <div className="inline-block mb-4">
            <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
            }`}>
              Shopping Cart
            </span>
          </div>
          
          <h1 className={`text-4xl lg:text-5xl font-bold mb-2 transform hover:scale-105 transition-transform duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
          }`}>
            Shopping
            <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
            }`}> Cart</span>
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart • Total: ${total.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className={`rounded-xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 group ${
                  isDarkMode
                    ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077]/50'
                    : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61]/50 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image || 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'}
                      alt={item.name}
                      className={`w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 ${
                        isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'
                      }`}
                      loading="lazy"
                      onError={e => { e.target.src = 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'; }}
                    />
                    
                    {/* Stock Badge */}
                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium transform hover:scale-110 transition-all duration-300 ${
                      item.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                      item.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg sm:text-xl font-semibold mb-2 line-clamp-2 transition-colors duration-200 ${
                          isDarkMode ? 'text-[#E5CBBE] group-hover:text-white' : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
                        }`}>
                          {item.name}
                        </h3>
                        <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          <span className="capitalize">{item.category}</span>
                          {item.style && <span className="capitalize">{item.style}</span>}
                          {item.color && <span className="capitalize">{item.color}</span>}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right ml-4">
                        <div className={`text-2xl font-bold transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          ${item.price.toFixed(2)}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          ${(item.price * item.quantity).toFixed(2)} total
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => decreaseQuantity(item)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border transform hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                            isDarkMode
                              ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                              : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                          }`}
                          disabled={updatingItem === item._id}
                        >
                          <FaMinus size={12} />
                        </button>
                        
                        <span className={`w-16 text-center text-lg font-semibold py-2 rounded-lg border transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-[#1e1e1e] border-[#3C3C3C] text-[#E5CBBE]'
                            : 'bg-white border-[#E5D3C7] text-[#2C2C2C] shadow-md'
                        }`}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => increaseQuantity(item)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border transform hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                            isDarkMode
                              ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                              : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                          }`}
                          disabled={updatingItem === item._id}
                        >
                          {updatingItem === item._id ? (
                            <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                              isDarkMode ? 'border-[#A58077]' : 'border-[#8B6B61]'
                            }`}></div>
                          ) : (
                            <FaPlus size={12} />
                          )}
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeFromCart(item._id);
                          toast.success('Item removed from cart');
                        }}
                        className="text-red-400 hover:text-red-300 transition-all duration-300 p-2 hover:bg-red-500/10 rounded-lg transform hover:scale-110 hover:rotate-12"
                        aria-label="Remove item"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Cart Actions */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border backdrop-blur-xl transition-all duration-500 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <button
                onClick={() => navigate('/products')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                    : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                }`}
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Continue Shopping</span>
              </button>
              
              <button
                onClick={handleClearCart}
                className="px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border backdrop-blur-xl p-6 sticky top-24 transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-start transform hover:scale-105 transition-all duration-300">
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium line-clamp-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>{item.name}</p>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>Qty: {item.quantity}</p>
                    </div>
                    <span className={`ml-2 font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr className={`my-6 transition-colors duration-300 ${
                isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
              }`} />
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>Subtotal</span>
                  <span className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center">
                      <FaGift className="mr-2 transform hover:scale-110 transition-transform duration-300" />
                      Discount (10% off)
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className={`flex items-center transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    <FaTruck className="mr-2 transform hover:scale-110 transition-transform duration-300" />
                    Shipping
                  </span>
                  <span className={shipping === 0 ? 'text-green-400' : isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>
              
              <hr className={`my-6 transition-colors duration-300 ${
                isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
              }`} />
              
              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Total</span>
                <span className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>${total.toFixed(2)}</span>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className={`w-full py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
              >
                <FaCreditCard className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Proceed to Checkout</span>
                <FaLock className="group-hover:rotate-12 transition-transform duration-300" />
              </button>
              
              {/* Security Badge */}
              <div className={`flex items-center justify-center mt-4 text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                <FaShieldAlt className="mr-2 transform hover:scale-110 transition-transform duration-300" />
                <span>Secure Checkout</span>
              </div>
              
              {/* Free Shipping Info */}
              {shipping > 0 && (
                <div className={`mt-4 p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-[#1e1e1e] border-[#3C3C3C]'
                    : 'bg-white border-[#E5D3C7] shadow-md'
                }`}>
                  <div className="flex items-center text-sm">
                    <FaTruck className={`mr-2 transform hover:scale-110 transition-transform duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`} />
                    <span className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>
                      Add ${(300 - subtotal).toFixed(2)} more for FREE shipping
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {moreProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                    : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
                }`}>
                  Recommendations
                </span>
              </div>
              
              <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
              }`}>
                You Might Also
                <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}> Like</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreProducts.map((product) => (
                <div
                  key={product._id}
                  className={`rounded-xl overflow-hidden transition-all duration-500 cursor-pointer border backdrop-blur-xl transform hover:scale-105 perspective-1000 ${
                    isDarkMode
                      ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077] hover:shadow-2xl hover:shadow-[#A58077]/20'
                      : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61] hover:shadow-2xl hover:shadow-[#8B6B61]/20 shadow-lg'
                  }`}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="aspect-square overflow-hidden relative group">
                    <img
                      src={product.image || product.filePath}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className={`p-4 transition-colors duration-300 ${
                    isDarkMode ? 'bg-[#2C2C2C]/80' : 'bg-white/80'
                  }`}>
                    <h3 className={`font-semibold mb-2 line-clamp-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        ${product.price?.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-sm transform hover:scale-110 transition-transform duration-300" />
                        <span className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
