import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import PropTypes from "prop-types";
import SkeletonCard from "../components/SkeletonCard";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState(3000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const limit = 9;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`, {
        params: {
          ...(selectedType && { type: selectedType }),
          maxPrice: priceRange,
          page: currentPage,
          limit,
        },
      });

      setProducts(response.data.data || []);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch {
      setError("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, priceRange, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCardClick = (id) => navigate(`/product/${id}`);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] px-6 lg:px-16 py-12">
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
          <Dropdown title="Color">
            <div className="text-sm text-[#181818]">Coming Soon</div>
          </Dropdown>
          <Dropdown title="Type">
            {["Furniture", "Lighting", "Decor", "Office"].map((type) => (
              <div
                key={type}
                className={`px-4 py-2 cursor-pointer rounded-lg ${
                  selectedType === type
                    ? "bg-[#A58077] text-white"
                    : "hover:bg-[#A58077] hover:text-white text-[#181818]"
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </div>
            ))}
          </Dropdown>
          <Dropdown title={`Price < $${priceRange}`}>
            <input
              type="range"
              min={100}
              max={3000}
              step={100}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#A58077]"
            />
          </Dropdown>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product, index) => {
            const isFeatured = index === 5;
            return (
              <div
                key={product._id}
                className={`relative overflow-hidden bg-[#2c2c2c] text-[#E5CBBE] rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform ${
                  isFeatured ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
                onClick={() => handleCardClick(product._id)}
              >
                <img
                  src={product.filePath}
                  alt={product.name || "Product Image"}
                  className={`w-full object-cover ${
                    isFeatured ? "h-[500px]" : "h-64"
                  } rounded-t-2xl`}
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/40 px-4 py-3 flex justify-between items-center rounded-b-2xl">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <span className="text-[#A58077] font-bold">${product.price}</span>
                </div>
                <button
                  className="absolute top-3 right-3 bg-white text-[#181818] p-2 rounded-full shadow hover:text-[#A58077] transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product._id);
                  }}
                  aria-label="Toggle Wishlist"
                >
                  {wishlist.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-md border font-bold transition-all ${
                currentPage === i + 1
                  ? "bg-[#A58077] text-white"
                  : "bg-[#E5CBBE] text-[#181818] hover:bg-[#A58077] hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
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
