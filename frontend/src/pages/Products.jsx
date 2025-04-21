import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Loader from "../components/Loader";

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
          type: selectedType,
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
      <div className="mb-6">
        <div className="text-sm text-[#A58077] mb-2">Home &gt; Product</div>
        <h1 className="text-5xl font-bold">
          <span className="text-[#E5CBBE]">P</span>roduct
        </h1>
      </div>

      {/* Filters */}
<div className="flex justify-end gap-4 mb-10">
  <Dropdown title="Color">
    <div className="text-sm text-[#181818]">Coming soon</div>
  </Dropdown>
  <Dropdown title="Type">
    {["Furniture", "Lighting", "Decor", "Office"].map((type) => (
      <div
        key={type}
        className="px-4 py-2 cursor-pointer hover:bg-[#A58077] hover:text-white rounded"
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
      onChange={(e) => setPriceRange(e.target.value)}
      className="w-full"
    />
  </Dropdown>
</div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader size={60} />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => {
            const isFeatured = index === 5;
            return (
              <div
                key={product._id}
                className={`relative overflow-hidden text-[#181818] rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isFeatured ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
                onClick={() => handleCardClick(product._id)}
              >
                <img
                  src={product.filePath}
                  alt={product.name}
                  className={`w-full object-cover ${
                    isFeatured ? "h-[500px]" : "h-64"
                  }`}
                />

                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 w-full bg-black/40 px-4 py-3 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">{product.name}</h3>
                  <span className="text-[#E5CBBE] font-bold">${product.price}</span>
                </div>

                {/* Wishlist Icon */}
                <button
                  className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full text-[#A58077] hover:text-[#181818] transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product._id);
                  }}
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
        <div className="flex justify-center items-center gap-3">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full border transition-all ${
                currentPage === i + 1
                  ? "bg-[#A58077] text-white"
                  : "bg-[#E5CBBE] text-[#181818]"
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
        className="px-6 py-2 rounded-lg text-white hover:bg-[#A58077] hover:text-[#181818] transition"
      >
        {title}
      </button>
      {open && (
        <div className="absolute top-full mt-2 z-10 bg-[#E5CBBE] text-[#181818] rounded-lg shadow-lg p-4 min-w-[180px]">
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
