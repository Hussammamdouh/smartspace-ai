import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash, 
  FaEye,
  FaArrowLeft,
  FaStar,
  FaSpinner,
  FaGift,
  FaShare,
  FaCheck
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { useCart } from "../contexts/CartContext";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
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
            ids: wishlist.join(',')
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

  const removeFromWishlist = async (productId) => {
    setRemovingItem(productId);
    try {
      const newWishlist = wishlist.filter(id => id !== productId);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setProducts(prev => prev.filter(product => product._id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove item from wishlist');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock === 0) {
      toast.error('This item is out of stock');
      return;
    }

    setAddingToCart(product._id);
    try {
      await addToCart(product);
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to add to cart');
      return;
    }

    setAddingToCart('bulk');
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
    } finally {
      setAddingToCart(null);
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

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
                    disabled={addingToCart === 'bulk'}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 disabled:opacity-50"
                  >
                    {addingToCart === 'bulk' ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaShoppingCart />
                    )}
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
                <FaGift className="inline mr-2" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-[#2C2C2C] rounded-2xl overflow-hidden border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative">
                  <div className="aspect-square bg-[#1e1e1e] flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image || product.filePath}
                      alt={product.name}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                  </div>
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => toggleSelectItem(product._id)}
                      className="w-5 h-5 bg-[#1e1e1e] border-[#3C3C3C] rounded focus:ring-[#A58077] focus:ring-2"
                    />
                  </div>
                  
                  {/* Remove from Wishlist Button */}
                  <button
                    className="absolute top-3 right-3 bg-[#1e1e1e] text-[#A58077] p-2 rounded-lg shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 z-10 hover:scale-110"
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={removingItem === product._id}
                    aria-label="Remove from Wishlist"
                  >
                    {removingItem === product._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>

                  {/* Stock Status */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-[#E5CBBE] mb-2 line-clamp-2 group-hover:text-white transition-colors duration-200">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm text-[#A58077]">4.8</span>
                    </div>
                    <span className="text-sm text-[#A58077]">•</span>
                    <span className="text-sm text-[#A58077] capitalize">{product.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[#A58077]">
                      ${product.price?.toFixed(2)}
                    </span>
                    <span className="text-sm text-[#A58077]">
                      Stock: {product.stock || 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                    >
                      <FaEye />
                      <span className="text-sm">View</span>
                    </button>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || addingToCart === product._id}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaShoppingCart />
                      )}
                      <span className="text-sm">
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </span>
                    </button>
                  </div>
                </div>
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
                <FaArrowLeft className="inline mr-2" />
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