import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../contexts/CartContext";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal > 300 ? 0 : 30;
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address.name || !address.address || !address.city || !address.postalCode || !address.country) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      navigate('/products');
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
        paymentMethod: "cash-on-delivery",
        shippingAddress: address,
      };

      await axiosInstance.post('/orders', orderData);
      clearCart();
    toast.success("Order Placed Successfully!");
    setTimeout(() => navigate("/thankyou"), 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-lg mb-8">Add some products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex flex-col lg:flex-row gap-16 items-start justify-center">
      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-6">Shipping Information</h2>

        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name *"
            value={address.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
            required
          />
          <input
            name="address"
            placeholder="Address Line *"
            value={address.address}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
            required
          />
          <input
            name="city"
            placeholder="City *"
            value={address.city}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
            required
          />
          <input
            name="postalCode"
            placeholder="Postal Code *"
            value={address.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
            required
          />
          <input
            name="country"
            placeholder="Country *"
            value={address.country}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
            required
          />
          <input
            name="phone"
            placeholder="Phone Number (Optional)"
            value={address.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all mt-6 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Confirm Checkout"}
        </button>
      </form>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-[#171717] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-4 text-md">
          {cart.map((item) => (
            <div className="flex justify-between" key={item._id}>
              <span>{item.name} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <hr className="border-[#A58077] my-2" />

          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
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

export default CheckoutPage;
