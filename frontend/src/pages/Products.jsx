import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaHeart, FaRegHeart } from "react-icons/fa";
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

  const navigate = useNavigate();
  const limit = 9;

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

      const response = await axiosInstance.get('/inventory', { params });

      const newProducts = response.data.data || [];
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
      setTotalPages(response.data.meta?.totalPages || 1);
      setError("");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, selectedStyle, selectedColor, priceRange, navigate]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [selectedCategory, selectedStyle, selectedColor, priceRange]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const handleFilterChange = (filter, value) => {
    switch (filter) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'style':
        setSelectedStyle(value);
        break;
      case 'color':
        setSelectedColor(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      default:
        break;
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedStyle && product.style !== selectedStyle) return false;
      if (selectedColor && product.color !== selectedColor) return false;
      if (product.price > priceRange) return false;
      return true;
    });
  }, [products, selectedCategory, selectedStyle, selectedColor, priceRange]);

  const handleCardClick = (id) => navigate(`/product/${id}`);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(1)}
            className="px-4 py-2 bg-[#A58077] text-white rounded hover:bg-[#8B6B63]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-[#A58077] mb-2">Home &gt; Product</p>
        <h1 className="text-5xl font-extrabold tracking-wide">
          <span className="text-[#A58077]">P</span>roduct
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between gap-6 mb-12">
        <h2 className="text-2xl font-semibold">Categories</h2>

        <div className="flex gap-4">
          <Dropdown title="Category">
            {[
              "bedroom",
              "child bedroom",
              "kitchen",
              "bathroom",
              "living room",
            ].map((cat) => (
              <div
                key={cat}
                className={`px-4 py-2 cursor-pointer rounded-lg ${
                  selectedCategory === cat
                    ? "bg-[#A58077] text-white"
                    : "hover:bg-[#A58077] hover:text-white text-[#181818]"
                }`}
                onClick={() => handleFilterChange('category', cat)}
              >
                {cat}
              </div>
            ))}
          </Dropdown>
          <Dropdown title="Style">
            {["modern", "classic", "minimal", "industrial", "boho"].map(
              (style) => (
                <div
                  key={style}
                  className={`px-4 py-2 cursor-pointer rounded-lg ${
                    selectedStyle === style
                      ? "bg-[#A58077] text-white"
                      : "hover:bg-[#A58077] hover:text-white text-[#181818]"
                  }`}
                  onClick={() => handleFilterChange('style', style)}
                >
                  {style}
                </div>
              )
            )}
          </Dropdown>
          <Dropdown title="Color">
            {[
              "white",
              "blue",
              "gray",
              "black",
              "wood",
              "beige",
              "green",
              "cream",
            ].map((color) => (
              <div
                key={color}
                className={`px-4 py-2 cursor-pointer rounded-lg ${
                  selectedColor === color
                    ? "bg-[#A58077] text-white"
                    : "hover:bg-[#A58077] hover:text-white text-[#181818]"
                }`}
                onClick={() => handleFilterChange('color', color)}
              >
                {color}
              </div>
            ))}
          </Dropdown>
          <Dropdown title={`Price < $${priceRange}`}>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={priceRange}
              onChange={(e) => handleFilterChange('price', Number(e.target.value))}
              className="w-full accent-[#A58077]"
            />
          </Dropdown>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-[#2C2C2C] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
            onClick={() => handleCardClick(product._id)}
          >
            <div className="relative">
              <div
                className={`w-full ${
                  product.isFeatured ? "h-[500px]" : "h-64"
                } bg-[#2c2c2c] flex items-center justify-center`}
              >
                <img
                  src={product.image}
                  alt={product.name || "Product Image"}
                  className="object-contain w-full h-full rounded-t-2xl"
                  style={{ backgroundColor: "#2c2c2c" }}
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
                {wishlist.includes(product._id) ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
              </button>
            </div>
            <div className="p-4 bg-[#2C2C2C]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#E5CBBE]">{product.name}</h3>
                <span className="text-[#A58077] font-bold">
                  ${product.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {currentPage < totalPages && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-xl">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

const Dropdown = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-6 py-2 rounded-md border border-[#A58077] text-[#A58077] hover:bg-[#A58077] hover:text-white transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {title}
      </button>
      {open && (
        <div className="absolute top-full mt-2 bg-[#E5CBBE] text-[#181818] rounded-lg shadow-lg p-4 min-w-[180px] z-10">
          {children}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default ProductsPage;
