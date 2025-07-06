import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaCreditCard, 
  FaExclamationTriangle,
  FaSpinner,
  FaShieldAlt,
  FaLock,
  FaCheck,
  FaTruck,
  FaGift,
  FaBox,
  FaCalendarAlt,
  FaEnvelope,
  FaGlobe,
  FaHome
} from "react-icons/fa";

const CheckoutPage = () => {
  const { cart, clearCart, validateCartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: ""
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cartValidation, setCartValidation] = useState(null);
  const [validatingCart, setValidatingCart] = useState(true);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal > 300 ? 0 : 30;
  const discount = subtotal > 500 ? subtotal * 0.1 : 0;
  const total = subtotal + shippingCost - discount;

  // Validate cart items on component mount
  useEffect(() => {
    const validateCart = async () => {
      if (cart.length === 0) {
        setValidatingCart(false);
        return;
      }

      try {
        const validationResults = await validateCartItems();
        setCartValidation(validationResults);
        
        // Check for invalid items
        const invalidItems = validationResults.filter(result => !result.isValid);
        if (invalidItems.length > 0) {
          toast.error('Some items in your cart are no longer available or have changed');
        }
      } catch (error) {
        console.error('Cart validation error:', error);
        toast.error('Failed to validate cart items');
      } finally {
        setValidatingCart(false);
      }
    };

    validateCart();
  }, [cart, validateCartItems]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!address.name.trim()) newErrors.name = "Full name is required";
    if (!address.address.trim()) newErrors.address = "Address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    if (!address.country.trim()) newErrors.country = "Country is required";
    if (!address.email.trim()) newErrors.email = "Email is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (address.email.trim() && !emailRegex.test(address.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (address.phone.trim() && !/^[+]?[1-9][\d]{0,15}$/.test(address.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate('/products');
      return;
    }

    // Check if cart validation failed
    if (cartValidation && cartValidation.some(result => !result.isValid)) {
      toast.error("Some items in your cart are no longer available. Please review your cart.");
      navigate('/cart');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        products: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        subtotal,
        shippingCost,
        discount,
        paymentMethod: "cash-on-delivery",
        shippingAddress: address,
      };

      const response = await axiosInstance.post('/orders', orderData);
      
      if (response.data.status === 'success') {
        clearCart();
        toast.success("Order Placed Successfully!");
        setTimeout(() => navigate("/thankyou"), 1000);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || "Invalid order data";
        toast.error(errorMessage);
      } else if (error.response?.status === 422) {
        const invalidItems = error.response.data.invalidItems || [];
        const itemNames = invalidItems.map(item => item.productId).join(', ');
        toast.error(`Some items are no longer available: ${itemNames}`);
        navigate('/cart');
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (validatingCart) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A58077] mx-auto mb-4"></div>
          <p className="text-[#A58077]">Validating your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-4xl font-bold mb-4">
              Your Cart is
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Empty</span>
            </h2>
            <p className="text-[#A58077] text-lg mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to proceed to checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaBox className="inline mr-2" />
                Start Shopping
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-8 py-4 bg-[#2C2C2C] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 font-semibold border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaArrowLeft className="inline mr-2" />
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show cart validation warnings
  const invalidItems = cartValidation?.filter(result => !result.isValid) || [];
  const priceChangedItems = cartValidation?.filter(result => result.priceChanged) || [];

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Cart</span>
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center">
              <FaCreditCard className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#E5CBBE]">Checkout</h1>
              <p className="text-[#A58077] text-lg">Complete your purchase</p>
            </div>
          </div>
        </div>

        {/* Validation Warnings */}
        {(invalidItems.length > 0 || priceChangedItems.length > 0) && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <FaExclamationTriangle className="text-red-400 text-xl" />
              <h3 className="text-lg font-semibold text-red-400">Cart Issues Detected</h3>
            </div>
            <div className="space-y-2 text-sm text-red-300">
              {invalidItems.length > 0 && (
                <p>• Some items are no longer available and have been removed</p>
              )}
              {priceChangedItems.length > 0 && (
                <p>• Prices have changed for some items</p>
              )}
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Review Cart
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Shipping Information */}
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Shipping Information</h2>
                  <p className="text-[#A58077] text-sm">Where should we deliver your order?</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="text-[#A58077]" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={address.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                          errors.name ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-[#A58077]" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                          errors.email ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#E5CBBE]">Address</label>
                  <div className="relative">
                    <div className="absolute top-3 left-4 flex items-center pointer-events-none">
                      <FaHome className="text-[#A58077]" />
                    </div>
                    <textarea
                      name="address"
                      value={address.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 resize-none ${
                        errors.address ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                      }`}
                      placeholder="Enter your full address"
                    />
                  </div>
                  {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                        errors.city ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-400 text-sm">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                        errors.postalCode ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                      }`}
                      placeholder="Postal Code"
                    />
                    {errors.postalCode && <p className="text-red-400 text-sm">{errors.postalCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Country</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaGlobe className="text-[#A58077]" />
                      </div>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                          errors.country ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                        }`}
                        placeholder="Country"
                      />
                    </div>
                    {errors.country && <p className="text-red-400 text-sm">{errors.country}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#E5CBBE]">Phone Number (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className="text-[#A58077]" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 ${
                        errors.phone ? 'border-red-500' : 'border-[#3C3C3C] focus:border-[#A58077]'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                  <FaCreditCard className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Payment Method</h2>
                  <p className="text-[#A58077] text-sm">How would you like to pay?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash-on-delivery"
                    defaultChecked
                    className="w-4 h-4 bg-[#1e1e1e] border-[#3C3C3C] text-[#A58077] focus:ring-[#A58077] focus:ring-2"
                  />
                  <div className="flex items-center space-x-3">
                    <FaCreditCard className="text-[#A58077]" />
                    <div>
                      <p className="font-semibold text-[#E5CBBE]">Cash on Delivery</p>
                      <p className="text-sm text-[#A58077]">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#2C2C2C] rounded-2xl border border-[#3C3C3C] p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-[#E5CBBE] mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <img
                      src={item.image || item.filePath}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-[#1e1e1e]"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48x48/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#E5CBBE] truncate">{item.name}</p>
                      <p className="text-sm text-[#A58077]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-[#A58077]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-[#3C3C3C] my-6" />

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#A58077]">Subtotal</span>
                  <span className="text-[#E5CBBE]">${subtotal.toFixed(2)}</span>
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
                  <span className="flex items-center text-[#A58077]">
                    <FaTruck className="mr-2" />
                    Shipping
                  </span>
                  <span className={shippingCost === 0 ? 'text-green-400' : 'text-[#E5CBBE]'}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <hr className="border-[#3C3C3C] my-6" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-[#E5CBBE]">Total</span>
                <span className="text-2xl font-bold text-[#A58077]">${total.toFixed(2)}</span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center mb-6 text-sm text-[#A58077]">
                <FaShieldAlt className="mr-2" />
                <span>Secure Checkout</span>
                <FaLock className="ml-2" />
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={processing || invalidItems.length > 0}
                className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              {/* Free Shipping Info */}
              {shippingCost > 0 && (
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
      </div>
    </div>
  );
};

export default CheckoutPage;
