import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">😕</div>
            <h2 className="text-3xl font-bold mb-4">
              Product Not
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Found</span>
            </h2>
            <p className="text-[#A58077] text-lg mb-8">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaArrowLeft className="inline mr-2" />
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
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className="mb-8 flex items-center space-x-2 px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] overflow-hidden group">
              <img
                src={productImages[selectedImage] || product.image}
                alt={product.name || "Product Image"}
                className="w-full h-96 lg:h-[500px] object-contain bg-[#1e1e1e] rounded-xl group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x500/2C2C2C/A58077?text=No+Image';
                }}
              />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className="bg-[#1e1e1e] text-[#A58077] p-3 rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={handleShare}
                  aria-label="Share Product"
                >
                  <FaShare />
                </button>
                <button
                  className="bg-[#1e1e1e] text-[#A58077] p-3 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  onClick={toggleWishlist}
                  aria-label="Toggle Wishlist"
                >
                  {wishlist.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              {/* Stock Status */}
              <div className={`absolute top-4 left-4 px-3 py-2 rounded-lg text-sm font-semibold ${stockStatus.bg} ${stockStatus.border} border ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-[#A58077]' 
                        : 'border-[#3C3C3C] hover:border-[#A58077]/50'
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
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                  <FaBox className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-[#E5CBBE] mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-[#A58077]">
                    <span className="capitalize">{product.category}</span>
                    {product.style && <span className="capitalize">{product.style}</span>}
                    {product.color && <span className="capitalize">{product.color}</span>}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>
                <span className="text-[#A58077]">4.8 (128 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-[#A58077]">
                  ${product.price?.toFixed(2)}
                </span>
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${stockStatus.bg} ${stockStatus.border} border ${stockStatus.color}`}>
                  {stockStatus.text}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#E5CBBE]">Description</h3>
                <p className="text-[#A58077] leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-4">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <FaPalette className="text-[#A58077]" />
                  <div>
                    <span className="text-[#A58077]">Style:</span>
                    <span className="text-[#E5CBBE] ml-2 capitalize">{product.style || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaTag className="text-[#A58077]" />
                  <div>
                    <span className="text-[#A58077]">Color:</span>
                    <span className="text-[#E5CBBE] ml-2 capitalize">{product.color || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaBox className="text-[#A58077]" />
                  <div>
                    <span className="text-[#A58077]">Category:</span>
                    <span className="text-[#E5CBBE] ml-2 capitalize">{product.category || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaTruck className="text-[#A58077]" />
                  <div>
                    <span className="text-[#A58077]">Shipping:</span>
                    <span className="text-[#E5CBBE] ml-2">Free on orders over $300</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-4">Add to Cart</h3>
              
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-[#A58077] font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg flex items-center justify-center hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className="w-16 text-center text-lg font-semibold bg-[#1e1e1e] py-2 rounded-lg border border-[#3C3C3C]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg flex items-center justify-center hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {addingToCart ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    <span>
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </>
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center mt-4 text-sm text-[#A58077]">
                <FaShieldAlt className="mr-2" />
                <span>Secure Checkout</span>
                <FaCheck className="ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              You Might Also
              <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Like</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-[#2C2C2C] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#3C3C3C] hover:border-[#A58077] transform hover:scale-105"
                  onClick={() => navigate(`/product/${relatedProduct._id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={relatedProduct.image || relatedProduct.filePath}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2C2C2C/A58077?text=No+Image';
                      }}
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-[#E5CBBE] mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#A58077]">
                        ${relatedProduct.price?.toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-[#A58077]">4.8</span>
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
