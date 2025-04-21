import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { FaPlus, FaMinus, FaTrash, FaApple } from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const decreaseQuantity = (product) => {
    if (product.quantity === 1) {
      removeFromCart(product._id);
    } else {
      updateQuantity(product._id, product.quantity - 1);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = 30; 
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <h1 className="text-5xl font-bold mb-12">Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Basket Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            Basket <span role="img">🛒</span>
          </h2>

          {cart.length === 0 ? (
            <p className="text-lg text-[#A58077]">Your basket is empty.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="border-b border-[#E5CBBE]/20 py-6 flex gap-6 items-center"
              >
                {/* Image */}
                <img
                  src={item.filePath}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="text-lg font-bold">${item.price}</span>
                  </div>
                  <p className="text-sm text-[#A58077]">
                    {item.description?.slice(0, 100)}...
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="bg-[#E5CBBE] text-[#181818] w-8 h-8 rounded-full flex items-center justify-center"
                      onClick={() => decreaseQuantity(item)}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="text-lg font-semibold">{item.quantity}</span>
                    <button
                      className="bg-[#E5CBBE] text-[#181818] w-8 h-8 rounded-full flex items-center justify-center"
                      onClick={() => addToCart(item)}
                    >
                      <FaPlus size={12} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 ml-4"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-[#171717] text-[#E5CBBE] p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Total :</h2>

          <div className="space-y-4 text-md">
            {cart.map((item) => (
              <div className="flex justify-between" key={item._id}>
                <span>{item.name}</span>
                <span>${item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-[#181818] my-2" />
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span>Sale:</span>
              <span>${discount}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-3 mt-6">
          <button
    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] hover:opacity-80 transition"
    onClick={() => navigate("/checkout")}
  >
    <FiCreditCard />
    Pay with Card
  </button>

  <button
    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] hover:opacity-80 transition"
    onClick={() => navigate("/payment")}
  >
    <MdOutlinePayments />
    Pay When Receive
  </button>
          </div>

          {/* Clear cart */}
          <button
            className="mt-6 w-full text-sm text-red-500 hover:text-red-700 underline"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Add More (Coming soon / optional) */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Add more...</h2>
        {/* You can map more products here later */}
        <div className="text-[#A58077] text-sm">
          (Related product carousel / grid will go here)
        </div>
      </div>
    </div>
  );
};

export default CartPage;
