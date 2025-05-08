import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get('/inventory', {
          params: {
            ids: wishlist.join(',')
          }
        });
        setProducts(data.data || []);
      } catch (error) {
        toast.error('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-[#A58077] mb-2">Home &gt; Wishlist</p>
          <h1 className="text-5xl font-extrabold tracking-wide">
            <span className="text-[#A58077]">W</span>ishlist
          </h1>
        </div>

        {/* Wishlist Items */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#A58077]">Your wishlist is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-4 px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-[#2C2C2C] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative">
                  <div className="w-full h-64 bg-[#2c2c2c] flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-contain w-full h-full rounded-t-2xl"
                    />
                  </div>
                  <button
                    className="absolute top-3 right-3 bg-white text-[#181818] p-2 rounded-full shadow hover:text-[#A58077] transition z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                    aria-label="Toggle Wishlist"
                  >
                    <FaHeart className="text-[#A58077]" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <p className="text-[#A58077] font-bold mt-2">
                    ${product.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 