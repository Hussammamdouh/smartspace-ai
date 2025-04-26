import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: "",
    addressLine: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal > 300 ? 0 : 30;
  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.addressLine || !address.city || !address.postalCode || !address.country) {
      toast.error("Please fill in all shipping fields.");
      return;
    }

    toast.success("Order Placed Successfully!");
    clearCart();
    setTimeout(() => navigate("/thankyou"), 1000);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex flex-col lg:flex-row gap-16 items-start justify-center">
      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold mb-6">Shipping Information</h2>

        <div className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={address.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
          <input
            name="addressLine"
            placeholder="Address Line"
            value={address.addressLine}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
          <input
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
          <input
            name="postalCode"
            placeholder="Postal Code"
            value={address.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
          <input
            name="country"
            placeholder="Country"
            value={address.country}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all mt-6"
        >
          Confirm Checkout
        </button>
      </form>

      {/* Order Summary */}
      <div className="w-full max-w-md bg-[#171717] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

        <div className="space-y-4 text-md">
          {cart.map((item) => (
            <div className="flex justify-between" key={item._id}>
              <span>{item.name} (x{item.quantity})</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}

          <hr className="border-[#A58077] my-2" />

          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
          </div>

          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total:</span>
            <span>${total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
