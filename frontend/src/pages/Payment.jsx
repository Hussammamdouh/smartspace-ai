import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import CartContext from "../contexts/CartContext";

const PaymentPage = () => {
    const navigate = useNavigate();
  const { cart, clearCart, validateCartItems } = useContext(CartContext);
  const [cardInfo, setCardInfo] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [cartValidation, setCartValidation] = useState(null);
  const [validatingCart, setValidatingCart] = useState(true);

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

  const validateCard = () => {
    const newErrors = {};

    // Card number validation (Luhn algorithm)
    const cardNumber = cardInfo.number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.number = 'Please enter a valid card number';
    } else if (!luhnCheck(cardNumber)) {
      newErrors.number = 'Invalid card number';
    }

    // Expiry date validation
    if (!cardInfo.expiry || !/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = cardInfo.expiry.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = 'Invalid month';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    // CVV validation
    if (!cardInfo.cvv || cardInfo.cvv.length < 3 || cardInfo.cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Name validation
    if (!cardInfo.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Luhn algorithm for card number validation
  const luhnCheck = (num) => {
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    sum += lastDigit;
    return sum % 10 === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Auto-format card number and expiry
    if (name === "number") {
      value = value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      value = value.replace(/\D/g, "").replace(/^(.{2})(.)/, "$1/$2").substr(0, 5);
    }

    setCardInfo({ ...cardInfo, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCreateOrder = async () => {
    if (!cart || cart.length === 0) {
      throw new Error("Cart is empty.");
    }

    const orderData = {
      products: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
      paymentMethod: "card",
    };

    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCard()) {
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
      await handleCreateOrder();
      clearCart();
      toast.success("Payment Successful!");
      setTimeout(() => navigate("/thankyou"), 1000);
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.response?.status === 422) {
        const invalidItems = error.response.data.invalidItems || [];
        const itemNames = invalidItems.map(item => item.productId).join(', ');
        toast.error(`Some items are no longer available: ${itemNames}`);
        navigate('/cart');
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to process payment. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (validatingCart) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p>Validating your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4">{''}</h2>
        <p className="text-lg mb-8">{''}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
        >
          {''}
        </button>
      </div>
    );
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const invalidItems = cartValidation?.filter(result => !result.isValid) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col md:flex-row items-center justify-center gap-16 p-8">
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-2">{''}</h2>

        <div>
          <label className="block text-sm mb-1">{''}</label>
          <input
            name="name"
            value={cardInfo.name}
            onChange={handleChange}
            placeholder={''}
            className={`w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition ${
              errors.name ? 'border-2 border-red-500' : ''
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">{''}</label>
          <input
            name="number"
            value={cardInfo.number}
            onChange={handleChange}
            placeholder={''}
            maxLength={19}
            className={`w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition ${
              errors.number ? 'border-2 border-red-500' : ''
            }`}
          />
          {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">{''}</label>
            <input
              name="expiry"
              value={cardInfo.expiry}
              onChange={handleChange}
              placeholder={''}
              maxLength={5}
              className={`w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition ${
                errors.expiry ? 'border-2 border-red-500' : ''
              }`}
            />
            {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">{''}</label>
            <input
              name="cvv"
              value={cardInfo.cvv}
              onChange={handleChange}
              placeholder={''}
              maxLength={4}
              className={`w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition ${
                errors.cvv ? 'border-2 border-red-500' : ''
              }`}
            />
            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={processing || invalidItems.length > 0}
          className={`w-full h-14 rounded-lg text-lg font-semibold transition-all ${
            processing || invalidItems.length > 0
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-[#A58077] text-white hover:bg-[#E5CBBE] hover:text-[#181818]"
          }`}
        >
          {processing ? "Processing..." : `${''} $${total.toFixed(2)}`}
        </button>

        {invalidItems.length > 0 && (
          <p className="text-red-500 text-sm text-center">
            Some items in your cart are no longer available. Please review your cart.
          </p>
        )}
      </form>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-[#171717] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">{''}</h2>

        <div className="space-y-4 text-md">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="border-[#A58077]" />
          <div className="flex justify-between">
            <span>{''}:</span>
            <span>{''}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>{''}:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
