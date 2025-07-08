import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
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
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Your Cart is
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Empty</span>
            </h1>
            <p className="text-xl text-[#A58077] mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to discover amazing interior design pieces!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaShoppingCart className="inline mr-2" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="px-8 py-4 bg-[#2C2C2C] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 font-semibold border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaHeart className="inline mr-2" />
                View Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span>Products</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Cart</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            Shopping
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Cart</span>
          </h1>
          <p className="text-[#A58077] text-lg">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart • Total: ${total.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={item.image || 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'}
                      alt={item.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover bg-[#1e1e1e] rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                      loading="lazy"
                      onError={e => { e.target.src = 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'; }}
                    />
                    
                    {/* Stock Badge */}
                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${
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
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 group-hover:text-white transition-colors duration-200">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-[#A58077]">
                          <span className="capitalize">{item.category}</span>
                          {item.style && <span className="capitalize">{item.style}</span>}
                          {item.color && <span className="capitalize">{item.color}</span>}
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-[#A58077]">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-[#A58077]">
                          ${(item.price * item.quantity).toFixed(2)} total
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => decreaseQuantity(item)}
                          className="w-10 h-10 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg flex items-center justify-center hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077] disabled:opacity-50"
                          disabled={updatingItem === item._id}
                        >
                          <FaMinus size={12} />
                        </button>
                        
                        <span className="w-16 text-center text-lg font-semibold bg-[#1e1e1e] py-2 rounded-lg border border-[#3C3C3C]">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => increaseQuantity(item)}
                          className="w-10 h-10 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg flex items-center justify-center hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077] disabled:opacity-50"
                          disabled={updatingItem === item._id}
                        >
                          {updatingItem === item._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#A58077]"></div>
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
                        className="text-red-400 hover:text-red-300 transition-all duration-300 p-2 hover:bg-red-500/10 rounded-lg"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-[#2C2C2C] rounded-xl border border-[#3C3C3C]">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaArrowLeft />
                <span>Continue Shopping</span>
              </button>
              
              <button
                onClick={handleClearCart}
                className="px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2C2C2C] rounded-xl border border-[#3C3C3C] p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-sm text-[#A58077]">Qty: {item.quantity}</p>
                    </div>
                    <span className="ml-2 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr className="border-[#3C3C3C] my-6" />
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center">
                      <FaGift className="mr-2" />
                      Discount (10% off)
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <FaTruck className="mr-2" />
                    Shipping
                  </span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>
              
              <hr className="border-[#3C3C3C] my-6" />
              
              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold text-[#A58077]">${total.toFixed(2)}</span>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <FaCreditCard />
                <span>Proceed to Checkout</span>
                <FaLock />
              </button>
              
              {/* Security Badge */}
              <div className="flex items-center justify-center mt-4 text-sm text-[#A58077]">
                <FaShieldAlt className="mr-2" />
                <span>Secure Checkout</span>
              </div>
              
              {/* Free Shipping Info */}
              {shipping > 0 && (
                <div className="mt-4 p-3 bg-[#1e1e1e] rounded-lg border border-[#3C3C3C]">
                  <div className="flex items-center text-sm">
                    <FaTruck className="text-[#A58077] mr-2" />
                    <span className="text-[#A58077]">
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
            <h2 className="text-3xl font-bold mb-8 text-center">
              You Might Also
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Like</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moreProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-[#2C2C2C] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#3C3C3C] hover:border-[#A58077] transform hover:scale-105"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image || product.filePath}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-[#E5CBBE] mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#A58077]">
                        ${product.price?.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-[#A58077]">4.8</span>
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
