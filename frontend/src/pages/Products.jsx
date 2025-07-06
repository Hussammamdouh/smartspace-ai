import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { 
  FaHeart, 
  FaRegHeart, 
  FaSearch, 
  FaTimes, 
  FaSlidersH,
  FaTh,
  FaList,
  FaStar,
  FaShoppingCart,
  FaEye
} from "react-icons/fa";
import PropTypes from "prop-types";
import SkeletonCard from "../components/SkeletonCard";
import { toast } from "react-hot-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [priceRange, setPriceRange] = useState(3000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-low', 'price-high', 'name'

  const navigate = useNavigate();
  const limit = 12;
  const searchTimeoutRef = useRef(null);

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setIsLoadingMore(true);

    try {
      const params = {
        maxPrice: priceRange,
        page,
        limit,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStyle) params.style = selectedStyle;
      if (selectedColor) params.color = selectedColor;
      if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();

      const response = await axiosInstance.get('/inventory', { params });

      const newProducts = response.data.data || [];
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setTotalPages(response.data.meta?.totalPages || 1);
      setError("");
    } catch (error) {
      console.error('Products fetch error:', error);
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedStyle, selectedColor, priceRange, debouncedSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [selectedCategory, selectedStyle, selectedColor, priceRange, debouncedSearchQuery]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedStyle("");
    setSelectedColor("");
    setPriceRange(3000);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory || selectedStyle || selectedColor || searchQuery;

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return sorted;
  }, [products, sortBy]);

  const handleCardClick = (id) => navigate(`/product/${id}`);

  const toggleWishlist = (productId, e) => {
    e.stopPropagation();
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    toast.success(wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-4 bg-[#2C2C2C] rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-12 bg-[#2C2C2C] rounded w-48 animate-pulse"></div>
          </div>
          
          {/* Search and Filters Skeleton */}
          <div className="mb-8">
            <div className="h-12 bg-[#2C2C2C] rounded mb-4 animate-pulse"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-[#2C2C2C] rounded w-24 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex items-center justify-center pt-24 pb-16">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300"
          >
            Try Again
          </button>
        </div>
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
            <span className="text-[#E5CBBE]">Products</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            Discover Our
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Collection</span>
          </h1>
          <p className="text-[#A58077] text-lg">
            Find the perfect pieces to transform your space
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name, style, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-4 pl-12 bg-[#2C2C2C] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077] transition-all duration-300"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
            >
              <FaSlidersH />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#A58077] rounded-full"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-[#A58077] text-white' 
                    : 'bg-[#2C2C2C] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white'
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-[#A58077] text-white' 
                    : 'bg-[#2C2C2C] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white'
                }`}
              >
                <FaList />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#A58077] text-sm">Active filters:</span>
              {selectedCategory && (
                <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedStyle && (
                <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-sm">
                  Style: {selectedStyle}
                </span>
              )}
              {selectedColor && (
                <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-sm">
                  Color: {selectedColor}
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-sm">
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-[#2C2C2C] rounded-xl border border-[#3C3C3C]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-[#E5CBBE] mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e1e1e] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  <option value="bedroom">Bedroom</option>
                  <option value="child bedroom">Child Bedroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="living room">Living Room</option>
                </select>
              </div>

              {/* Style Filter */}
              <div>
                <label className="block text-sm font-medium text-[#E5CBBE] mb-3">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e1e1e] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300"
                >
                  <option value="">All Styles</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="vintage">Vintage</option>
                  <option value="contemporary">Contemporary</option>
                </select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-medium text-[#E5CBBE] mb-3">Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e1e1e] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300"
                >
                  <option value="">All Colors</option>
                  <option value="brown">Brown</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="gray">Gray</option>
                  <option value="beige">Beige</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-[#E5CBBE] mb-3">
                  Max Price: ${priceRange.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-[#E5CBBE] mb-2">No products found</h3>
            <p className="text-[#A58077] mb-6">
              {hasActiveFilters 
                ? "Try adjusting your filters or search terms" 
                : "We're working on adding more products"
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={wishlist.includes(product._id)}
                  onToggleWishlist={toggleWishlist}
                  onClick={handleCardClick}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-[#A58077] text-white rounded-xl hover:bg-[#8B6B63] transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Slider Styles */}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, isWishlisted, onToggleWishlist, onClick, viewMode }) => {
  const isGrid = viewMode === 'grid';

  if (isGrid) {
    return (
      <div 
        className="group bg-[#2C2C2C] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#3C3C3C] hover:border-[#A58077] transform hover:scale-105"
        onClick={() => onClick(product._id)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image || product.filePath}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/2C2C2C/A58077?text=No+Image';
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => onToggleWishlist(product._id, e)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-[#A58077] hover:text-red-500 transition-all duration-300 hover:scale-110 shadow-lg"
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="flex-1 py-2 px-3 bg-[#A58077] text-white rounded-lg text-sm font-medium hover:bg-[#8B6B63] transition-colors duration-200">
              <FaEye className="inline mr-1" />
              View
            </button>
            <button className="flex-1 py-2 px-3 bg-[#2C2C2C] text-[#E5CBBE] rounded-lg text-sm font-medium hover:bg-[#A58077] hover:text-white transition-colors duration-200">
              <FaShoppingCart className="inline mr-1" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-[#E5CBBE] group-hover:text-white transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-[#A58077]">
              ${product.price?.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm text-[#A58077]">4.8</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-[#A58077]">
            <span className="capitalize">{product.category}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              product.stock > 10 ? 'bg-green-500/20 text-green-400' : 
              product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div 
      className="group bg-[#2C2C2C] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#3C3C3C] hover:border-[#A58077]"
      onClick={() => onClick(product._id)}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <img
            src={product.image || product.filePath}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/2C2C2C/A58077?text=No+Image';
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => onToggleWishlist(product._id, e)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-[#A58077] hover:text-red-500 transition-all duration-300 hover:scale-110 shadow-lg"
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#E5CBBE] group-hover:text-white transition-colors duration-200 mb-2">
                {product.name}
              </h3>
              <p className="text-[#A58077] text-sm mb-3 line-clamp-2">
                {product.description || 'Beautiful interior design piece that will transform your space.'}
              </p>
            </div>
            <div className="text-right ml-4">
              <span className="text-3xl font-bold text-[#A58077]">
                ${product.price?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-[#A58077]">
              <span className="capitalize">{product.category}</span>
              {product.style && <span className="capitalize">{product.style}</span>}
              {product.color && <span className="capitalize">{product.color}</span>}
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span>4.8</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                product.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              
              <button className="px-4 py-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200 font-medium">
                <FaEye className="inline mr-1" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  isWishlisted: PropTypes.bool.isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
};

export default ProductsPage;
