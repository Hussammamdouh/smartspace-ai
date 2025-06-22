import { useContext, useEffect, useState } from "react";
import CartContext from "../contexts/CartContext";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";
import { MdOutlinePayments } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [moreProducts, setMoreProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const decreaseQuantity = (product) => {
    if (product.quantity === 1) {
      removeFromCart(product._id);
    } else {
      updateQuantity(product._id, product.quantity - 1);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = subtotal > 500 ? subtotal * 0.1 : 0; // 10% discount for orders over $500
  const total = subtotal - discount;

  useEffect(() => {
    const fetchMore = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get('/inventory', {
          params: { limit: 4 },
        });
        setMoreProducts(data.data || []);
      } catch {
        console.error("Failed to load more products");
        toast.error("Failed to load recommended products");
      } finally {
        setLoading(false);
      }
    };
    fetchMore();
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[#E5CBBE]">C</span>art
        </h1>
        <p className="text-xl text-[#A58077] mb-8">Your cart is empty</p>
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
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 space-y-20">
      {/* Header */}
      <div>
        <div className="text-sm text-[#A58077] mb-2">Home &gt; Products &gt; Cart</div>
        <h1 className="text-5xl font-bold">
          <span className="text-[#E5CBBE]">C</span>art
        </h1>
      </div>

      {/* Cart Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
              <div
                key={item._id}
              className="bg-[#2C2C2C] rounded-lg p-6 flex items-center gap-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                className="w-24 h-24 object-contain bg-[#181818] rounded"
                />
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-[#A58077]">${item.price.toFixed(2)}</p>
                  </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQuantity(item)}
                    className="w-8 h-8 bg-[#A58077] text-white rounded-full flex items-center justify-center hover:bg-[#8B6B63] transition"
                    >
                      <FaMinus size={12} />
                    </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                    <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 bg-[#A58077] text-white rounded-full flex items-center justify-center hover:bg-[#8B6B63] transition"
                    >
                      <FaPlus size={12} />
                    </button>
                </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 transition"
                    >
                  <FaTrash />
                    </button>
                  </div>
                </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-[#2C2C2C] rounded-lg p-6 h-fit">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

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
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount (10%):</span>
                <span>-${discount.toFixed(2)}</span>
            </div>
            )}
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
        <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A58077]"></div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default CartPage;
