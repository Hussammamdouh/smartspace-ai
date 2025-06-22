import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";
import CartContext from "../contexts/CartContext";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);
  const [cardInfo, setCardInfo] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [processing, setProcessing] = useState(false);

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
    const { name, number, expiry, cvv } = cardInfo;

    if (!name || !number || !expiry || !cvv) {
      toast.error("Please fill all payment fields.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate('/products');
      return;
    }

    setProcessing(true);
    try {
      await handleCreateOrder();
      clearCart();
      toast.success("Payment Successful!");
      setTimeout(() => navigate("/thankyou"), 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-lg mb-8">Add some products to your cart before proceeding to payment.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex flex-col md:flex-row items-center justify-center gap-16 p-8">
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-2">Virtual Payment</h2>

        <div>
          <label className="block text-sm mb-1">Cardholder Name</label>
          <input
            name="name"
            value={cardInfo.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Card Number</label>
          <input
            name="number"
            value={cardInfo.number}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Expiry Date</label>
            <input
              name="expiry"
              value={cardInfo.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">CVV</label>
            <input
              name="cvv"
              value={cardInfo.cvv}
              onChange={handleChange}
              placeholder="123"
              maxLength={4}
              className="w-full p-4 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder-[#616161] focus:ring-2 focus:ring-[#A58077] outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all disabled:opacity-50"
        >
          {processing ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </button>
      </form>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-[#171717] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-4 text-md">
          {cart.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
          ))}
          <hr className="border-[#A58077]" />
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
