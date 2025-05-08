import { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartPage = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [moreProducts, setMoreProducts] = useState([]);

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

  useEffect(() => {
    const fetchMore = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`, {
          params: { limit: 4 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMoreProducts(data.data || []);
      } catch (err) {
        console.error("Failed to load more products");
      }
    };
    fetchMore();
  }, []);

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 space-y-20">
      {/* Header */}
      <div>
        <div className="text-sm text-[#A58077] mb-2">Home &gt; Products &gt; Cart</div>
        <h1 className="text-5xl font-bold">
          <span className="text-[#E5CBBE]">C</span>art
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Basket */}
        <div className="lg:col-span-2 space-y-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            Basket <span role="img">🛒</span>
          </h2>

          {cart.length === 0 ? (
            <p className="text-lg text-[#A58077]">Your basket is empty.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex gap-6 items-center border-b border-[#A58077]/30 pb-6"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 rounded-lg object-contain bg-[#2c2c2c]"
                />

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-[#A58077]">
                    {item.description?.slice(0, 90)}...
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="bg-[#E5CBBE] text-[#181818] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#A58077]"
                      onClick={() => decreaseQuantity(item)}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="text-lg font-bold">{item.quantity}</span>
                    <button
                      className="bg-[#E5CBBE] text-[#181818] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#A58077]"
                      onClick={() => addToCart(item)}
                    >
                      <FaPlus size={12} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 ml-6"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="bg-[#171717] p-8 rounded-xl shadow-xl flex flex-col gap-6">
          <h2 className="text-3xl font-bold mb-2">Total :</h2>

          <div className="space-y-4 text-md">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span>{item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-[#A58077]" />
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span>Sale:</span>
              <span>${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-3 mt-6">
            <button
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] transition"
              onClick={() => navigate("/checkout")}
            >
              <FiCreditCard />
              Pay with Card
            </button>
            <button
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] transition"
              onClick={() => navigate("/payment")}
            >
              <MdOutlinePayments />
              Pay When Receive
            </button>
          </div>

          {/* Clear Cart */}
          <button
            className="mt-6 w-full text-sm text-red-500 hover:text-red-700 underline"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Add More Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Add more...</h2>

        <div className="flex overflow-x-auto gap-6 scrollbar-thin scrollbar-thumb-[#A58077] scrollbar-track-[#181818]">
          {moreProducts.map((product) => (
            <div
              key={product._id}
              className="min-w-[200px] bg-[#2c2c2c] rounded-lg overflow-hidden shadow hover:scale-105 transition cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-contain bg-[#2c2c2c]"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#E5CBBE]">{product.name}</h3>
                <p className="text-sm text-[#A58077] mt-1">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
