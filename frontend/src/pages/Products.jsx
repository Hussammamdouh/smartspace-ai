import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useTheme } from "../contexts/ThemeContext";
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
  const { isDarkMode } = useTheme();
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
      <div className={`min-h-screen pt-24 pb-16 transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-[#F5F1ED] text-[#2C2C2C]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className={`h-4 rounded w-32 mb-2 animate-pulse ${
              isDarkMode ? 'bg-[#2C2C2C]' : 'bg-[#E5D3C7]'
            }`}></div>
            <div className={`h-12 rounded w-48 animate-pulse ${
              isDarkMode ? 'bg-[#2C2C2C]' : 'bg-[#E5D3C7]'
            }`}></div>
          </div>
          
          {/* Search and Filters Skeleton */}
          <div className="mb-8">
            <div className={`h-12 rounded mb-4 animate-pulse ${
              isDarkMode ? 'bg-[#2C2C2C]' : 'bg-[#E5D3C7]'
            }`}></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-10 rounded w-24 animate-pulse ${
                  isDarkMode ? 'bg-[#2C2C2C]' : 'bg-[#E5D3C7]'
                }`}></div>
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
      <div className={`min-h-screen flex items-center justify-center pt-24 pb-16 transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-[#F5F1ED] text-[#2C2C2C]'
      }`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className={`px-6 py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]' 
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        <div className={`absolute top-1/4 left-0 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
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
        
        {/* Header */}
        <div className="mb-12 relative">
          {/* Breadcrumb */}
          <nav className={`flex items-center space-x-2 text-sm mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="opacity-50">/</span>
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Products</span>
          </nav>
          
          {/* Title Section */}
          <div className="space-y-4">
            <div className="inline-block mb-2">
              <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                  : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
              }`}>
                Product Catalog
              </span>
            </div>
            
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight transform hover:scale-[1.02] transition-transform duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
            }`}>
              <span className="block mb-2">Discover Our</span>
              <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                  : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
              }`}>
                Collection
              </span>
            </h1>
            
            <p className={`text-xl sm:text-2xl max-w-2xl transition-colors duration-500 leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Find the perfect pieces to transform your space with our curated selection
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className={`absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
            }`}></div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, style, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 py-5 pl-14 pr-12 border-2 rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.01] backdrop-blur-xl ${
                  isDarkMode
                    ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/30 text-[#E5CBBE] placeholder-[#A58077]'
                    : 'bg-white/90 border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/30 text-[#2C2C2C] placeholder-[#8B6B61] shadow-xl'
                }`}
              />
              <FaSearch className={`absolute left-5 top-1/2 transform -translate-y-1/2 text-lg transition-all duration-300 group-hover:scale-110 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-5 top-1/2 transform -translate-y-1/2 transition-all duration-200 hover:scale-110 hover:rotate-90 ${
                    isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                  }`}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#2C2C2C]/50 border-[#3C3C3C]/50'
              : 'bg-white/60 border-[#E5D3C7]/50 shadow-lg'
          }`}>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-300 border-2 transform hover:scale-105 hover:rotate-1 font-medium ${
                isDarkMode
                  ? 'bg-[#2C2C2C] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                  : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
              }`}
            >
              <FaSlidersH className="text-lg" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isDarkMode ? 'bg-[#A58077]' : 'bg-[#8B6B61]'
                }`}></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className={`flex items-center space-x-2 p-1 rounded-xl backdrop-blur-sm ${
              isDarkMode ? 'bg-[#1a1a1a]/50' : 'bg-white/50'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  viewMode === 'grid' 
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-transparent text-[#E5CBBE] hover:bg-[#A58077]/20 hover:text-white'
                      : 'bg-transparent text-[#2C2C2C] hover:bg-[#8B6B61]/20 hover:text-[#8B6B61]'
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  viewMode === 'list' 
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-transparent text-[#E5CBBE] hover:bg-[#A58077]/20 hover:text-white'
                      : 'bg-transparent text-[#2C2C2C] hover:bg-[#8B6B61]/20 hover:text-[#8B6B61]'
                }`}
              >
                <FaList />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-105 font-medium cursor-pointer ${
                isDarkMode
                  ? 'bg-[#2C2C2C] text-[#E5CBBE] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/30 hover:border-[#A58077]'
                  : 'bg-white text-[#2C2C2C] border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/30 hover:border-[#8B6B61] shadow-md'
              }`}
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
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>Active filters:</span>
              {selectedCategory && (
                <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-[#A58077]/20 text-[#A58077]'
                    : 'bg-[#8B6B61]/20 text-[#8B6B61]'
                }`}>
                  Category: {selectedCategory}
                </span>
              )}
              {selectedStyle && (
                <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-[#A58077]/20 text-[#A58077]'
                    : 'bg-[#8B6B61]/20 text-[#8B6B61]'
                }`}>
                  Style: {selectedStyle}
                </span>
              )}
              {selectedColor && (
                <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-[#A58077]/20 text-[#A58077]'
                    : 'bg-[#8B6B61]/20 text-[#8B6B61]'
                }`}>
                  Color: {selectedColor}
                </span>
              )}
              {searchQuery && (
                <span className={`px-3 py-1 rounded-full text-sm transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-[#A58077]/20 text-[#A58077]'
                    : 'bg-[#8B6B61]/20 text-[#8B6B61]'
                }`}>
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mb-8 p-6 rounded-xl border transition-all duration-500 transform hover:scale-[1.01] ${
            isDarkMode
              ? 'bg-[#2C2C2C] border-[#3C3C3C]'
              : 'bg-white border-[#E5D3C7] shadow-xl'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Category Filter */}
              <div>
                <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20'
                      : 'bg-white text-[#2C2C2C] border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20'
                  }`}
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
                <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20'
                      : 'bg-white text-[#2C2C2C] border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20'
                  }`}
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
                <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20'
                      : 'bg-white text-[#2C2C2C] border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20'
                  }`}
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
                <label className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Max Price: ${priceRange.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider ${
                    isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#E5D3C7]'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
            }`}>No products found</h3>
            <p className={`mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              {hasActiveFilters 
                ? "Try adjusting your filters or search terms" 
                : "We're working on adding more products"
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`px-6 py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
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
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                      : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                  }`}
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
const ProductCard = ({ product, isWishlisted, onToggleWishlist, onClick, viewMode, isDarkMode }) => {
  const isGrid = viewMode === 'grid';

  if (isGrid) {
    return (
      <div 
        className={`group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border transform hover:scale-105 hover:rotate-y-2 perspective-1000 ${
          isDarkMode
            ? 'bg-[#2C2C2C] border-[#3C3C3C] hover:border-[#A58077] hover:shadow-2xl hover:shadow-[#A58077]/20'
            : 'bg-white border-[#E5D3C7] hover:border-[#8B6B61] hover:shadow-2xl hover:shadow-[#8B6B61]/20'
        }`}
        onClick={() => onClick(product._id)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden transform-style-3d">
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
            className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg ${
              isDarkMode
                ? 'bg-white/90 text-[#A58077] hover:text-red-500'
                : 'bg-white/95 text-[#8B6B61] hover:text-red-500'
            }`}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className={`flex-1 py-2 px-3 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
            }`}>
              <FaEye className="inline mr-1" />
              View
            </button>
            <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-[#2C2C2C] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white'
                : 'bg-white text-[#2C2C2C] hover:bg-[#8B6B61] hover:text-white'
            }`}>
              <FaShoppingCart className="inline mr-1" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold transition-colors duration-200 line-clamp-2 ${
              isDarkMode
                ? 'text-[#E5CBBE] group-hover:text-white'
                : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
            }`}>
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              ${product.price?.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>4.8</span>
            </div>
          </div>

          <div className={`flex items-center justify-between text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
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
      className={`group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer border transform hover:scale-[1.02] hover:rotate-y-1 perspective-1000 ${
        isDarkMode
          ? 'bg-[#2C2C2C] border-[#3C3C3C] hover:border-[#A58077] hover:shadow-xl'
          : 'bg-white border-[#E5D3C7] hover:border-[#8B6B61] hover:shadow-xl'
      }`}
      onClick={() => onClick(product._id)}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-48 h-48 flex-shrink-0 transform-style-3d">
          <img
            src={product.image || product.filePath}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 group-hover:rotate-y-2 transition-all duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400/2C2C2C/A58077?text=No+Image';
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => onToggleWishlist(product._id, e)}
            className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-lg ${
              isDarkMode
                ? 'bg-white/90 text-[#A58077] hover:text-red-500'
                : 'bg-white/95 text-[#8B6B61] hover:text-red-500'
            }`}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className={`text-xl font-semibold transition-colors duration-200 mb-2 ${
                isDarkMode
                  ? 'text-[#E5CBBE] group-hover:text-white'
                  : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
              }`}>
                {product.name}
              </h3>
              <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                {product.description || 'Beautiful interior design piece that will transform your space.'}
              </p>
            </div>
            <div className="text-right ml-4">
              <span className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                ${product.price?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
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
              
              <button className={`px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                  : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
              }`}>
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
  isDarkMode: PropTypes.bool.isRequired,
};

export default ProductsPage;
