import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axiosInstance from "../utils/axiosInstance";
import { 
  FaHeart, 
  FaRegHeart, 
  FaArrowLeft, 
  FaShoppingCart, 
  FaStar,
  FaPlus,
  FaMinus,
  FaSpinner,
  FaShare,
  FaEye,
  FaTruck,
  FaShieldAlt,
  FaCheck,
  FaBox,
  FaPalette,
  FaTag,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";
import Loader from "../components/Loader";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";

const SingleProductPage = () => {
  const { isDarkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/inventory/${id}`);
        const currentProduct = data.data || data;
        setProduct(currentProduct);

        // Fetch related products
        const relatedRes = await axiosInstance.get('/inventory', {
          params: {
            category: currentProduct.category,
            limit: 6,
          },
        });

        setRelatedProducts(
          (relatedRes.data.data || []).filter(
            (item) => item._id !== currentProduct._id
          )
        );
      } catch (err) {
        console.error('Product fetch error:', err);
        setError("Failed to load the product.");
        toast.error("Failed to load product details");
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = () => {
    const newWishlist = wishlist.includes(product._id)
      ? wishlist.filter((pid) => pid !== product._id)
      : [...wishlist, product._id];
    
    setWishlist(newWishlist);
    toast.success(wishlist.includes(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product is already in cart
    const existingItem = cart.find(item => item._id === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
      toast.error(`Cannot add more items. Only ${product.stock - currentQuantity} available.`);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart({ ...product, quantity });
      toast.success('Added to cart successfully!');
      setQuantity(1);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      toast.error(`Maximum ${product.stock} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' };
    if (product.stock <= 5) return { text: `Low Stock (${product.stock})`, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' };
    return { text: `In Stock (${product.stock})`, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/20' };
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing ${product.name}!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share product');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        <Loader size={80} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen pt-24 pb-16 transition-colors duration-500 relative overflow-hidden ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
          }`}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-16">
            <div className="text-8xl mb-6 transform hover:scale-110 transition-transform duration-300">😕</div>
            <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
            }`}>
              Product Not
              <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                  : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
              }`}> Found</span>
            </h2>
            <p className={`text-lg mb-8 transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              {error || 'The product you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate("/products")}
              className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                  : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
              }`}
            >
              <FaArrowLeft className="inline mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const productImages = [product.image, product.filePath].filter(Boolean);

  return (
    <div className={`min-h-screen pt-24 pb-16 transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
        }`} style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 bg-[size:50px_50px] transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-[linear-gradient(rgba(165,128,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.03)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(139,107,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.05)_1px,transparent_1px)]'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm mb-6 transition-colors duration-500 ${
          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
        }`}>
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/")}>Home</span>
          <span className="opacity-50">/</span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/products")}>Products</span>
          <span className="opacity-50">/</span>
          <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>{product.name}</span>
        </nav>
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className={`mb-8 flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
            isDarkMode
              ? 'bg-[#2C2C2C] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
              : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
          }`}
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Products</span>
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className={`relative rounded-2xl p-6 border backdrop-blur-xl overflow-hidden group transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <img
                src={productImages[selectedImage] || product.image}
                alt={product.name || "Product Image"}
                className={`w-full h-96 lg:h-[500px] object-contain rounded-xl group-hover:scale-110 transition-transform duration-500 ${
                  isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'
                }`}
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x500/2C2C2C/A58077?text=No+Image';
                }}
              />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className={`p-3 rounded-lg transition-all duration-300 shadow-lg hover:scale-110 hover:rotate-12 transform ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#A58077] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white'
                      : 'bg-white text-[#8B6B61] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white border border-[#E5D3C7]'
                  }`}
                  onClick={handleShare}
                  aria-label="Share Product"
                >
                  <FaShare />
                </button>
                <button
                  className={`p-3 rounded-lg transition-all duration-300 shadow-lg hover:scale-110 hover:rotate-12 transform ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#A58077] hover:bg-red-500 hover:text-white'
                      : 'bg-white text-[#8B6B61] hover:bg-red-500 hover:text-white border border-[#E5D3C7]'
                  }`}
                  onClick={toggleWishlist}
                  aria-label="Toggle Wishlist"
                >
                  {wishlist.includes(product._id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>

              {/* Stock Status */}
              <div className={`absolute top-4 left-4 px-3 py-2 rounded-lg text-sm font-semibold border transform hover:scale-105 transition-all duration-300 ${stockStatus.bg} ${stockStatus.border} ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-110 ${
                      selectedImage === index 
                        ? isDarkMode
                          ? 'border-[#A58077] ring-2 ring-[#A58077]/50'
                          : 'border-[#8B6B61] ring-2 ring-[#8B6B61]/50'
                        : isDarkMode
                          ? 'border-[#3C3C3C] hover:border-[#A58077]/50'
                          : 'border-[#E5D3C7] hover:border-[#8B6B61]/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="space-y-8">
            
            {/* Product Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <FaBox className="text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl lg:text-4xl font-bold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>
                    {product.name}
                  </h1>
                  <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    <span className="capitalize px-2 py-1 rounded-lg bg-opacity-20">{product.category}</span>
                    {product.style && <span className="capitalize px-2 py-1 rounded-lg bg-opacity-20">{product.style}</span>}
                    {product.color && <span className="capitalize px-2 py-1 rounded-lg bg-opacity-20">{product.color}</span>}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg transform hover:scale-110 transition-transform duration-300" />
                  ))}
                </div>
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>4.8 (128 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  ${product.price?.toFixed(2)}
                </span>
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold border transform hover:scale-105 transition-all duration-300 ${stockStatus.bg} ${stockStatus.border} ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Description</h3>
                <p className={`leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className={`rounded-2xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { icon: FaPalette, label: "Style", value: product.style || 'N/A' },
                  { icon: FaTag, label: "Color", value: product.color || 'N/A' },
                  { icon: FaBox, label: "Category", value: product.category || 'N/A' },
                  { icon: FaTruck, label: "Shipping", value: "Free on orders over $300" }
                ].map((detail, idx) => (
                  <div key={idx} className="flex items-center space-x-3 transform hover:scale-105 transition-all duration-300">
                    <detail.icon className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`} />
                    <div>
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>{detail.label}:</span>
                      <span className={`ml-2 capitalize transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>{detail.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className={`rounded-2xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>Add to Cart</h3>
              
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className={`font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border transform hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                        : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                    }`}
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className={`w-16 text-center text-lg font-semibold py-2 rounded-lg border transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] border-[#3C3C3C] text-[#E5CBBE]'
                      : 'bg-white border-[#E5D3C7] text-[#2C2C2C] shadow-md'
                  }`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border transform hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                        : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                    }`}
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className={`w-full py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
              >
                {addingToCart ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className={`flex items-center justify-center mt-4 text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                <FaShieldAlt className="mr-2 transform hover:scale-110 transition-transform duration-300" />
                <span>Secure Checkout</span>
                <FaCheck className="ml-2 transform hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                    : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
                }`}>
                  Recommendations
                </span>
              </div>
              
              <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
              }`}>
                You Might Also
                <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}> Like</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className={`rounded-xl overflow-hidden transition-all duration-500 cursor-pointer border backdrop-blur-xl transform hover:scale-105 perspective-1000 ${
                    isDarkMode
                      ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077] hover:shadow-2xl hover:shadow-[#A58077]/20'
                      : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61] hover:shadow-2xl hover:shadow-[#8B6B61]/20 shadow-lg'
                  }`}
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                >
                  <div className="aspect-square overflow-hidden relative group">
                    <img
                      src={relatedProduct.image || relatedProduct.filePath}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className={`p-4 transition-colors duration-300 ${
                    isDarkMode ? 'bg-[#2C2C2C]/80' : 'bg-white/80'
                  }`}>
                    <h3 className={`font-semibold mb-2 line-clamp-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        ${relatedProduct.price?.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-sm transform hover:scale-110 transition-transform duration-300" />
                        <span className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProductPage;
