import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaShoppingCart
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { useCart } from "../contexts/CartContext";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
        setLoading(true);
        const { data } = await axiosInstance.get('/inventory', {
          params: {
            ids: wishlist
          }
        });
        setProducts(data.data || []);
      } catch {
        toast.error('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to add to cart');
      return;
    }

    try {
      const selectedProducts = products.filter(product => selectedItems.includes(product._id));
      for (const product of selectedProducts) {
        if (product.stock > 0) {
          await addToCart(product);
        }
      }
      toast.success(`${selectedItems.length} items added to cart!`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const clearWishlist = () => {
    if (wishlist.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlist([]);
      setProducts([]);
      setSelectedItems([]);
      localStorage.removeItem('wishlist');
      toast.success('Wishlist cleared successfully');
    }
  };

  const selectAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(products.map(product => product._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  if (!loading && wishlist.length > 0 && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] flex flex-col items-center justify-center text-[#E5CBBE] pt-24 pb-16">
        <h2 className="text-3xl font-bold mb-4">No products found in your wishlist</h2>
        <p className="text-lg text-[#A58077] mb-8">Some items may have been removed or are unavailable.</p>
        <button
          onClick={clearWishlist}
          className="px-6 py-3 text-sm border border-red-400 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-all duration-300"
        >
          Clear Wishlist
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Wishlist</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                My
                <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Wishlist</span>
              </h1>
              <p className="text-[#A58077] text-lg">
                Save your favorite items for later
              </p>
            </div>
            {wishlist.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#A58077]">
                  {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist
                </span>
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2 text-sm border border-red-400 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-all duration-300"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {products.length > 0 && (
          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === products.length && products.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 bg-[#1e1e1e] border-[#3C3C3C] rounded focus:ring-[#A58077] focus:ring-2"
                  />
                  <span className="text-sm text-[#E5CBBE]">
                    Select All ({selectedItems.length}/{products.length})
                  </span>
                </label>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddSelectedToCart}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 disabled:opacity-50"
                  >
                    <FaShoppingCart />
                    <span>Add {selectedItems.length} to Cart</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">💝</div>
            <h2 className="text-3xl font-bold text-[#E5CBBE] mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-[#A58077] text-lg mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist. You can save items for later and get notified when they go on sale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaShoppingCart className="inline mr-2" />
                Browse Products
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-8 py-4 bg-[#2C2C2C] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 font-semibold border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaShoppingCart className="inline mr-2" />
                View Cart
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] flex flex-col items-center">
                <img
                  src={product.image || 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg shadow mb-4"
                  onError={e => { e.target.src = 'https://via.placeholder.com/128x128/2C2C2C/A58077?text=No+Image'; }}
                />
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-[#A58077] mb-2">${product.price?.toFixed(2) ?? 'N/A'}</p>
                {/* Add more product details as needed */}
              </div>
            ))}
          </div>
        )}

        {/* Recommended Products */}
        {products.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              You Might Also
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Like</span>
            </h2>
            <div className="text-center">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-[#2C2C2C] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 font-semibold border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaShoppingCart className="inline mr-2" />
                Discover More Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 